import os
import io
from typing import Dict, List, Union, Any, Optional, Tuple
from django.utils.text import slugify
from django.utils import timezone
from django.core.files.uploadedfile import InMemoryUploadedFile, UploadedFile
from PIL import Image
import sys

def default_response(success: bool, 
                     message: str = "",
                     data: Union[Dict[str, str], List[Dict[str, str] | str], bool] = False) -> Dict[str,
                                                                                              Union[bool,
                                                                                                    str,
                                                                                                    Dict[str, str],
                                                                                                    List[Dict[str, str] | str]
                                                                                                    ]
                                                                                              ]:
    """
    Defines a standard response dictionary.
    
    Args:
        success (bool): Indicates if the operation was successful.
        message (str): Message describing the result of the operation.
        data (Union[Dict[str, str], List[Dict[str, str]], bool], optional): Additional data to include in the response. Defaults to False.

    Returns:
        Dict[str, Union[bool, str, Dict[str, str], List[Dict[str, str]]]]: Standardized response dictionary.
    """
    
    if data:
        return {
            "sucesso": success,
            "mensagem": message,
            "data": [d for d in data] if isinstance(data, list) else data
        }
        
    return {
        "sucesso": success,
        "mensagem": message
    }


def rename_file_for_s3(instance: Any, filename: str):
    """
    Renomeia o arquivo para um formato padrão sendo ele: nome ( ou titulo ) do objeto + Data atual incluindo segundos.
    
    Args:
        filename (str): Nome do arquivo com a extensão (.pdf, .png, etc).
        instance (Any): Qualquer que seja o tipo de instância.
    """
    ext = filename.split('.')[-1]
    
    if instance.title:
        filename_base = slugify(instance.title)
    else:
        filename_base = "arquivo_sem_titulo"

    current_time = timezone.now().strftime('%Y-%m-%d_%H-%M-%S')

    new_filename = f"{filename_base}_{current_time}.{ext}"
    
    return os.path.join('attached_documents/', new_filename)


def optimize_image(
    image_file: UploadedFile,
    max_width: int = 1920,
    max_height: int = 1920,
    quality: int = 85,
    convert_to_jpeg: bool = True
) -> Optional[InMemoryUploadedFile]:
    """
    Optimizes an image by resizing and compressing it before upload to S3.
    
    Args:
        image_file (UploadedFile): The uploaded image file.
        max_width (int): Maximum width in pixels. Default: 1920.
        max_height (int): Maximum height in pixels. Default: 1920.
        quality (int): JPEG quality (1-100). Default: 85.
        convert_to_jpeg (bool): Convert PNG/other formats to JPEG. Default: True.
    
    Returns:
        InMemoryUploadedFile: Optimized image file, or None if not an image.
    """
    # Check if file is an image
    if not image_file.content_type or not image_file.content_type.startswith('image/'):
        return None
    
    try:
        # Open the image
        img = Image.open(image_file)
        
        # Convert RGBA to RGB if necessary (for JPEG compatibility)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create a white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Get original dimensions
        original_width, original_height = img.size
        
        # Calculate new dimensions maintaining aspect ratio
        if original_width <= max_width and original_height <= max_height:
            # Image is already smaller than max dimensions
            new_width, new_height = original_width, original_height
        else:
            # Calculate scaling factor
            width_ratio = max_width / original_width
            height_ratio = max_height / original_height
            ratio = min(width_ratio, height_ratio)
            
            new_width = int(original_width * ratio)
            new_height = int(original_height * ratio)
        
        # Resize image if needed
        if new_width != original_width or new_height != original_height:
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Determine output format
        output_format = 'JPEG'
        if not convert_to_jpeg and image_file.content_type in ['image/png', 'image/gif', 'image/webp']:
            # Keep original format for PNG/GIF/WebP if convert_to_jpeg is False
            if image_file.content_type == 'image/png':
                output_format = 'PNG'
            elif image_file.content_type == 'image/gif':
                output_format = 'GIF'
            elif image_file.content_type == 'image/webp':
                output_format = 'WEBP'
        
        # Save to in-memory buffer
        output = io.BytesIO()
        
        if output_format == 'JPEG':
            img.save(output, format='JPEG', quality=quality, optimize=True)
            content_type = 'image/jpeg'
            extension = 'jpg'
        elif output_format == 'PNG':
            img.save(output, format='PNG', optimize=True)
            content_type = 'image/png'
            extension = 'png'
        elif output_format == 'WEBP':
            img.save(output, format='WEBP', quality=quality, method=6)
            content_type = 'image/webp'
            extension = 'webp'
        else:
            img.save(output, format=output_format, optimize=True)
            content_type = image_file.content_type
            extension = image_file.name.split('.')[-1] if '.' in image_file.name else 'jpg'
        
        output.seek(0)
        
        # Create new InMemoryUploadedFile
        original_name = image_file.name
        if '.' in original_name:
            name_without_ext = '.'.join(original_name.split('.')[:-1])
        else:
            name_without_ext = original_name
        
        new_filename = f"{name_without_ext}.{extension}"
        
        optimized_file = InMemoryUploadedFile(
            output,
            None,
            new_filename,
            content_type,
            sys.getsizeof(output),
            None
        )
        
        return optimized_file
        
    except Exception as e:
        # If optimization fails, return None to use original file
        print(f"Image optimization failed: {str(e)}")
        return None

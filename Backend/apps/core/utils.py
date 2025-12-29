import os
import io
from typing import Dict, List, Union, Any, Optional, Tuple, Set
from django.utils.text import slugify
from django.utils import timezone
from django.core.files.uploadedfile import InMemoryUploadedFile, UploadedFile
from django.core.files.storage import default_storage
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
        return None


def get_all_database_file_paths() -> Dict[str, Set[str]]:
    """
    Retrieves all file paths referenced in the database.
    
    Returns:
        Dict[str, Set[str]]: Dictionary with categories as keys and sets of file paths as values.
            Categories: 'active', 'detached', 'defaults'
    """
    from apps.APIEmpresa.models import Enterprise
    from apps.APISetor.models import Sector
    from apps.APIUser.models import AbsUser
    from apps.APIDocumento.models import Attached_Files_Document
    
    active_files: Set[str] = set()
    detached_files: Set[str] = set()
    default_files: Set[str] = set()
    
    # Enterprise images
    for enterprise in Enterprise.objects.exclude(image__isnull=True).exclude(image=''):
        if enterprise.image:
            path = str(enterprise.image)
            if 'templates' in path or 'default' in path.lower():
                default_files.add(path)
            else:
                active_files.add(path)
    
    # Sector images
    for sector in Sector.objects.exclude(image__isnull=True).exclude(image=''):
        if sector.image:
            path = str(sector.image)
            if 'templates' in path or 'default' in path.lower():
                default_files.add(path)
            else:
                active_files.add(path)
    
    # User images
    for user in AbsUser.objects.exclude(image__isnull=True).exclude(image=''):
        if user.image:
            path = str(user.image)
            if 'templates' in path or 'default' in path.lower():
                default_files.add(path)
            else:
                active_files.add(path)
    
    # Attached files - active (not detached)
    for attached_file in Attached_Files_Document.objects.filter(detached_at__isnull=True).exclude(file__isnull=True).exclude(file=''):
        if attached_file.file:
            path = str(attached_file.file)
            active_files.add(path)
    
    # Attached files - detached (soft deleted)
    for attached_file in Attached_Files_Document.objects.filter(detached_at__isnull=False).exclude(file__isnull=True).exclude(file=''):
        if attached_file.file:
            path = str(attached_file.file)
            detached_files.add(path)
    
    return {
        'active': active_files,
        'detached': detached_files,
        'defaults': default_files
    }


def get_s3_media_files(prefix: str = 'media/') -> Set[str]:
    """
    Lists all files in S3 media folder.
    
    Args:
        prefix (str): S3 prefix to list files from. Default: 'media/'
    
    Returns:
        Set[str]: Set of file paths in S3 (relative to bucket root)
    """
    s3_files: Set[str] = set()
    
    try:
        # Use boto3 directly to list S3 files
        import boto3
        from django.conf import settings
        
        # Get AWS credentials from settings
        aws_region = os.getenv('AWS_S3_REGION_NAME')
        if getattr(settings, 'DEBUG', True):
            aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID_DEVELOPMENT')
            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY_DEVELOPMENT')
            bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME_DEVELOPMENT')
        else:
            aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY_PRODUCTION')
            bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME_PRODUCTION')
        
        if not all([aws_access_key_id, aws_secret_access_key, aws_region, bucket_name]):
            raise ValueError("AWS credentials not properly configured in settings")
        
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region
        )
        
        # Use paginator to handle large numbers of files
        paginator = s3_client.get_paginator('list_objects_v2')
        
        for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
            if 'Contents' in page:
                for obj in page['Contents']:
                    # Only add files, not "directories" (objects ending with /)
                    if not obj['Key'].endswith('/'):
                        s3_files.add(obj['Key'])
    
    except Exception as e:
        raise Exception(f"Error listing S3 files: {str(e)}")
    
    return s3_files


def find_orphaned_s3_files(
    include_detached: bool = False,
    include_defaults: bool = False
) -> Tuple[Set[str], Dict[str, int]]:
    """
    Finds orphaned files in S3 that are not referenced in the database.
    
    Args:
        include_detached (bool): If True, also considers detached files as orphaned. Default: False
        include_defaults (bool): If True, also considers default images as orphaned. Default: False
    
    Returns:
        Tuple[Set[str], Dict[str, int]]: 
            - Set of orphaned file paths (with 'media/' prefix)
            - Statistics dictionary with counts
    """
    from django.conf import settings
    
    # Get S3 location prefix from settings
    s3_location = getattr(settings, 'STORAGES', {}).get('default', {}).get('OPTIONS', {}).get('location', 'media')
    if not s3_location.endswith('/'):
        s3_location += '/'
    
    # Get all files from database
    db_files = get_all_database_file_paths()
    
    # Get all files from S3
    s3_files = get_s3_media_files(s3_location)
    
    # Normalize paths for comparison (remove location prefix)
    def normalize_path(path: str) -> str:
        """Remove S3 location prefix and normalize path."""
        path = path.replace('\\', '/')
        if path.startswith(s3_location):
            return path[len(s3_location):]
        if path.startswith('media/'):
            return path[6:]
        return path
    
    db_active_normalized = {normalize_path(f) for f in db_files['active']}
    db_detached_normalized = {normalize_path(f) for f in db_files['detached']}
    db_defaults_normalized = {normalize_path(f) for f in db_files['defaults']}
    s3_normalized = {normalize_path(f) for f in s3_files}
    
    # Find orphaned files
    orphaned = s3_normalized.copy()
    
    # Remove active files from orphaned set
    orphaned -= db_active_normalized
    
    # Optionally remove detached files
    if not include_detached:
        orphaned -= db_detached_normalized
    
    # Optionally remove default files
    if not include_defaults:
        orphaned -= db_defaults_normalized
    
    # Add location prefix back for deletion (use original S3 paths)
    orphaned_with_prefix = set()
    for orphaned_file in orphaned:
        # Find the original S3 path
        for s3_file in s3_files:
            if normalize_path(s3_file) == orphaned_file:
                orphaned_with_prefix.add(s3_file)
                break
    
    stats = {
        'total_s3_files': len(s3_files),
        'active_db_files': len(db_files['active']),
        'detached_db_files': len(db_files['detached']),
        'default_db_files': len(db_files['defaults']),
        'orphaned_files': len(orphaned_with_prefix)
    }
    
    return orphaned_with_prefix, stats


def delete_s3_files(file_paths: Set[str], dry_run: bool = True) -> Dict[str, Any]:
    """
    Deletes files from S3.
    
    Args:
        file_paths (Set[str]): Set of file paths to delete (with 'media/' prefix)
        dry_run (bool): If True, only simulates deletion. Default: True
    
    Returns:
        Dict[str, Any]: Results dictionary with success/failure counts
    """
    results = {
        'success': 0,
        'failed': 0,
        'errors': []
    }
    
    if dry_run:
        results['success'] = len(file_paths)
        results['message'] = f"DRY RUN: Would delete {len(file_paths)} files"
        return results
    
    try:
        for file_path in file_paths:
            try:
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
                    results['success'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"File not found: {file_path}")
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Error deleting {file_path}: {str(e)}")
    
    except Exception as e:
        results['errors'].append(f"Critical error: {str(e)}")
    
    results['message'] = f"Deleted {results['success']} files, {results['failed']} failed"
    return results

import boto3
from io import BytesIO
from celery import shared_task
from django.conf import settings
from PIL import Image
from pdf2image import convert_from_bytes
from apps.APIDocumento.models import MediaAsset
import sys
import os
import subprocess
from celery import shared_task

@shared_task
def process_media_asset(asset_id):
    """
    Async job to generate thumbnails for PDFs and images.
    """
    POPPLER_BIN_PATH = 'C:\\Program Files\\poppler-25.12.0\\Library\\bin'
    
    exe_path = os.path.join(POPPLER_BIN_PATH, 'pdfinfo.exe')
    
    try:
        resultado = subprocess.run([exe_path, "-v"], capture_output=True, text=True)
    except Exception as e:
        return f"Erro de Execução: \n\n{e}"
    
    # PRODUÇÃO!!!
    if sys.platform != 'win32':
        POPPLER_BIN_PATH = None
        
    try:
        asset = MediaAsset.objects.get(id=asset_id)
        asset.processing_status = 'PROCESSING'
        asset.save()

        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        print(f"[Celery] Baixando arquivo: {asset.file_path}")
        
        file_obj = s3.get_object(Bucket=bucket_name, Key=asset.file_path)
        file_content = file_obj['Body'].read()
        
        thumb_io = BytesIO()
        file_type = asset.content_type

        if 'pdf' in file_type:
            pages = convert_from_bytes(file_content, first_page=1, last_page=1, fmt='jpeg', poppler_path=POPPLER_BIN_PATH)
            if pages:
                image = pages[0]
                image.thumbnail((400, 400)) # Redimensiona para max 400px
                image.save(thumb_io, format='JPEG', quality=80)
        
        elif 'image' in file_type:
            image = Image.open(BytesIO(file_content))
            image.thumbnail((400, 400))
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            image.save(thumb_io, format='JPEG', quality=80)
        
        else:
            print(f"[Celery] Tipo não suportado para preview: {file_type}")
            asset.processing_status = 'DONE' # Finaliza sem thumb
            asset.save()
            return "Skipped"

        thumb_path = f"thumbnails/{asset.id}.jpg"
        thumb_io.seek(0)
        
        print(f"[Celery] Subindo thumbnail: {thumb_path}")
        s3.put_object(
            Bucket=bucket_name,
            Key=thumb_path,
            Body=thumb_io,
            ContentType='image/jpeg'
        )

        asset.thumbnail_path = thumb_path
        asset.processing_status = 'DONE'
        asset.save()
        
        return "Success"

    except Exception as e:
        print(f"[Celery Error] Falha ao processar asset {asset_id}: {str(e)}")
        asset = MediaAsset.objects.get(id=asset_id)
        asset.processing_status = 'ERROR'
        asset.save()
        raise e
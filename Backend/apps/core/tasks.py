import os
import sys
import boto3
import subprocess
from celery import shared_task
from django.conf import settings
from io import BytesIO
from PIL import Image
from pdf2image import convert_from_bytes
from urllib.parse import urlparse, unquote
from apps.APIDocumento.models import Document
import time
from dotenv import load_dotenv

load_dotenv(".env")

if (os.getenv("DEBUG", 'False').lower() in ("true", "1", "t", "y", "yes", "on")):
    boto3.set_stream_logger('botocore', level='DEBUG') # type: ignore

@shared_task
def process_media_asset(document_id):
    """
    Async job to generate thumbnails for PDFs and images.
    """
    POPPLER_BIN_PATH = r'C:\Program Files\poppler-25.12.0\Library\bin'
    
    if sys.platform == 'win32':
        exe_path = os.path.join(POPPLER_BIN_PATH, 'pdfinfo.exe')
        if not os.path.exists(exe_path):
            print(f"[Celery Error] Poppler não encontrado em: {exe_path}")
    else:
        POPPLER_BIN_PATH = None # Linux/Produção usa PATH do sistema

    try:
        document = Document.objects.get(pk=document_id)

        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        raw_url = str(document.file_url)
        print(f"[Celery] URL Bruta no Banco: {raw_url}")

        if raw_url.startswith('http'):
            parsed = urlparse(raw_url)
            clean_path = parsed.path
        else:
            clean_path = raw_url

        file_key = unquote(clean_path.lstrip('/'))
        file_key = "media/" + file_key if not file_key.startswith("media/") else file_key
        
        print(f"[Celery] Key Limpa para o S3: '{file_key}'") 
        file_obj = None
        tentativas = 0
        max_tentativas = 5
        
        while tentativas < max_tentativas:
            try:
                file_obj = s3.get_object(Bucket=bucket_name, Key=file_key)
                print("[Celery] Arquivo encontrado e baixado!")
                break
            except s3.exceptions.NoSuchKey:
                print(f"[Celery] Arquivo ainda não encontrado no S3... tentativa {tentativas+1}")
                time.sleep(5)
                tentativas += 1
            except Exception as e:
                print(f"[Celery] Erro genérico S3: {e}")
                raise e

        if file_obj is None:
            raise Exception(f"S3 NoSuchKey: O arquivo '{file_key}' não apareceu no bucket após várias tentativas.")

        file_content = file_obj['Body'].read()
        thumb_io = BytesIO()
        
        file_ext = file_key.split('.')[-1].lower()

        if 'pdf' in file_ext:
            print("[Celery] Convertendo PDF...")
            pages = convert_from_bytes(
                file_content, 
                first_page=1, 
                last_page=1, 
                fmt='jpeg', 
                poppler_path=POPPLER_BIN_PATH
            )
            if pages:
                image = pages[0]
                image.thumbnail((400, 400))
                image.save(thumb_io, format='JPEG', quality=80)
            else:
                print("[Celery] PDF vazio ou ilegível.")
                return "Empty PDF"
        
        elif file_ext in ['jpg', 'jpeg', 'png', 'webp']:
            print("[Celery] Convertendo Imagem...")
            image = Image.open(BytesIO(file_content))
            image.thumbnail((400, 400))
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            image.save(thumb_io, format='JPEG', quality=80)
        
        else:
            print(f"[Celery] Tipo não suportado: {file_ext}")
            return "Skipped"

        thumb_filename = f"thumb_{document.pk}_{int(time.time())}.jpg"
        thumb_path = f"thumbnails/{thumb_filename}"
        
        thumb_io.seek(0)
        
        print(f"[Celery] Subindo thumbnail para: {thumb_path}")
        s3.put_object(
            Bucket=bucket_name,
            Key="media/" + thumb_path,
            Body=thumb_io,
            ContentType='image/jpeg'
        )
        document.thumbnail_path = thumb_path # type: ignore
        document.save()
        
        return "Success"

    except Exception as e:
        print(f"[Celery Error] Fatal: {str(e)}")
        raise e
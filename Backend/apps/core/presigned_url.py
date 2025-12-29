import boto3
from django.conf import settings

def generate_presigned_url(file_path, expiration=3600) -> None | str:
    if not file_path:
        return None
        
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )
    
    try:
        response = s3_client.generate_presigned_url('get_object',
            Params={
                'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                'Key': file_path
            },
            ExpiresIn=expiration
        )
        return response
    except Exception as e:
        return None
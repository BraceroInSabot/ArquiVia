from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from apps.core.get_request_user import current_request

from .models import AuditLog
from apps.APIDocumento.models import (Category, Classification)
from apps.APISetor.models import Sector
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model

from django.db.models.fields.files import FieldFile, ImageFieldFile
from decimal import Decimal
import datetime

User = get_user_model()

MODELS_TO_AUDIT = [Category, Sector, Enterprise, Classification, User]

def sanitize_data(data):
    """
    Percorre o dicionário e converte objetos não serializáveis em JSON
    (como Imagens, Arquivos, Decimals, UUIDs) em strings ou formatos simples.
    """
    clean_data = {}
    for key, value in data.items():
        if isinstance(value, FieldFile):
            clean_data[key] = value.name if value else None
        
        elif isinstance(value, ImageFieldFile):
            clean_data[key] = value.name if value else None
            
        elif isinstance(value, Decimal):
            clean_data[key] = float(value)

        elif isinstance(value, (datetime.date, datetime.datetime)):
            clean_data[key] = value.isoformat()
            
        else:
            clean_data[key] = value
            
    return clean_data

def convert_img_model_to_img_name(instance):
    model_conversion = model_to_dict(instance)

    if model_conversion.get('image'):
        model_conversion['image'] = model_conversion['image'].name

    return model_conversion

def get_changes_json(instance, created):
    """
    Gera o JSON para o campo 'changes'.
    """
    model_conversion = convert_img_model_to_img_name(instance)
    
    final_state = sanitize_data(model_conversion)

    if created:
        return {"new_state": final_state}
    
    return {"current_state": final_state}

@receiver(post_save)
def log_save_handler(sender, instance, created, **kwargs):
    """
    Captura inserções (+) e edições (~).
    """
    if sender not in MODELS_TO_AUDIT:
        return

    user = current_request().user # type: ignore

    action_code = '+' if created else '~'
    try:
        AuditLog.objects.create(
            actor=user,
            action=action_code,
            target_model=sender.__name__,
            target_id=instance.pk,         
            target_str=str(instance)[:200], 
            changes=get_changes_json(instance, created)
        )
    except Exception as e:
        print(f"Erro ao salvar AuditLog: {e}")

@receiver(post_delete)
def log_delete_handler(sender, instance, **kwargs):
    """
    Captura deleções (-).
    """
    if sender not in MODELS_TO_AUDIT:
        return

    user = current_request().user # type: ignore
    
    raw_data = model_to_dict(instance)
    
    final_state = sanitize_data(raw_data)

    AuditLog.objects.create(
        actor=user,
        action='-',
        target_model=sender.__name__,
        target_id=instance.pk,
        target_str=str(instance)[:200],
        changes={"deleted_state": final_state}
    )
    
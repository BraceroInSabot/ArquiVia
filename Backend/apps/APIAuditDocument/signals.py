from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from apps.core.get_request_user import current_request

from .models import AuditLog
from apps.APIDocumento.models import (Category, Classification)
from apps.APISetor.models import Sector
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model

User = get_user_model()

MODELS_TO_AUDIT = [Category, Sector, Enterprise, Classification, User]

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

    if created:
        return {"new_state": model_conversion}
    
    return {"current_state": model_conversion}

@receiver(post_save)
def log_save_handler(sender, instance, created, **kwargs):
    """
    Captura inserções (+) e edições (~).
    """
    if sender not in MODELS_TO_AUDIT:
        return

    user = current_request().user # type: ignore

    action_code = '+' if created else '~'
    print(1, instance, created)
    print(2, get_changes_json(instance, created))
    # print(get_changes_json(instance, created)['current_state']['image'].name)
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

    model_conversion = convert_img_model_to_img_name(instance)

    AuditLog.objects.create(
        actor=user,
        action='-',
        target_model=sender.__name__,
        target_id=instance.pk,
        target_str=str(instance)[:200],
        changes={"deleted_state": model_conversion}
    )
    
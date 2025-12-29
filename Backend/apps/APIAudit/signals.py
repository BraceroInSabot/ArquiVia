from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.forms.models import model_to_dict
from apps.core.get_request_user import current_request

from .models import AuditLog
from apps.APIDocumento.models import Document
from apps.APIDocumento.models import (Category, Classification)
from apps.APISetor.models import Sector
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model

from django.db.models.fields.files import FieldFile, ImageFieldFile
from decimal import Decimal
import datetime

from json import JSONDecoder

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
    model_conversion = model_to_dict(instance, exclude=['groups', 'user_permissions', 'password', 'last_login'])

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
        pass

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
    
def extract_text_from_json(node):
    """
    Função recursiva que varre o JSON e retorna APENAS o texto visível.
    Ignora chaves, formatação e, principalmente, IMAGENS.
    
    formato do JSON:
    {
    "root": {
        "children": [
        {
            "children": [
            {
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Contratos para professores",
                "type": "text",
                "version": 1
            }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "paragraph",
            "version": 1,
            "textFormat": 0,
            "textStyle": ""
        },
    """    
    node_json = JSONDecoder().decode(node) if isinstance(node, str) else node
    paragraphs_ctx = [ctx['children'][0]['text'] for ctx in node_json['root']['children'] if len(ctx['children']) > 0 and 'text' in ctx['children'][0]]
    paragraphs_ctx = " ".join(paragraphs_ctx)
    
    return paragraphs_ctx

@receiver(pre_save, sender=Document)
def update_search_content(sender, instance, **kwargs):
    """
    Antes de salvar o documento, extrai o texto limpo do JSON
    e salva no campo search_content.
    """
    if instance.content:
        raw_text = extract_text_from_json(instance.content)
        instance.search_content = raw_text[:500000] # Limita a 500k caracteres
    else:
        instance.search_content = ""
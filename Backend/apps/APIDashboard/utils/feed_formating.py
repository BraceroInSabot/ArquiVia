from django.db.models import QuerySet
from typing import List, Dict


def format_activity_feed(doc_histories: QuerySet):
    """
    Funde e ordena logs de tabelas diferentes em uma timeline única.
    """
    feed: List[Dict[str, str | Dict[str, int | None]]] = []

    for h in doc_histories:
        verb = {'+': 'criou', '~': 'editou', '-': 'excluiu'}.get(h.history_type, 'alterou')
        doc_name = h.title
        
        feed.append({
            'timestamp': h.history_date,
            'user': h.history_user.name if h.history_user else 'Usuário',
            'action_type': h.history_type,
            'message': f"{h.history_user.name if h.history_user else 'Sistema'} {verb} o documento '{doc_name}'",
            'metadata': {'document_id': h.document_id, 'user_id': h.history_user.user_id if h.history_user else None}
        })

    feed.sort(key=lambda x: x['timestamp'], reverse=True) # type: ignore
    
    return feed[:20]
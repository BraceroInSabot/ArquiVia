FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY Backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY Backend/. /app/

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "arquivia.wsgi:application"]
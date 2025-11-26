# Arquivia

A modern document management system built with Django REST Framework and React, designed for efficient document organization, classification, and audit tracking.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **Document Management**: Create, edit, and organize documents with rich text editing capabilities
- **Document Classification**: Categorize and classify documents with custom categories
- **Audit Trail**: Complete audit logging for all document operations
- **User Management**: Multi-user system with role-based access control
- **Enterprise & Sector Management**: Organize documents by enterprise and sector
- **Dashboard**: Comprehensive dashboard with metrics and activity feeds
- **Authentication**: Secure JWT-based authentication system
- **File Storage**: AWS S3 integration for document storage

## 🛠 Tech Stack

### Backend

- **Framework**: Django 5.2.7
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Storage**: AWS S3 (boto3, django-storages)
- **History Tracking**: django-simple-history
- **Testing**: pytest, pytest-django
- **Server**: Gunicorn

### Frontend

- **Framework**: React 18.3
- **Language**: TypeScript
- **Build Tool**: Vite
- **Rich Text Editor**: Lexical
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Lucide React
- **Notifications**: React Hot Toast

### DevOps

- **Containerization**: Docker
- **Orchestration**: microk8s (deployment, service, ingress configurations)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.12+
- **Node.js** 18+ and npm
- **PostgreSQL** 12+
- **Docker** (optional, for containerized deployment and db image)
- **AWS Account** (for S3 storage, if using cloud storage)

## 📁 Project Structure

```
ArquiVia/
├── Backend/                 # Django backend application
│   ├── apps/               # Django apps
│   │   ├── APIDocumento/   # Document management
│   │   ├── APIAudit/ # Audit logging
│   │   ├── APIDashboard/   # Dashboard API
│   │   ├── APIUser/        # User management
│   │   ├── APIEmpresa/     # Enterprise management
│   │   └── APISetor/       # Sector management
│   ├── arquivia/           # Django project settings
│   └── manage.py
├── Frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
└── Dockerfile              # Docker configuration
```

## 🤝 Contributing

For better organization, a method for organizing branches
and commits has been implemented. It is only used from
version 0.0.1-alpha onwards.

### Branch Standards

Branch types:

- `main` (production)
- `hotfix <name>` (urgent fixes in main)
- `feature <name>` (feature implementation)
- `qa <feature-name>` (feature testing)

### Commit Standards

All commits are standardized with the following structure: `semantic (keyword): description of what was done`

**Example:**

```
fix (oAuth): Authentication will be stored in local cache
```

**Possible semantics and their purpose:**

- **chore**
  - Infrastructure changes in development or production environment. No changes to source code.
- **feat**
  - Implementation of functionality in the system.
- **fix**
  - Bug fix or system adaptation for external variables (bug prevention).
- **ref**
  - Source code changes for small code modifications that may change business rules.
- **style**
  - Styling changes, without changes to business rules.

## 📄 License

🚧 To be continued 🚧

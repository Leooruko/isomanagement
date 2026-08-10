# ISO 22000 Food Safety Management System

A system for managing ISO 22000 compliance — documents, HACCP, PRPs, and
suppliers — for food processing and dairy facilities.

## What this addresses

Food businesses working toward ISO 22000 certification have to manage HACCP
plans, prerequisite programs, supplier approvals, and compliance documents —
usually spread across spreadsheets, paper files, and whatever system each
department happens to use. Audit season turns into weeks of manually
cross-referencing records that should already be organized. This system
keeps documents, HACCP data, PRP tracking, and supplier records in one
place instead.

**Who this is for:** food processing and dairy facilities operating under,
or preparing for, ISO 22000 certification — quality managers, compliance
officers, and the people currently doing this cross-referencing by hand.

**What it enables:** one system for documents, HACCP records, PRP tracking,
and supplier data, instead of that information being split across
spreadsheets and paper files.

**My role:** designed and built solo — data model, backend API, and
frontend.

**Status:** This was my first build of this system — functionally complete
(auth, dashboard, documents, HACCP, PRP, suppliers) and the reference
implementation for the domain model. I'm now rebuilding the same system
with a stronger foundation (typed ORM, migrations, documented workflow) at
[`fsms_iso22000`](https://github.com/Leooruko/fsms_iso22000) as active
work. This repo stays up as a complete, working reference.

## 🏗️ Project Structure

```
isomanagement/
├── backend/                 # FastAPI backend
│   ├── app/                # Application code
│   ├── venv/               # Python virtual environment (excluded from git)
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # FastAPI application entry point
├── frontend/               # React frontend
│   ├── src/               # React source code
│   ├── package.json       # Node.js dependencies
│   └── public/            # Static files
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Git**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd isomanagement
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the database**
   ```bash
   python reset_database.py
   ```

5. **Start the backend server**
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   The API will be available at: http://localhost:8000
   API Documentation: http://localhost:8000/docs

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

   The frontend will be available at: http://localhost:3000

## 🔐 Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

*(Local development seed data only — change before any real deployment.)*

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

### Dashboard
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/dashboard/recent-activity` - Recent activities

### Documents
- `GET /api/v1/documents/` - List documents
- `POST /api/v1/documents/` - Create document
- `GET /api/v1/documents/{id}` - Get document
- `PUT /api/v1/documents/{id}` - Update document
- `DELETE /api/v1/documents/{id}` - Delete document

### HACCP
- `GET /api/v1/haccp/products/` - List HACCP products
- `POST /api/v1/haccp/products/` - Create HACCP product

### PRP
- `GET /api/v1/prp/programs/` - List PRP programs
- `POST /api/v1/prp/programs/` - Create PRP program

### Suppliers
- `GET /api/v1/suppliers/` - List suppliers
- `POST /api/v1/suppliers/` - Create supplier

## 🛠️ Development

### Backend Development

The backend is built with:
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **SQLite** - Database (can be changed to PostgreSQL for production)

### Frontend Development

The frontend is built with:
- **React** - JavaScript library for building user interfaces
- **TypeScript** - Typed JavaScript
- **Material-UI** - React component library
- **Redux Toolkit** - State management

## 📁 Important Files

### Backend
- `backend/app/main.py` - FastAPI application
- `backend/app/core/config.py` - Configuration settings
- `backend/app/models/` - Database models
- `backend/app/api/v1/endpoints/` - API endpoints
- `backend/requirements.txt` - Python dependencies

### Frontend
- `frontend/src/App.tsx` - Main React component
- `frontend/src/pages/` - Page components
- `frontend/src/components/` - Reusable components
- `frontend/src/services/api.ts` - API service
- `frontend/package.json` - Node.js dependencies

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./iso22000_fsms.db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
DEBUG=true
ENVIRONMENT=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

## 🚀 Deployment

### Production Setup

1. **Backend**
   - Use PostgreSQL instead of SQLite
   - Set `DEBUG=false`
   - Use a strong `SECRET_KEY`
   - Configure proper CORS settings

2. **Frontend**
   - Build the production version: `npm run build`
   - Serve static files with a web server like Nginx

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository. 

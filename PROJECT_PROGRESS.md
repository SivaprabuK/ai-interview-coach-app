# AI Interview Coach

An AI-powered interview preparation platform designed to help developers practice technical interview questions, improve their answers, and prepare for software engineering interviews.

## Project Goals

- Practice technical interview questions.
- Receive AI-assisted feedback on submitted answers.
- Upload technical documents and ask questions based on their content.
- Track interview preparation progress and identify improvement areas.
- Build a full-stack application using modern backend, frontend, and AI technologies.

## Technology Stack

### Backend
- Python 3.13
- FastAPI
- Pydantic Settings
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT Authentication
- Pytest

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React

### AI and Development Tools
- Google Gemini API
- LLM-based question generation and answer evaluation
- RAG (Retrieval-Augmented Generation)
- Text embeddings
- LangChain
- PostgreSQL with pgvector
- Git and GitHub
- Docker
- GitHub Actions for CI/CD

## Project Structure

```text
ai-interview-coach/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── uploads/
│   ├── alembic/
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
├── frontend/
├── .gitignore
└── README.md
```

## Current Progress

### Backend Development

- [x] Initialize the Git repository and configure GitHub.
- [x] Set up the Python backend environment.
- [x] Create the FastAPI application.
- [x] Implement root and health-check endpoints.
- [x] Add configuration management using Pydantic Settings.
- [x] Configure PostgreSQL database integration.
- [x] Integrate SQLAlchemy ORM.
- [x] Implement database migrations using Alembic.
- [x] Implement user registration and authentication.
- [x] Implement JWT-based authentication and authorization.
- [x] Implement access and refresh token management.
- [x] Implement logout and session revocation.
- [x] Implement interview session management.
- [x] Implement interview question generation.
- [x] Implement answer evaluation and session results functionality.
- [x] Implement user-specific access control for interview resources.
- [x] Implement interview history APIs.
- [x] Implement performance insights API.
- [x] Calculate evaluation metrics, average scores, and score trends.
- [x] Identify frequently mentioned strengths and improvement areas.

### Document-Based RAG Module

- [x] Implement PDF and DOCX document upload.
- [x] Add file extension and file size validation.
- [x] Extract text from uploaded documents.
- [x] Implement document chunking with overlap.
- [x] Generate text embeddings using Gemini.
- [x] Configure PostgreSQL pgvector for vector storage.
- [x] Implement similarity-based document retrieval.
- [x] Add similarity threshold filtering.
- [x] Implement user-specific document retrieval.
- [x] Generate answers using retrieved document context.
- [x] Add fallback responses when relevant information is unavailable.
- [x] Implement document upload, listing, and question-answering APIs.
- [x] Add document module tests (12 tests passing).

### Frontend Development

- [x] Set up the React and TypeScript frontend.
- [x] Implement the authentication UI.
- [x] Build the dashboard based on the InterviewAI UI reference.
- [x] Develop interview session and question interfaces.
- [x] Integrate AI answer evaluation and session results.
- [x] Implement interview history interface.
- [x] Build the performance insights dashboard.
- [x] Display evaluation metrics and average scores.
- [x] Implement score trend visualization using Recharts.
- [x] Display top strengths and improvement areas.
- [x] Integrate frontend authentication with backend APIs.
- [x] Implement automatic access token refresh and retry.
- [x] Implement logout functionality.
- [x] Implement protected routes.
- [x] Verify frontend API integration and production build.
- [ ] Build the document upload and listing interface.
- [ ] Integrate document-based question answering.

### Deployment and DevOps

- [ ] Configure Docker for backend and frontend.
- [ ] Add GitHub Actions CI/CD workflows.
- [ ] Perform end-to-end testing.
- [ ] Deploy the application.

## Backend Testing Status

- [x] Initial backend tests.
- [x] Authentication and interview module tests.
- [x] Document upload and validation tests.
- [x] Document listing and user isolation tests.
- [x] Vector retrieval and user isolation tests.
- [x] Document answer generation tests.
- [x] Document question-answering API tests.
- [x] Insights API tests.
- [x] Insights service tests.
- [x] Logout and refresh token tests.

**Latest complete backend test result:** 100 passed.

## Project Status

The backend has implemented its core interview preparation functionality, authentication, database integration, document-based RAG capabilities, and performance insights.

The document Q&A module supports uploading PDF/DOCX files, extracting and embedding their content, retrieving relevant information using PostgreSQL pgvector, and generating context-based answers using Gemini.

The frontend now includes authentication, dashboard, interview workflows, interview history, and a performance insights dashboard. Frontend authentication supports automatic access token refresh, logout, and protected routes.

The next development phase focuses on completing document management and document-based Q&A frontend integration, followed by Docker configuration, CI/CD, end-to-end testing, and deployment.

This project is under active development, with a focus on clean architecture, testing, and practical AI engineering skills.
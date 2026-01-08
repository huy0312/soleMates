<<<<<<< HEAD
# SoleMates Running Club Web Application

This project is a web application for the SoleMates Running Club, featuring member management, Strava integration, and content management.

## Project Structure

The repository is organized into two main directories:

*   **`backend/`**: A Spring Boot application (Java 17+) handling the REST API, Authentication (JWT), and Database interactions.
*   **`frontend/`**: A ReactJS application (Vite) with TailwindCSS for the user interface.

## Prerequisites

*   **Java 17+** (for Backend)
*   **Node.js 16+** & **npm** (for Frontend)
*   **PostgreSQL** (Database)

## Getting Started

### 1. Database Setup

Create a PostgreSQL database named `solemates`.

```sql
CREATE DATABASE solemates;
```

Update the database credentials in `backend/src/main/resources/application.yml` if necessary (defaults are `username: postgres`, `password: password`).

### 2. Backend Setup

Navigate to the `backend` directory and run the application:

```bash
cd backend
# On Windows
.\mvnw spring-boot:run
# On Linux/Mac
./mvnw spring-boot:run
```

The backend API will run on `http://localhost:8080`.

### 3. Frontend Setup

Navigate to the `frontend` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

## Features implemented so far

*   **Backend**:
    *   Spring Boot Project Structure
    *   PostgreSQL Connection
    *   User Entity & Repository
    *   JWT Authentication (Register/Login modules)
    *   Role-based access (Member, Admin, Guest)
*   **Frontend**:
    *   React + Vite Project Structure
    *   TailwindCSS Configuration

## Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request


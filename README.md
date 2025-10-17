# Simple User API Project

A RESTful API for managing users, built with Node.js, Express, and Prisma. This project features a complete CRUD (Create, Read, Update, Delete) functionality for users, with secure endpoints protected by JWT-based authentication and authorization.

## ✨ Features

- User Registration (`/register`)
- User Login (`/login`) with JWT generation
- Securely hashed passwords using `bcryptjs`
- Protected routes for updating and deleting user profiles
- Authorization logic to ensure users can only modify their own data

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken), bcryptjs

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL

### Installation & Usage

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pongsathornhenrymadt/miniProject.git
    cd miniProject
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root of the project and add the following variables.

    ```env
    # Example .env file
    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE_NAME"
    JWT_SECRET="YOUR_SUPER_SECRET_KEY_THAT_IS_LONG_AND_RANDOM"
    ```

4.  **Run Database Migration:**
    This command will sync your database schema and create the necessary tables.
    ```bash
    npx prisma migrate dev
    ```

5.  **Start the Server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

##  API Endpoints

Below is a summary of the available API endpoints.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user. | No |
| `POST` | `/login` | Login to receive a JWT token. | No |
| `PUT` | `/users/:id` | Update a user's profile. | **Yes** |
| `DELETE` | `/users/:id` | Delete a user's profile. | **Yes** |
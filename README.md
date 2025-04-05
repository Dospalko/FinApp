# FinApp - Personal Finance Tracker 💰


FinApp is a modern, web-based personal finance tracker designed to help users manage their income, expenses, and budgets effectively. Built with React (Vite) on the frontend and Flask (Python) on the backend.

<!-- Add a screenshot of your application -->

## ✨ Features

*   User Registration & Authentication (JWT)
*   Expense & Income Tracking (CRUD operations)
*   Categorization of Transactions
*   Budget Setting & Tracking (per category)
    *   Automatic default budget creation
    *   Interactive budget adjustment
    *   Visual progress bars
*   50/30/20 Rule Status Visualization
*   Monthly/Yearly Data Filtering
*   Summary Dashboard (Income, Expenses, Balance)
*   User Profile Management (Password Change)
*   Modern UI with Animations (Tailwind CSS, Framer Motion)
*   *(Planned/Ideas: Recurring transactions, AI receipt scanning, Goals, Advanced Reports)*

## 🚀 Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Axios, React Router DOM
*   **Backend:** Python, Flask, SQLAlchemy, Flask-Migrate, Flask-Marshmallow, Flask-JWT-Extended, Flask-CORS, Gunicorn, python-dotenv, psycopg2-binary (or mysql-connector-python)
*   **Database:** PostgreSQL (Recommended) or MySQL
*   **Deployment (Example):** Render.com (Static Site + Web Service + PostgreSQL)

## ⚙️ Setup & Installation

### Prerequisites

*   Node.js (v18 or later recommended)
*   Python (v3.9 or later recommended)
*   pip (Python package installer)
*   Git
*   A PostgreSQL (recommended) or MySQL database instance (local or cloud-based)

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/[Your Name/Org]/personal-finance-tracker.git
    cd personal-finance-tracker/backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables:**
    *   Create a `.env` file in the `backend` directory (copy from `.env.example` if provided).
    *   Set the following variables:
        ```dotenv
        DATABASE_URL=postgresql://user:password@host:port/database_name # Or mysql://...
        JWT_SECRET_KEY=your_strong_random_secret_key # Generate a strong secret!
        FLASK_APP=app:create_app # Or run:app, depending on your entry point
        FLASK_ENV=development # Set to 'production' for deployment
        # Add other variables if needed (e.g., CORS_ORIGINS for production)
        ```
5.  **Database Migrations:**
    *   Initialize migrations (only the first time): `flask db init`
    *   Create migration files: `flask db migrate -m "Initial migration"`
    *   Apply migrations: `flask db upgrade`
6.  **Run the backend server:**
    ```bash
    flask run
    ```
    The backend should now be running, typically on `http://127.0.0.1:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend # From the backend directory
    # Or cd personal-finance-tracker/frontend from the root
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # Or yarn install
    ```
3.  **Configure Environment Variables:**
    *   Create a `.env.development` file in the `frontend` directory.
    *   Set the backend API URL:
        ```dotenv
        VITE_API_BASE_URL=http://127.0.0.1:5000/api
        ```
    *   *Note:* For production builds, configure `VITE_API_BASE_URL` in `.env.production` or via deployment platform environment variables.
4.  **Run the frontend development server:**
    ```bash
    npm run dev
    # Or yarn dev
    ```
    The frontend should now be accessible, typically on `http://localhost:5173`.

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, feature implementations, or documentation improvements, please feel free to contribute.

### Contribution Steps

1.  **Find an Issue or Suggest an Idea:**
    *   Check the [Issues Tab] **(Link to your GitHub Issues tab)** for existing bugs or feature requests.
    *   If you have a new idea or find a bug not listed, please create a new issue first to discuss it.
2.  **Fork the Repository:** Click the "Fork" button on the top right of the repository page.
3.  **Clone Your Fork:**
    ```bash
    git clone https://github.com/[Your GitHub Username]/personal-finance-tracker.git
    cd personal-finance-tracker
    ```
4.  **Create a New Branch:** Create a descriptive branch name for your feature or bug fix.
    ```bash
    git checkout -b feature/add-recurring-transactions
    # Or fix/resolve-budget-display-bug
    ```
5.  **Make Your Changes:** Implement your feature or fix the bug. Ensure you follow the project's coding style (consider adding linters like Flake8 for Python and ESLint/Prettier for React).
6.  **Test Your Changes:** Make sure your changes don't break existing functionality. (Adding automated tests is a great future contribution!).
7.  **Commit Your Changes:** Write clear and concise commit messages.
    ```bash
    git add .
    git commit -m "feat: Implement basic recurring transactions service"
    # Or fix: Correctly calculate remaining budget amount
    ```
8.  **Push to Your Fork:**
    ```bash
    git push origin feature/add-recurring-transactions
    ```
9.  **Open a Pull Request (PR):**
    *   Go to the original repository on GitHub.
    *   Click the "New Pull Request" button.
    *   Choose your fork and the branch you just pushed.
    *   Provide a clear title and description for your PR, linking to the relevant issue (e.g., "Closes #12").
    *   Submit the PR for review.

### Code Style

*   **Backend (Python):** Follow PEP 8 guidelines. Consider using a formatter like Black and a linter like Flake8.
*   **Frontend (React/JS/TS):** Follow standard React best practices. Consider using ESLint and Prettier for consistent formatting.




_Made with ❤️ by Dospalko_

---

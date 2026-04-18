# Project Setup Guide

## 🐍 1. Backend Setup (Python/FastAPI)

### Create and Activate the Virtual Environment

You must use a virtual environment to avoid conflicting packages.

**For Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**For Mac/Linux (bash/zsh):**
```bash
python3 -m venv venv
source venv/bin/activate
```

> You will know it worked if you see `(venv)` at the beginning of your terminal prompt.

### Install Dependencies

Once the virtual environment is active, install the required Python packages:

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

You need the MongoDB Atlas connection string to connect to the database.

1. Create a file named `.env` inside the `backend/` folder.
2. Add the connection string provided by the team lead:

```
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/hackathon_db?retryWrites=true&w=majority"
```

> ⚠️ **Never commit the `.env` file to GitHub!**

---

## 🎨 2. Frontend Setup (React/Vite)

Open a new, second terminal window, navigate to the root of the project, and enter the `frontend` directory.

```bash
cd frontend
```

### Install Dependencies

Run the Node package manager to install Vite, React, Axios, and any other frontend libraries.

```bash
npm install
```

---

## 🏃 3. Running the Application Locally

You will need **both terminals running simultaneously** to test the full stack.

### Terminal 1: Start the Backend Server

Ensure your virtual environment is still active `(venv)`.

```bash
cd backend
uvicorn main:app --reload
```

- Backend API: `http://127.0.0.1:8000`
- Interactive API docs: `http://127.0.0.1:8000/docs`

### Terminal 2: Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`

---

## 🌿 Git Workflow Reminder

To avoid merge conflicts during the sprint, follow this process for every new feature:

**1. Always pull the latest code first:**
```bash
git checkout main
git pull origin main
```

**2. Create your feature branch:**
```bash
git checkout -b feature/your-feature-name
```

**3. Commit your changes and push:**
```bash
git add .
git commit -m "Add descriptive message here"
git push -u origin feature/your-feature-name
```

**4.** Open a **Pull Request (PR)** on GitHub to merge into `main`.

---

Happy Hacking! 🚀
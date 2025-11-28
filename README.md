# TaskFlow - Modern Task Management App


TaskFlow is a modern, responsive task management application built with React, Node.js, Express, and MongoDB. It helps you organize your tasks across multiple projects with an intuitive interface.

## ✨ Features

- 📝 Create and manage tasks with titles and descriptions
- 🗂️ Organize tasks into projects
- ✅ Mark tasks as pending or completed
- 🔍 Search and filter tasks
- 📱 Responsive design that works on all devices
- 🎨 Modern UI with dark mode
- ⚡ Fast and efficient task management

## 🚀 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose ODM
- **Styling**: TailwindCSS with custom theming

## 🛠️ Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or yarn
- MongoDB (local or MongoDB Atlas)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Kshitizjain11/TaskFlow.git
cd Taskflow
```

### 2. Set Up Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with your MongoDB URI:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will be available at `http://localhost:5000`

### 3. Set Up Frontend

1. Open a new terminal and navigate to the project root directory

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 📱 Using TaskFlow

### Creating a Project
1. Click on the "+ New Project" button in the sidebar
2. Enter a name and optional description
3. Click "Create Project"

### Adding Tasks
1. Select a project from the sidebar
2. Click the "+ Add Task" button
3. Enter task details and click "Add Task"

### Managing Tasks
- ✅ Mark tasks as complete/incomplete by clicking the checkbox
- ✏️ Click the three dots (⋮) on a task to edit or delete it
- 🔍 Use the search bar to find specific tasks
- 🗂️ Filter tasks by status using the filter button

## 📂 Project Structure

```
taskflow/
├── src/                    # Frontend source code
│   ├── components/         # Reusable components
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Application entry point
├── backend/                # Backend source code
│   ├── models/             # Mongoose models
│   ├── index.js            # Express server
│   └── .env                # Environment variables
├── public/                 # Static files
├── package.json            # Frontend dependencies
└── README.md               # This file
```



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Technologies Used

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

---


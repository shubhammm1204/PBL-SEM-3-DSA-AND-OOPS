# 🍽️ Campus Bites | Smart Canteen Management System

A Smart Canteen Management System developed as part of the Semester 3 Project-Based Learning (PBL) program. The project aims to digitize traditional canteen operations through an interactive web application with user authentication, order management, and an admin portal.

## 🚀 Project Overview

Campus Bites is a web-based canteen management platform designed to simplify food ordering and canteen administration.

The application combines frontend and backend technologies with Data Structures and Algorithms (DSA) and Object-Oriented Programming (OOP) concepts to provide an organized and efficient canteen management experience.

## ✨ Key Features

### 🔐 Authentication System
- User login and signup functionality.
- Supabase Authentication integration.
- Authentication-based user sessions.
- Secure credential handling through Supabase.

### 👨‍💼 Admin Portal
- Dedicated admin login interface.
- Centralized administration interface.
- Management of canteen operations.

### 🍔 Canteen Management
- Digital food menu.
- Food ordering functionality.
- Order processing and management.
- Transaction and menu data management.

### ⚡ Technical Implementation
- Modular frontend and backend architecture.
- Organized API routes and middleware.
- Data management using structured files and database services.
- DSA-based implementation for efficient order processing.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive UI |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| Supabase | Authentication and backend services |
| Git & GitHub | Version control |

## 📂 Project Structure

```text
PBL-SEM-3-DSA-AND-OOPS/
│
├── backend/
│   ├── data/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── ...
│
├── frontend/
│   ├── js/
│   ├── admin-login.html
│   ├── admin.html
│   ├── admin.css
│   ├── admin.js
│   ├── signup.html
│   └── ...
│
├── docs/
│   ├── ADMIN_PORTAL_INTEGRATION.md
│   ├── AUTH_AND_LIVE_MENU.md
│   ├── PROJECT_STRUCTURE.md
│   └── SUPABASE_SETUP.md
│
├── supabase/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 🔑 Authentication with Supabase

Campus Bites uses Supabase Authentication to handle user authentication.

The authentication integration provides:

1. User registration through the signup interface.
2. User login using registered credentials.
3. Authentication through Supabase services.
4. Session handling for authenticated users.
5. Integration with the application's frontend.

Supabase provides authentication infrastructure without requiring the application to implement password storage and verification from scratch.

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- A Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/shubhammm1204/PBL-SEM-3-DSA-AND-OOPS.git
```

### 2. Navigate to the project

```bash
cd PBL-SEM-3-DSA-AND-OOPS
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure Supabase

1. Create a project in Supabase.
2. Open the Supabase project dashboard.
3. Obtain your Project URL and publishable/anon key.
4. Configure the credentials using the environment variables expected by your application.
5. Configure the required authentication settings in Supabase.

Example configuration:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the actual variable names expected by your source code.

**Security:** Never expose your Supabase service role key, database passwords, or other private credentials in frontend code or GitHub.

### 5. Run the application

Use the scripts configured in `package.json` to start the backend and frontend.

For example:

```bash
npm run dev
```

If frontend and backend have separate startup scripts, run them according to their respective package configurations.

## 🧠 DSA and OOP Concepts

This project is developed as part of the DSA and OOP academic curriculum.

Concepts explored include:

- Arrays and dynamic arrays
- Queues and FIFO processing
- Hash maps for efficient data lookup
- Searching and sorting
- Classes and objects
- Encapsulation
- Abstraction
- Inheritance
- Polymorphism
- Modular programming

These concepts are applied where appropriate to the application's implementation.

## 🎯 Project Objectives

- Digitize traditional canteen operations.
- Simplify food ordering and management.
- Implement authentication using Supabase.
- Apply DSA concepts to real-world problems.
- Understand full-stack application development.
- Practice modular software engineering.
- Gain experience with collaborative Git workflows.

## 🔮 Future Improvements

- Online payment gateway integration.
- Real-time order tracking.
- Advanced admin analytics dashboard.
- Improved user experience.
- Enhanced security and role-based access control.
- More efficient order management.

## 🎓 Academic Information

| Detail | Information |
|---|---|
| Project Name | Campus Bites |
| Project Type | Smart Canteen Management System |
| Semester | 3 |
| Program | B.Tech CSE |
| Institution | Graphic Era Hill University |
| Subject | Data Structures & Algorithms and OOP |

## 👨‍💻 Project Repository

GitHub: https://github.com/shubhammm1204/PBL-SEM-3-DSA-AND-OOPS

---

**Built with 💻, teamwork 🤝, and innovation 🚀**

*Campus Bites | Smart Canteen Management System*
# 🍽️ SmartCanteen — Canteen Management System

<p align="center">
  <b>A Smart Digital Solution for Campus Food Ordering & Canteen Management</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-Completed-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Language-C%2B%2B-blue?style=for-the-badge&logo=cplusplus" />
  <img src="https://img.shields.io/badge/DSA-Implemented-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/OOP-Implemented-purple?style=for-the-badge" />
</p>

---

## 📌 About The Project

**SmartCanteen** is a digital Canteen Management System developed to simplify and modernize food ordering and daily canteen operations within a college campus.

The system provides a centralized platform for managing students, food menus, orders, staff operations, and student account balances.

Developed using C++, Data Structures & Algorithms (DSA), Object-Oriented Programming (OOP), and web technologies, this project demonstrates how fundamental computer science concepts can be applied to solve real-world management problems.

The project was developed as part of the **Semester III Project-Based Learning (PBL)** curriculum at Graphic Era Hill University.

## 🏆 Project Status

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-COMPLETED-brightgreen?style=for-the-badge&logo=checkmarx" />
</p>

The project development and implementation have been completed.

- [x] Project planning and architecture
- [x] Frontend development
- [x] Backend development
- [x] C++ application logic
- [x] Student management
- [x] Food ordering functionality
- [x] Order processing
- [x] Staff management
- [x] Student balance management
- [x] API integration
- [x] DSA implementation
- [x] OOP implementation
- [x] Project documentation

## ✨ Key Features

### 👨‍🎓 Student Management
- Manage student information.
- Maintain student account balances.
- Check available balance before placing orders.

### 🍔 Food & Menu Management
- View available food items.
- Access food item details and pricing.
- Organize menu-related operations.

### 🛒 Order Management
- Create and manage food orders.
- Calculate order totals.
- Track pending and completed orders.
- Maintain table-wise order history.

### 👨‍🍳 Staff Management
- Manage staff-related operations.
- Process pending food orders.
- Update order processing status.

### 🔄 Order Processing
- FIFO-based order processing.
- Queue-based pending order management.
- Organized order status handling.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| C++ | Core application logic |
| HTML5 | Frontend structure |
| CSS3 | User interface styling |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| JSON | Data communication |
| Git & GitHub | Version control and collaboration |

## 🧠 Data Structures & Algorithms

The project demonstrates the practical application of data structures and algorithms in canteen operations.

| Data Structure / Concept | Application |
|---|---|
| Queue | FIFO-based order processing |
| Vector | Dynamic order-item management |
| Searching | Finding menu items and records |
| Sorting | Organizing data where required |

### Queue — FIFO Implementation

The pending orders are maintained using a queue.

**FIFO (First In, First Out)** ensures that the first order placed is processed before subsequent orders.

This provides a systematic and organized order-processing workflow.

## 🏗️ Object-Oriented Programming

The project implements the four fundamental principles of Object-Oriented Programming.

### 1. Encapsulation
Student information and account balances are managed through class members and controlled methods.

### 2. Inheritance
The `Student` class inherits from the `User` base class, allowing common functionality to be reused.

### 3. Polymorphism
Virtual functions and function overriding allow derived classes to provide their own implementations.

### 4. Abstraction
Classes separate internal implementation details from application-level operations.

### Additional OOP Concepts
- Classes and Objects
- Constructors and Destructors
- Virtual Functions
- Function Overriding
- Pointers
- Dynamic Memory Allocation
- Access Specifiers

## 🔌 API Integration

The system uses JSON-based communication to connect application requests with the underlying canteen management functionality.

Core application operations include:

- Student balance retrieval.
- Food order creation.
- Order processing.
- Table-wise order retrieval.
- Student and staff management.

The API layer helps connect frontend functionality with the C++ application logic.

## 🏛️ System Architecture

```text
              STUDENT / STAFF
                     |
                     v
          +----------------------+
          |       FRONTEND       |
          |    HTML / CSS / JS   |
          +----------------------+
                     |
                     v
          +----------------------+
          |        BACKEND       |
          |      Node.js / API   |
          +----------------------+
                     |
                     v
          +----------------------+
          |     C++ API LAYER    |
          |   Application Logic  |
          +----------------------+
                     |
                     v
          +----------------------+
          |    CANTEEN SYSTEM    |
          |                      |
          |  Student Management  |
          |  Order Management    |
          |  Staff Management    |
          |  Menu Management     |
          +----------------------+
```

## 📂 Project Structure

```text
PBL-SEM-3-DSA-AND-OOPS/
│
├── backend/
│   └── Backend application
│
├── frontend/
│   └── Frontend application
│
├── docs/
│   └── Project documentation
│
├── api.cpp
├── index.html
├── package.json
├── package-lock.json
├── .gitignore
│
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following tools are installed:

- Git
- Node.js
- npm
- C++ compiler (GCC / MinGW)
- Visual Studio Code (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/shubhammm1204/PBL-SEM-3-DSA-AND-OOPS.git
```

### Step 2: Navigate to the Project

```bash
cd PBL-SEM-3-DSA-AND-OOPS
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Run the Application

Navigate to the relevant frontend and backend directories and execute their configured development scripts.

For example, if the frontend uses Vite:

```bash
cd frontend
npm install
npm run dev
```

Start the backend using its configured entry point and npm script.

> **Note:** The exact startup commands depend on the scripts configured in the project's package.json files.

## 👨‍💻 Team & Contributions

This project was developed collaboratively by B.Tech Computer Science Engineering students as part of the Semester III Project-Based Learning (PBL) curriculum at Graphic Era Hill University.

The team worked together on:

- Project planning and system architecture.
- Frontend development.
- Backend development and API integration.
- C++ application logic.
- Data Structures & Algorithms implementation.
- Object-Oriented Programming concepts.
- Testing, integration, and documentation.

## 🎯 Project Outcomes

Through this project, we successfully demonstrated:

- Practical implementation of Data Structures & Algorithms.
- Application of Object-Oriented Programming principles.
- Frontend and backend integration.
- API-based communication.
- Modular software development.
- Real-world problem-solving using C++.
- Collaborative software development using Git and GitHub.

## 🚀 Future Scope

Although the current project is completed, several enhancements can be introduced in future versions:

- Online payment gateway integration.
- QR-based student identification.
- Real-time order notifications.
- Advanced sales and analytics dashboard.
- Database-driven cloud storage.
- Mobile application support.
- Enhanced authentication and security.

## 🎓 Academic Information

| Detail | Information |
|---|---|
| Project Name | SmartCanteen |
| Project Type | Project-Based Learning |
| Semester | III |
| Program | B.Tech – Computer Science Engineering |
| Institution | Graphic Era Hill University |
| Subject | Data Structures & Algorithms / OOP |

## 🤝 Acknowledgement

We would like to express our sincere gratitude to our faculty members and mentors for their guidance, encouragement, and support throughout the development of this project.

This project provided valuable practical experience in software engineering, programming, problem-solving, teamwork, and application development.

---

<p align="center">
  <img src="https://img.shields.io/badge/PROJECT-SUCCESSFULLY%20COMPLETED-brightgreen?style=for-the-badge" />
</p>

<p align="center">
  <b>SmartCanteen — Making Campus Food Management Smarter.</b>
  <br/><br/>
  Built with C++, DSA, OOP & Teamwork 
  <br/><br/>
  ⭐ If you find this project interesting, consider giving the repository a star!
</p>

---

**Repository:** [PBL-SEM-3-DSA-AND-OOPS](https://github.com/shubhammm1204/PBL-SEM-3-DSA-AND-OOPS)

# 🍽️ SmartCanteen | Canteen Management System

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

**SmartCanteen** is a full-stack Canteen Management System developed to digitize and simplify food ordering and daily canteen operations within a college campus.

The system provides a centralized platform for managing students, food menus, orders, staff operations, and student account balances.

Developed using C++, Data Structures & Algorithms, Object-Oriented Programming, and web technologies, this project demonstrates how fundamental computer science concepts can be applied to solve real-world management problems.

The project has been successfully completed as part of the **Semester III Project-Based Learning (PBL)** curriculum.

## 🏆 Project Status

**<span style="color:green">COMPLETED</span>**

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
- [x] DSA and OOP implementation
- [x] Project documentation

## ✨ Features

### 👨‍🎓 Student Management
- Student information management.
- Student account balance management.
- Balance checking before order processing.

### 🍔 Food & Menu Management
- View available food items.
- Access food item information and pricing.
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

### 🔄 Automated Order Processing
- FIFO-based order processing.
- Queue-based pending order management.
- Organized order status handling.

## 🛠️ Technology Stack

| Technology | Application |
|---|---|
| C++ | Core business logic |
| HTML5 | Frontend structure |
| CSS3 | User interface styling |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | API integration |
| JSON | Data communication |
| Git & GitHub | Version control |

## 🧠 Data Structures & Algorithms

The project applies DSA concepts to manage real-world canteen operations.

| Data Structure / Concept | Application |
|---|---|
| Queue | FIFO order processing |
| Vector | Dynamic order-item management |
| Searching | Finding menu items and records |
| Sorting | Organizing data where required |

### Queue — FIFO Implementation

The pending orders are maintained using a queue.

**FIFO (First In, First Out)** ensures that the first order placed is processed before subsequent orders.

This helps maintain a systematic and fair order-processing workflow.

## 🏗️ Object-Oriented Programming

The application demonstrates the four pillars of OOP:

- **Encapsulation:** Protecting student and application data through controlled class methods.
- **Inheritance:** Reusing common functionality through base and derived classes.
- **Polymorphism:** Using virtual functions and function overriding for flexible behavior.
- **Abstraction:** Hiding implementation details and exposing essential functionality.

Additional concepts include classes, objects, constructors, destructors, pointers, dynamic memory allocation, and virtual functions.

## 🔌 API Integration

The C++ application logic communicates with the backend through structured JSON-based API operations.

The API layer helps connect frontend requests with the underlying canteen management functionality.

Core application operations include:

- Student balance retrieval.
- Order creation.
- Order processing.
- Table-wise order retrieval.
- Staff and student management.

## 🏛️ System Architecture

```text
             STUDENT / STAFF
                    |
                    v
          +--------------------+
          |     FRONTEND       |
          |   HTML / CSS / JS  |
          +--------------------+
                    |
                    v
          +--------------------+
          |     BACKEND        |
          |    Node.js / API   |
          +--------------------+
                    |
                    v
          +--------------------+
          |   C++ API LAYER    |
          | Application Logic  |
          +--------------------+
                    |
                    v
          +--------------------+
          |  CANTEEN SYSTEM    |
          | Student / Orders   |
          | Staff / Menu       |
          +--------------------+
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

## 🚀 Getting Started

### Prerequisites

- C++ compiler (GCC / MinGW)
- Node.js and npm
- Git
- Visual Studio Code (recommended)

### 1. Clone Repository

```bash
git clone https://github.com/shubhammm1204/PBL-SEM-3-DSA-AND-OOPS.git
```

### 2. Navigate to Project

```bash
cd PBL-SEM-3-DSA-AND-OOPS
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

Start the frontend and backend using their configured development scripts and follow the project's setup instructions.

## 👨‍💻 Team & Contributions

This project was developed collaboratively by B.Tech Computer Science Engineering students.

**My Contribution — Siddhant Butola**

- API development and integration.
- C++ application logic.
- Order processing and staff management.
- Implementation of OOP concepts.
- Integration of frontend requests with backend functionality.
- Main application entry point (`main.cpp`).

## 🎯 Project Outcomes

Through this project, we successfully demonstrated:

- Practical implementation of Data Structures & Algorithms.
- Application of Object-Oriented Programming principles.
- Frontend and backend integration.
- API-based communication.
- Modular application development.
- Collaborative software development using Git and GitHub.

## 🔮 Future Scope

Although the current project is completed, the system can be extended with:

- Online payment gateway integration.
- QR-based student identification.
- Real-time order notifications.
- Advanced sales and analytics dashboard.
- Database-driven cloud storage.
- Mobile application support.

## 🎓 Academic Details

| Field | Details |
|---|---|
| Project Name | SmartCanteen |
| Project Type | Project-Based Learning |
| Semester | III |
| Course | B.Tech CSE |
| Institution | Graphic Era Hill University |
| Subject | Data Structures & Algorithms / OOP |

## 🤝 Acknowledgement

We would like to express our gratitude to our faculty members and mentors for their guidance and support throughout the development of this project.

This project provided valuable practical experience in software engineering, programming, problem-solving, and teamwork.

---

<p align="center">
  <b>🎉 PROJECT SUCCESSFULLY COMPLETED 🎉</b>
  <br/><br/>
  <i>Built with C++, DSA, OOP and Teamwork.</i>
  <br/><br/>
  ⭐ If you find this project interesting, consider giving the repository a star!
</p>

**Repository:** https://github.com/shubhammm1204/PBL-SEM-3-DSA-AND-OOPS

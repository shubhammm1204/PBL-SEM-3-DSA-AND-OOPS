# SmartCanteen: OOP & DSA Implementation Guide
**College PBL Project (Semester 3 / 2nd Year)**
**Target Completion: ~40% Core Working Prototype**

---

## 1. Project Overview & Scope (~40% Milestone)

This project implements the core foundation of **SmartCanteen: QR-Based Table Ordering and Balance System**:
- **Student Balance Check**: Reads prepaid token balance from backend storage.
- **Authoritative Price Calculation**: Calculates total order amount using verified prices stored in C++.
- **Financial Validation & Atomic Deduction**: If student balance is sufficient, deducts the exact amount, generates an order ID, and queues the order; if insufficient, rejects the order without deducting any money.
- **Table Order Tracking**: Associates incoming orders with a validated table number (1 to 5).
- **Zero Heavy External Dependencies**: Pure C++ standard library (No `json.hpp` overhead).

---

## 2. Object-Oriented Programming (OOP) Concepts

All 4 pillars of OOP are implemented in clean, understandable C++ header files:

### A. Encapsulation
- **Where**: [`backend/models/students.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/models/students.h), [`backend/models/menuItems.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/models/menuItems.h), [`backend/models/orders.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/models/orders.h)
- **Explanation**:
  - `balance` in `Student` is marked **`private`**. External code cannot arbitrarily tamper with a student's balance (e.g., `balance = 999999` is impossible).
  - Balance can **only** be modified through the controlled member function `deductBalance(amount)`.
  - `deductBalance` enforces business rules: `amount > 0` and `amount <= balance`.
- **Viva Answer**: *"Encapsulation wraps data and methods together and protects internal state. In our Student class, balance is private so no client can set a negative balance or bypass payment checks."*

### B. Inheritance
- **Where**: [`backend/models/user.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/models/user.h) & [`backend/models/students.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/models/students.h)
- **Explanation**:
  - `User` is the base class with common user properties: `id`, `name`, `role`.
  - `Student` inherits publicly from `User` (`class Student : public User`), demonstrating an **"IS-A"** relationship (a Student is a User).
- **Viva Answer**: *"Inheritance allows code reuse. Student inherits common user fields like ID and name from User, and adds student-specific attributes like canteen balance."*

### C. Polymorphism & Abstraction
- **Where**: [`backend/file storage/storage.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/file%20storage/storage.h) & [`backend/services/canteenSystem.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/services/canteenSystem.h)
- **Explanation**:
  - `BaseStorage` is an **Abstract Base Class (Interface)** containing pure virtual functions (`= 0`) and a virtual destructor.
  - `Storage` derives from `BaseStorage` and overrides `saveStudent()`, `loadStudents()`, `saveOrder()`, and `loadOrders()`.
  - In `CanteenSystem`, storage is accessed via a base class pointer `BaseStorage* storage = &fileStorage;`.
- **Viva Answer**: *"Polymorphism allows us to call derived class methods through a base class pointer. Abstraction hides the file reading/writing mechanics behind the clean BaseStorage interface."*

### D. Composition
- **Where**: [`backend/models/orders.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/models/orders.h)
- **Explanation**:
  - `Order` contains a collection of `OrderItem` objects (`vector<OrderItem> items`).
  - Represents a **"HAS-A"** relationship (an Order has OrderItems).
- **Viva Answer**: *"Composition is when a class contains instances of another class. An Order is composed of multiple OrderItem objects representing food lines."*

---

## 3. Data Structures & Algorithms (DSA) Concepts

### A. Queue (`std::queue<Order>`) — FIFO Order Processing
- **Where**: [`backend/services/canteenSystem.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/services/canteenSystem.h) & [`backend/services/orderSystem.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/services/orderSystem.h)
- **Why Queue?**: In a canteen kitchen, orders are processed First-In, First-Out. The first student to submit an order should have their meal prepared first.
- **Operations & Complexity**:
  - `push(order)`: Enqueue new order when confirmed — **$O(1)$**
  - `front()`: Kitchen views the next order to cook — **$O(1)$**
  - `pop()`: Kitchen marks order as preparing/served — **$O(1)$**
- **Viva Answer**: *"We use std::queue because canteen orders follow a FIFO (First-In, First-Out) discipline. Enqueuing and dequeuing both run in constant O(1) time."*

### B. Hash Map (`std::unordered_map`) — Fast Lookups
- **Where**: [`backend/services/canteenSystem.h`](file:///d:/pbl%20oops%20dsa/PBL-SEM-3-DSA-AND-OOPS/backend/services/canteenSystem.h)
- **Usage**:
  1. `unordered_map<string, Student> studentMap`: Instant student lookup by ID (e.g. `"GEU101"`).
  2. `unordered_map<string, MenuItem> menuMap`: Instant menu item and price lookup by Item ID (e.g. `"M001"`).
- **Why Hash Map?**: Avoids linear scans ($O(N)$) across all students or menu items.
- **Complexity**: Average **$O(1)$** search, insert, and update.
- **Viva Answer**: *"std::unordered_map uses a hash table to achieve average O(1) lookup time, which allows instant student balance and menu price verification."*

### C. Vector (`std::vector`) — Dynamic Arrays
- **Where**: Used in `Order` (`vector<OrderItem>`), `Storage` (`vector<string>`), and `orders` list.
- **Why Vector?**: Contiguous memory, cache-friendly, dynamic resizing as items and orders grow.
- **Complexity**: **$O(1)$** amortized append (`push_back`), **$O(1)$** indexed access.

---

## 4. How to Run the Project for Viva / Demo

### Terminal 1: Start Backend Server
```bash
node backend/server.js
```
Expected output:
```
SmartCanteen Server Online
Local Access  : http://localhost:3000
```

### Browser: Open Application
Open:
```
http://localhost:3000/?table=1
```

### Demo Steps to Show Evaluators:
1. **Balance Display**: Note that Rahul's balance is automatically fetched from C++ storage (**200 Tokens**).
2. **Successful Order**:
   - Add **Campus Burger** (₹69) to cart.
   - Click **Place Order**.
   - Notice the success message: `Order accepted for Table 1! Remaining balance: 131 Tokens.`
   - Balance in navbar and tokens card immediately updates to **131 Tokens**.
3. **Insufficient Balance Prevention**:
   - Add **2 Farmhouse Pizzas** (₹129 × 2 = ₹258).
   - Click **Place Order**.
   - Notice the rejection message: `Insufficient balance! Required: 258 Tokens, Available: 131 Tokens.`
   - Notice that no money is deducted and no order is generated.
4. **Data Persistence**:
   - Check `backend/data/students.txt` and `backend/data/orders.txt` — balance and order records are saved to disk.

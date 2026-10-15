#ifndef STUDENTS_H
#define STUDENTS_H

#include "user.h"
#include <string>

using namespace std;

// ============================================================================
// OOP CONCEPT: Inheritance & Encapsulation
// ============================================================================
// 1. Inheritance: Student derives from User (Student IS-A User).
// 2. Encapsulation: The 'balance' variable is PRIVATE.
//    External code cannot directly change balance (e.g. balance = 999999 is blocked).
//    Balance can only be modified through deductBalance() and addBalance() with validation!
// ============================================================================
class Student : public User {
private:
    int balance; // Private data: encapsulated

public:
    Student() : User("", "", "Student"), balance(0) {}

    Student(const string& id, const string& studentName, int initialBalance)
        : User(id, studentName, "Student"),
          balance(initialBalance < 0 ? 0 : initialBalance) {}

    // Polymorphism: Overriding base class getRole()
    string getRole() const override {
        return "Student";
    }

    // Encapsulated getter
    string getStudentId() const {
        return id;
    }

    int getBalance() const {
        return balance;
    }

    // Controlled balance deduction (Prevents negative balance)
    bool deductBalance(int amount) {
        if (amount <= 0) {
            return false;
        }
        if (amount > balance) {
            return false; // Insufficient funds!
        }
        balance -= amount;
        return true;
    }

    // Controlled balance addition
    void addBalance(int amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    void displayInfo() const override {
        cout << "[Student] ID: " << id << ", Name: " << name
             << ", Balance: ₹" << balance << endl;
    }
};

#endif // STUDENTS_H

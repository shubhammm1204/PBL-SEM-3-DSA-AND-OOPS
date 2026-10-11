
#ifndef STUDENTS_H
#define STUDENTS_H

#include <string>
using namespace std;

class Student
{
private:
    string studentId;
    string name;
    int balance;

public:
    Student() : balance(0) {}

    Student(string id, string studentName, int initialBalance)
        : studentId(id),
          name(studentName),
          balance(initialBalance < 0 ? 0 : initialBalance) {}

    string getStudentId() const
    {
        return studentId;
    }

    string getName() const
    {
        return name;
    }

    int getBalance() const
    {
        return balance;
    }

    bool deductBalance(int amount)
    {
        if (amount <= 0 || amount > balance)
        {
            return false;
        }

        balance -= amount;
        return true;
    }

    void addBalance(int amount)
    {
        if (amount > 0)
        {
            balance += amount;
        }
    }
};

#endif

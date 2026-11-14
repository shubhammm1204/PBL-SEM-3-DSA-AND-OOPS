#ifndef USER_H
#define USER_H

#include <string>
#include <iostream>

using namespace std;


class User {
protected:
    string id;
    string name;
    string role;

public:
    User() : id(""), name(""), role("User") {}
    User(const string& id, const string& name, const string& role)
        : id(id), name(name), role(role) {}

    virtual ~User() {}

    // Pure virtual or virtual method demonstrating Polymorphism
    virtual string getRole() const {
        return role;
    }

    // Getters for encapsulated protected fields
    string getId() const { return id; }
    string getName() const { return name; }

    virtual void displayInfo() const {
        cout << "[" << role << "] ID: " << id << ", Name: " << name << endl;
    }
};

#endif // USER_H

#ifndef STORAGE_H
#define STORAGE_H

#include <fstream>
#include <string>
#include <vector>
#include <cstdio>
#include <iostream>

using namespace std;

// ============================================================================
// OOP CONCEPT: Abstraction & Polymorphism (Abstract Base Class / Interface)
// ============================================================================
// BaseStorage defines a contract for persisting student and order data.
// It hides the internal file-handling mechanics (Abstraction).
// Any storage engine (FileStorage, DatabaseStorage) can implement this interface.
// ============================================================================
class BaseStorage {
public:
    virtual ~BaseStorage() {}

    // Pure virtual functions demonstrating Runtime Polymorphism
    virtual bool saveStudent(const string &studentId, const string &name, int balance) = 0;
    virtual vector<string> loadStudents() = 0;
    virtual bool saveOrder(const string &orderId, const string &studentId, int tableNumber, int total, const string &status) = 0;
    virtual vector<string> loadOrders() = 0;
};

// ============================================================================
// OOP CONCEPT: Inheritance & Polymorphism
// ============================================================================
// Storage inherits from BaseStorage and overrides all pure virtual functions.
// ============================================================================
class Storage : public BaseStorage {
private:
    string studentFile;
    string orderFile;

    // Helper: resolve relative file path regardless of launch directory
    string resolvePath(const string &path) {
        // 1. Try directly
        ifstream direct(path.c_str());
        if (direct.good()) return path;

        // 2. Try with "backend/" prefix
        string withBackend = "backend/" + path;
        ifstream bTest(withBackend.c_str());
        if (bTest.good()) return withBackend;

        // 3. Try with "../" prefix
        string withParent = "../" + path;
        ifstream pTest(withParent.c_str());
        if (pTest.good()) return withParent;

        // Default to given path
        return path;
    }

    vector<string> readLines(const string &path) {
        vector<string> records;
        string resolved = resolvePath(path);
        ifstream file(resolved.c_str());
        string line;

        while (getline(file, line)) {
            // Trim trailing \r if present
            if (!line.empty() && line[line.size() - 1] == '\r') {
                line.erase(line.size() - 1);
            }
            if (!line.empty()) {
                records.push_back(line);
            }
        }
        return records;
    }

    bool writeLines(const string &path, const vector<string> &records) {
        string resolved = resolvePath(path);
        string tempPath = resolved + ".tmp";
        ofstream file(tempPath.c_str());

        if (!file.is_open()) {
            return false;
        }

        for (const string &record : records) {
            file << record << '\n';
        }

        file.close();

        if (!file) {
            remove(tempPath.c_str());
            return false;
        }

        // Safe replace on Windows: remove destination before renaming
        remove(resolved.c_str());
        if (rename(tempPath.c_str(), resolved.c_str()) != 0) {
            return false;
        }

        return true;
    }

public:
    Storage(const string &studentsPath = "data/students.txt",
            const string &ordersPath = "data/orders.txt")
        : studentFile(studentsPath), orderFile(ordersPath) {}

    // Polymorphism: Overriding BaseStorage pure virtual functions
    bool saveStudent(const string &studentId, const string &name, int balance) override {
        if (studentId.empty() || balance < 0 ||
            studentId.find('|') != string::npos ||
            name.find('|') != string::npos) {
            return false;
        }

        vector<string> records = readLines(studentFile);
        string prefix = studentId + "|";
        string record = studentId + "|" + name + "|" + to_string(balance);

        bool updated = false;
        for (string &existing : records) {
            if (existing.compare(0, prefix.size(), prefix) == 0) {
                existing = record;
                updated = true;
                break;
            }
        }

        if (!updated) {
            records.push_back(record);
        }

        return writeLines(studentFile, records);
    }

    vector<string> loadStudents() override {
        return readLines(studentFile);
    }

    bool saveOrder(const string &orderId, const string &studentId,
                   int tableNumber, int total, const string &status) override {
        if (orderId.empty() || studentId.empty() ||
            tableNumber <= 0 || total < 0 ||
            orderId.find('|') != string::npos ||
            studentId.find('|') != string::npos ||
            status.find('|') != string::npos) {
            return false;
        }

        vector<string> records = readLines(orderFile);
        string prefix = orderId + "|";
        string record = orderId + "|" + studentId + "|" +
                        to_string(tableNumber) + "|" +
                        to_string(total) + "|" + status;

        bool updated = false;
        for (string &existing : records) {
            if (existing.compare(0, prefix.size(), prefix) == 0) {
                existing = record;
                updated = true;
                break;
            }
        }

        if (!updated) {
            records.push_back(record);
        }

        return writeLines(orderFile, records);
    }

    vector<string> loadOrders() override {
        return readLines(orderFile);
    }
};

#endif // STORAGE_H


#include <iostream>
#include <vector>
#include "file storage/storage.h"

using namespace std;

int main() {
    Storage storage;

    if (storage.saveStudent("GEU101", "Rahul", 200)) {
        cout << "Student saved successfully!\n";
    } else {
        cout << "Could not save student.\n";
    }

    if (storage.saveOrder(
        "ORD1001", "GEU101", 2, 178, "Pending"
    )) {
        cout << "Order saved successfully!\n";
    } else {
        cout << "Could not save order.\n";
    }

    vector<string> students = storage.loadStudents();
    vector<string> orders = storage.loadOrders();

    cout << "\nSaved students:\n";
    for (const string& record : students) {
        cout << record << '\n';
    }

    cout << "\nSaved orders:\n";
    for (const string& record : orders) {
        cout << record << '\n';
    }

    return 0;
}

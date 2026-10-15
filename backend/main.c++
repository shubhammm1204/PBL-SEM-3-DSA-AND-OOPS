#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <algorithm>
#include <numeric>

#include "models/user.h"
#include "models/students.h"
#include "models/menuItems.h"
#include "models/orders.h"
#include "file storage/storage.h"
#include "services/canteenSystem.h"

using namespace std;

// ============================================================================
// SMART CANTEEN: OOP & DSA VERIFICATION PROGRAM (C++11/C++14)
// Run this file in your terminal during college viva/evaluations:
//   g++ -std=c++11 main.c++ -o main.exe && ./main.exe
// ============================================================================

void demonstrateOOP() {
    cout << "\n======================================================\n";
    cout << "          1. OBJECT-ORIENTED PROGRAMMING (OOP)        \n";
    cout << "======================================================\n";

    // 1. INHERITANCE & POLYMORPHISM
    cout << "\n[A] INHERITANCE & POLYMORPHISM (User -> Student):\n";
    // Student IS-A User. Base class pointer pointing to derived class instance.
    User* userPtr = new Student("GEU101", "Rahul", 200);
    cout << "Created user via User* base pointer:\n";
    userPtr->displayInfo(); // Polymorphic call (virtual method)
    cout << "Role identified dynamically via getRole(): " << userPtr->getRole() << "\n";

    // 2. ENCAPSULATION
    cout << "\n[B] ENCAPSULATION (Controlled Balance Access):\n";
    Student student("GEU101", "Rahul", 200);
    cout << "Initial balance: ₹" << student.getBalance() << "\n";
    cout << "Attempting to deduct ₹300 (exceeds balance):\n";
    bool deductedFail = student.deductBalance(300);
    cout << "  Deduction result: " << (deductedFail ? "Success" : "REJECTED (Insufficient balance)") << "\n";
    cout << "  Balance remains unchanged: ₹" << student.getBalance() << "\n";

    cout << "Attempting to deduct ₹69 (valid purchase):\n";
    bool deductedSuccess = student.deductBalance(69);
    cout << "  Deduction result: " << (deductedSuccess ? "SUCCESS" : "Failed") << "\n";
    cout << "  Updated balance: ₹" << student.getBalance() << "\n";

    // 3. COMPOSITION
    cout << "\n[C] COMPOSITION (Order HAS-A vector<OrderItem>):\n";
    vector<OrderItem> items;
    items.push_back(OrderItem("M001", "Campus Burger", 1, 69));
    items.push_back(OrderItem("M005", "Cold Coffee", 1, 45));
    Order order("ORD1001", "GEU101", 1, items, 114);

    cout << "Order " << order.getOrderId() << " for Table " << order.getTableNumber() << " contains:\n";
    for (const auto& item : order.getItems()) {
        cout << "  - " << item.getName() << " x " << item.getQuantity() 
             << " @ ₹" << item.getPrice() << " each = ₹" << item.getSubtotal() << "\n";
    }
    cout << "Total Amount: ₹" << order.getTotalAmount() << "\n";

    // 4. ABSTRACTION & POLYMORPHISM (Storage Interface)
    cout << "\n[D] ABSTRACTION & POLYMORPHISM (BaseStorage Interface):\n";
    // BaseStorage is an abstract interface with pure virtual functions (= 0)
    BaseStorage* storage = new Storage();
    bool saved = storage->saveStudent("GEU101", "Rahul", student.getBalance());
    cout << "Storage->saveStudent() called through BaseStorage* pointer: " 
         << (saved ? "SUCCESS" : "Failed") << "\n";

    delete userPtr;
    delete storage;
}

void demonstrateDSA() {
    cout << "\n======================================================\n";
    cout << "       2. DATA STRUCTURES & ALGORITHMS (DSA)          \n";
    cout << "======================================================\n";

    // 1. HASH MAP (std::unordered_map) - O(1) Fast Lookup
    cout << "\n[A] HASH MAP (std::unordered_map) - O(1) Average Lookup:\n";
    unordered_map<string, int> menuPriceMap;
    menuPriceMap["M001"] = 69;   // Campus Burger
    menuPriceMap["M002"] = 99;   // Cheese Pizza
    menuPriceMap["M003"] = 50;   // Masala Noodles
    menuPriceMap["M004"] = 49;   // French Fries

    string searchItem = "M001";
    cout << "Looking up item ID '" << searchItem << "' in Hash Map...\n";
    if (menuPriceMap.find(searchItem) != menuPriceMap.end()) {
        cout << "  Found! Price: ₹" << menuPriceMap[searchItem] 
             << " (Time Complexity: O(1) constant time)\n";
    }

    // 2. QUEUE (std::queue) - FIFO Order Processing
    cout << "\n[B] QUEUE (std::queue) - FIFO (First-In, First-Out) Order Processing:\n";
    queue<string> kitchenQueue;
    kitchenQueue.push("ORD1001 (Table 1)"); // Enqueue 1
    kitchenQueue.push("ORD1002 (Table 3)"); // Enqueue 2
    kitchenQueue.push("ORD1003 (Table 2)"); // Enqueue 3

    cout << "Orders enqueued into kitchen. Queue size: " << kitchenQueue.size() << "\n";
    while (!kitchenQueue.empty()) {
        cout << "  Kitchen cooking next order: " << kitchenQueue.front() << "\n";
        kitchenQueue.pop(); // Dequeue oldest order
    }
    cout << "All queued orders processed in exact FIFO order.\n";

    // 3. STL ACCUMULATE (std::accumulate) - Summing Order Total
    cout << "\n[C] STL ACCUMULATE (std::accumulate) - Total Price Calculation:\n";
    vector<int> itemSubtotals = {69, 45, 50}; // 69 + 45 + 50
    int total = accumulate(itemSubtotals.begin(), itemSubtotals.end(), 0);
    cout << "Calculated total from item subtotals using std::accumulate: ₹" << total << "\n";

    // 4. SORTING (std::sort) - O(N log N)
    cout << "\n[D] SORTING (std::sort) - Menu Items by Price:\n";
    vector<pair<string, int>> items = {
        {"Cheese Pizza", 99},
        {"Cold Coffee", 45},
        {"Campus Burger", 69},
        {"French Fries", 49}
    };

    // Sort ascending by price
    sort(items.begin(), items.end(), [](const pair<string, int>& a, const pair<string, int>& b) {
        return a.second < b.second;
    });

    cout << "Menu sorted by price (Budget friendly to Premium):\n";
    for (const auto& item : items) {
        cout << "  - " << item.first << ": ₹" << item.second << "\n";
    }
}

int main() {
    cout << "\n******************************************************\n";
    cout << "*  SMARTCANTEEN: C++ OOP & DSA DEMONSTRATION         *\n";
    cout << "*  College PBL Milestone (~40% Core Implementation)  *\n";
    cout << "******************************************************\n";

    demonstrateOOP();
    demonstrateDSA();

    cout << "\n======================================================\n";
    cout << "       3. PERSISTENCE IN C++ (FILE STORAGE)           \n";
    cout << "======================================================\n";

    Storage storage;
    vector<string> students = storage.loadStudents();
    vector<string> orders = storage.loadOrders();

    cout << "Loaded Students from storage:\n";
    for (const string& rec : students) {
        cout << "  " << rec << "\n";
    }

    cout << "Loaded Orders from storage:\n";
    for (const string& rec : orders) {
        cout << "  " << rec << "\n";
    }

    cout << "\n[SUCCESS] All OOP and DSA concepts executed successfully!\n\n";
    return 0;
}

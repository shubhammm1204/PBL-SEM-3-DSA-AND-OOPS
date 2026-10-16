#ifndef CANTEEN_SYSTEM_H
#define CANTEEN_SYSTEM_H

#include "../models/user.h"
#include "../models/students.h"
#include "../models/menuItems.h"
#include "../models/orders.h"
#include "../file storage/storage.h"

#include <queue>         // DSA Concept: FIFO Queue for processing incoming canteen orders
#include <unordered_map> // DSA Concept: Hash Map for O(1) average lookup
#include <vector>        // DSA Concept: Dynamic Array
#include <algorithm>     // DSA Concept: std::sort
#include <sstream>
#include <iostream>

using namespace std;


class CanteenSystem
{
private:
  
    unordered_map<string, Student> studentMap;

  
    unordered_map<string, MenuItem> menuMap;


    queue<Order> orderQueue;

  
    vector<Order> orders;

    BaseStorage *storage;
    Storage fileStorage;

    int nextOrderNumber;

    // Load initial menu items into hash map (authoritative backend prices)
    void initMenu()
    {
        menuMap["M001"] = MenuItem("M001", "Campus Burger", "Burgers", 69);
        menuMap["M002"] = MenuItem("M002", "Cheese Pizza", "Pizza", 99);
        menuMap["M003"] = MenuItem("M003", "Masala Noodles", "Noodles", 50);
        menuMap["M004"] = MenuItem("M004", "French Fries", "Snacks", 49);
        menuMap["M005"] = MenuItem("M005", "Cold Coffee", "Drinks", 45);
        menuMap["M006"] = MenuItem("M006", "Chocolate Brownie", "Desserts", 55);
        menuMap["M017"] = MenuItem("M017", "Aloo Tikki Burger", "Burgers", 49);
        menuMap["M018"] = MenuItem("M018", "Double Cheese Burger", "Burgers", 89);
        menuMap["M019"] = MenuItem("M019", "Farmhouse Pizza", "Pizza", 129);
        menuMap["M020"] = MenuItem("M020", "Paneer Pizza", "Pizza", 139);
        menuMap["M021"] = MenuItem("M021", "Schezwan Noodles", "Noodles", 70);
        menuMap["M022"] = MenuItem("M022", "Veg Momos", "Snacks", 50);
        menuMap["M023"] = MenuItem("M023", "Fried Momos", "Snacks", 65);
        menuMap["M024"] = MenuItem("M024", "Cheese Sandwich", "Snacks", 55);
        menuMap["M025"] = MenuItem("M025", "Paneer Wrap", "Snacks", 79);
    }

    // Load students from storage file into Hash Map (O(1) access)
    void loadStudentsFromStorage()
    {
        vector<string> lines = storage->loadStudents();
        for (const string &line : lines)
        {
            stringstream ss(line);
            string id, name, balStr;
            if (getline(ss, id, '|') && getline(ss, name, '|') && getline(ss, balStr, '|'))
            {
                int bal = atoi(balStr.c_str());
                studentMap[id] = Student(id, name, bal);
            }
        }
        // Ensure default student GEU101 exists
        if (studentMap.find("GEU101") == studentMap.end())
        {
            studentMap["GEU101"] = Student("GEU101", "Rahul", 200);
            storage->saveStudent("GEU101", "Rahul", 200);
        }
    }

    // Load existing orders from storage file
    void loadOrdersFromStorage()
    {
        vector<string> lines = storage->loadOrders();
        for (const string &line : lines)
        {
            stringstream ss(line);
            string oid, sid, tblStr, totStr, status;
            if (getline(ss, oid, '|') && getline(ss, sid, '|') &&
                getline(ss, tblStr, '|') && getline(ss, totStr, '|') &&
                getline(ss, status, '|'))
            {
                int tbl = atoi(tblStr.c_str());
                int tot = atoi(totStr.c_str());
                Order ord(oid, sid, tbl, tot, status);
                orders.push_back(ord);
            }
        }
        nextOrderNumber = 1001 + orders.size();
    }

public:
    CanteenSystem() : nextOrderNumber(1001)
    {
        // OOP: Polymorphism (Assigning derived class Storage to BaseStorage interface pointer)
        storage = &fileStorage;

        initMenu();
        loadStudentsFromStorage();
        loadOrdersFromStorage();
    }

    // DSA: Hash Map Lookup - O(1) average time
    Student *getStudent(const string &studentId)
    {
        auto it = studentMap.find(studentId);
        if (it != studentMap.end())
        {
            return &(it->second);
        }
        return nullptr;
    }

    // Result structure for placing an order
    struct OrderResult
    {
        bool success;
        string message;
        string orderId;
        int tableNumber;
        int totalAmount;
        int remainingBalance;
        string status;
    };

    OrderResult placeOrder(const string &studentId, int tableNumber, const vector<pair<string, int>> &cartItems)
    {
        OrderResult res;
        res.success = false;
        res.orderId = "";
        res.tableNumber = tableNumber;
        res.totalAmount = 0;
        res.remainingBalance = 0;
        res.status = "Pending";

        // 1. Validate student exists
        Student *student = getStudent(studentId);
        if (!student)
        {
            res.message = "Student ID not found: " + studentId;
            return res;
        }

        // 2. Validate table number (1 to 5)
        if (tableNumber < 1 || tableNumber > 5)
        {
            res.message = "Invalid table number. Must be between 1 and 5.";
            return res;
        }

        if (cartItems.empty())
        {
            res.message = "Cart is empty.";
            return res;
        }

        // 3. Calculate authoritative total using backend menuMap (DSA: Hash Map)
        int calculatedTotal = 0;
        vector<OrderItem> orderItems;

        for (const auto &item : cartItems)
        {
            string itemId = item.first;
            int qty = item.second;

            if (qty <= 0)
                continue;

            auto mIt = menuMap.find(itemId);
            if (mIt != menuMap.end())
            {
                int price = mIt->second.getPrice();
                string name = mIt->second.getName();
                calculatedTotal += (price * qty);
                orderItems.push_back(OrderItem(itemId, name, qty, price));
            }
            else
            {
                res.message = "Unknown menu item: " + itemId;
                return res;
            }
        }

        res.totalAmount = calculatedTotal;

        // 4. Check balance before deducting (OOP: Encapsulation)
        if (student->getBalance() < calculatedTotal)
        {
            res.message = "Insufficient balance! Required: " + to_string(calculatedTotal) +
                          " Tokens, Available: " + to_string(student->getBalance()) + " Tokens.";
            res.remainingBalance = student->getBalance();
            return res; // Reject without deduction
        }

        // 5. Deduct balance (Controlled encapsulated method)
        student->deductBalance(calculatedTotal);
        res.remainingBalance = student->getBalance();

        // 6. Generate order ID and create Order (OOP: Composition)
        string orderId = "ORD" + to_string(nextOrderNumber++);
        Order newOrder(orderId, studentId, tableNumber, orderItems, calculatedTotal);

        // 7. DSA: Enqueue order in FIFO Queue for kitchen processing
        orderQueue.push(newOrder);

        // 8. Add to orders vector
        orders.push_back(newOrder);

        // 9. Persist updated balance and order using Polymorphic storage call
        storage->saveStudent(student->getStudentId(), student->getName(), student->getBalance());
        storage->saveOrder(orderId, studentId, tableNumber, calculatedTotal, "Pending");

        res.success = true;
        res.orderId = orderId;
        res.message = "Order placed successfully!";
        return res;
    }

    // Get active orders for a specific table
    vector<Order> getOrdersForTable(int tableNumber)
    {
        vector<Order> tableOrders;
        for (const auto &ord : orders)
        {
            if (ord.getTableNumber() == tableNumber && ord.getStatus() != "Served" && ord.getStatus() != "Cancelled")
            {
                tableOrders.push_back(ord);
            }
        }
        return tableOrders;
    }

    // DSA: Queue FIFO Operation - Process next pending order in kitchen
    bool processNextOrder()
    {
        if (orderQueue.empty())
        {
            return false;
        }

        Order current = orderQueue.front();
        orderQueue.pop(); // Remove from FIFO queue

        // Update status in orders vector
        for (auto &ord : orders)
        {
            if (ord.getOrderId() == current.getOrderId())
            {
                ord.updateStatus("Preparing");
                storage->saveOrder(ord.getOrderId(), ord.getStudentId(),
                                   ord.getTableNumber(), ord.getTotalAmount(), "Preparing");
                break;
            }
        }
        return true;
    }

    int getQueueSize() const
    {
        return orderQueue.size();
    }
};

#endif // CANTEEN_SYSTEM_H
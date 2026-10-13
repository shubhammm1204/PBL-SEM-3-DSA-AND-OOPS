#ifndef MODELS_H
#define MODELS_H

#include <string>
#include <vector>

struct Student {
    int id;
    std::string name;
    std::string email;
    double balance;
};

struct MenuItem {
    int id;
    std::string name;
    double price;
    std::string category;
    bool isAvailable;
};

struct OrderItem {
    int menuItemId;
    std::string name;
    int quantity;
    double price;
};

struct Order {
    int orderId;
    int studentId;
    int tableNumber; // Table identification
    std::vector<OrderItem> items;
    double totalAmount;
    std::string status; // "PENDING", "PREPARING", "SERVED", "CANCELLED"
};

#endif // MODELS_H
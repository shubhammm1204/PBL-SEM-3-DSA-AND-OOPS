#ifndef ORDERS_H
#define ORDERS_H

#include <string>
#include <vector>
#include <iostream>

using namespace std;

// ============================================================================
// OOP CONCEPT: Composition
// ============================================================================
// OrderItem represents a line item within an order.
// ============================================================================
class OrderItem {
private:
    string itemId;
    string name;
    int quantity;
    int price;

public:
    OrderItem() : itemId(""), name(""), quantity(0), price(0) {}

    OrderItem(const string& id, const string& itemName, int qty, int unitPrice)
        : itemId(id), name(itemName), quantity(qty > 0 ? qty : 1),
          price(unitPrice >= 0 ? unitPrice : 0) {}

    string getItemId() const { return itemId; }
    string getName() const { return name; }
    int getQuantity() const { return quantity; }
    int getPrice() const { return price; }
    int getSubtotal() const { return price * quantity; }
};

// ============================================================================
// OOP CONCEPT: Composition & Encapsulation
// ============================================================================
// 1. Composition: An Order HAS-A collection of OrderItem objects (vector<OrderItem>).
//    The lifecycle of the items is tied to the order.
// 2. Encapsulation: Status transitions are validated (e.g., cannot jump from Cancelled to Served).
// ============================================================================
class Order {
private:
    string orderId;
    string studentId;
    int tableNumber;
    vector<OrderItem> items; // Composition: Order contains items
    int totalAmount;
    string status; // "Pending", "Preparing", "Served", "Cancelled"

public:
    Order() : orderId(""), studentId(""), tableNumber(0), totalAmount(0), status("Pending") {}

    Order(const string& id, const string& stuId, int table, const vector<OrderItem>& orderItems, int total)
        : orderId(id), studentId(stuId), tableNumber(table),
          items(orderItems), totalAmount(total), status("Pending") {}

    Order(const string& id, const string& stuId, int table, int total, const string& stat)
        : orderId(id), studentId(stuId), tableNumber(table),
          totalAmount(total), status(stat) {}

    // Getters
    string getOrderId() const { return orderId; }
    string getStudentId() const { return studentId; }
    int getTableNumber() const { return tableNumber; }
    const vector<OrderItem>& getItems() const { return items; }
    int getTotalAmount() const { return totalAmount; }
    string getStatus() const { return status; }

    // Controlled state transition (Encapsulation)
    bool updateStatus(const string& newStatus) {
        if (status == "Cancelled" || status == "Served") {
            return false; // Terminal states
        }
        if (status == "Pending" && (newStatus == "Preparing" || newStatus == "Cancelled")) {
            status = newStatus;
            return true;
        }
        if (status == "Preparing" && (newStatus == "Served" || newStatus == "Cancelled")) {
            status = newStatus;
            return true;
        }
        return false;
    }

    void setStatusDirect(const string& stat) {
        status = stat;
    }
};

#endif // ORDERS_H

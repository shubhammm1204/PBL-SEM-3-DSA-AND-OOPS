
#ifndef MODELS_H
#define MODELS_H

#include <string>
#include <vector>
#include <stdexcept>
using namespace std;

// Represents a student account
class Student {
private:
    string studentId;
    string name;
    int balance;

public:
    Student(string id, string studentName, int initialBalance)
        : studentId(id), name(studentName),
          balance(initialBalance) {
        if (initialBalance < 0) {
            throw invalid_argument("Balance cannot be negative");
        }
    }

    string getStudentId() const {
        return studentId;
    }

    string getName() const {
        return name;
    }

    int getBalance() const {
        return balance;
    }

    bool deductBalance(int amount) {
        if (amount <= 0 || amount > balance) {
            return false;
        }

        balance -= amount;
        return true;
    }
};

// Represents one item on the menu
class MenuItem {
private:
    string itemId;
    string name;
    string category;
    int price;
    bool available;

public:
    MenuItem(string id, string itemName,
             string itemCategory, int itemPrice)
        : itemId(id), name(itemName),
          category(itemCategory), price(itemPrice),
          available(true) {
        if (itemPrice < 0) {
            throw invalid_argument("Price cannot be negative");
        }
    }

    string getItemId() const {
        return itemId;
    }

    string getName() const {
        return name;
    }

    string getCategory() const {
        return category;
    }

    int getPrice() const {
        return price;
    }

    bool isAvailable() const {
        return available;
    }

    void setAvailable(bool value) {
        available = value;
    }
};

// Represents an item and its quantity in an order
class OrderItem {
private:
    string itemId;
    string itemName;
    int unitPrice;
    int quantity;

public:
    OrderItem(string id, string name, int price, int qty)
        : itemId(id), itemName(name),
          unitPrice(price), quantity(qty) {
        if (price < 0 || qty <= 0) {
            throw invalid_argument("Invalid order item");
        }
    }

    string getItemId() const {
        return itemId;
    }

    string getItemName() const {
        return itemName;
    }

    int getQuantity() const {
        return quantity;
    }

    int getSubtotal() const {
        return unitPrice * quantity;
    }
};

// Represents the full order
enum class OrderStatus {
    Pending,
    Preparing,
    Completed
};

class Order {
private:
    string orderId;
    string studentId;
    int tableNumber;
    vector<OrderItem> items;
    OrderStatus status;

public:
    Order(string id, string student, int table)
        : orderId(id), studentId(student),
          tableNumber(table), status(OrderStatus::Pending) {
        if (table <= 0) {
            throw invalid_argument("Invalid table number");
        }
    }

    void addItem(const OrderItem& item) {
        items.push_back(item);
    }

    int getTotal() const {
        int total = 0;

        for (const auto& item : items) {
            total += item.getSubtotal();
        }

        return total;
    }

    string getOrderId() const {
        return orderId;
    }

    string getStudentId() const {
        return studentId;
    }

    int getTableNumber() const {
        return tableNumber;
    }

    const vector<OrderItem>& getItems() const {
        return items;
    }

    OrderStatus getStatus() const {
        return status;
    }

    void setStatus(OrderStatus newStatus) {
        status = newStatus;
    }
};

#endif


#ifndef CANTEEN_SYSTEM_H
#define CANTEEN_SYSTEM_H

#include <unordered_map>
#include <queue>
#include <string>
#include <vector>
#include <utility>
#include <sstream>
#include "../models/models.h"

using namespace std;

class CanteenSystem
{
private:
    unordered_map<string, Student> students;
    unordered_map<string, MenuItem> menu;
    unordered_map<string, Order> orders;
    queue<string> pendingOrders;
    int nextOrderNumber;

public:
    CanteenSystem() : nextOrderNumber(1001) {}

    void addStudent(const Student &student)
    {
        string id = student.getStudentId();
        auto it = students.find(id);

        if (it != students.end())
        {
            it->second = student;
        }
        else
        {
            students.insert(make_pair(id, student));
        }
    }

    void addMenuItem(const MenuItem &item)
    {
        string id = item.getItemId();
        auto it = menu.find(id);

        if (it != menu.end())
        {
            it->second = item;
        }
        else
        {
            menu.insert(make_pair(id, item));
        }
    }

    bool hasStudent(const string &studentId) const
    {
        return students.find(studentId) != students.end();
    }

    bool hasMenuItem(const string &itemId) const
    {
        return menu.find(itemId) != menu.end();
    }

    int getStudentBalance(const string &studentId) const
    {
        auto it = students.find(studentId);

        if (it == students.end())
        {
            return -1;
        }

        return it->second.getBalance();
    }

    int getMenuPrice(const string &itemId) const
    {
        auto it = menu.find(itemId);

        if (it == menu.end() || !it->second.isAvailable())
        {
            return -1;
        }

        return it->second.getPrice();
    }

    // Place an order using item IDs and quantities.
    // Returns true only when the order is accepted.
    bool placeOrder(
        const string &studentId,
        int tableNumber,
        const vector<pair<string, int>> &requestedItems,
        string &createdOrderId,
        string &message)
    {
        // Validate student and table.
        auto studentIt = students.find(studentId);

        if (studentIt == students.end())
        {
            message = "Student not found";
            return false;
        }

        if (tableNumber <= 0)
        {
            message = "Invalid table number";
            return false;
        }

        if (requestedItems.empty())
        {
            message = "Cart is empty";
            return false;
        }

        // Validate every item before changing the balance.
        int total = 0;

        for (const auto &requested : requestedItems)
        {
            auto itemIt = menu.find(requested.first);

            if (itemIt == menu.end())
            {
                message = "Menu item not found: " + requested.first;
                return false;
            }

            if (!itemIt->second.isAvailable())
            {
                message = "Item is unavailable: " +
                          itemIt->second.getName();
                return false;
            }

            if (requested.second <= 0)
            {
                message = "Quantity must be positive";
                return false;
            }

            int price = itemIt->second.getPrice();

            // Prevent integer overflow.
            if (price < 0 ||
                requested.second > (2147483647 - total) / (price == 0 ? 1 : price))
            {
                message = "Order total is invalid or too large";
                return false;
            }

            total += price * requested.second;
        }

        // Check balance before creating or accepting the order.
        if (total <= 0)
        {
            message = "Order total must be greater than zero";
            return false;
        }

        if (studentIt->second.getBalance() < total)
        {
            message = "Insufficient balance";
            return false;
        }

        // Create the order using prices stored in the backend.
        ostringstream idStream;
        idStream << "ORD" << nextOrderNumber;
        string orderId = idStream.str();

        Order newOrder(orderId, studentId, tableNumber);

        for (const auto &requested : requestedItems)
        {
            const MenuItem &item = menu.find(requested.first)->second;

            newOrder.addItem(
                OrderItem(
                    item.getItemId(),
                    item.getName(),
                    item.getPrice(),
                    requested.second));
        }

        // Deduct only after all validations succeed.
        if (!studentIt->second.deductBalance(total))
        {
            message = "Balance deduction failed";
            return false;
        }

        orders.insert(make_pair(orderId, newOrder));
        pendingOrders.push(orderId);

        createdOrderId = orderId;
        ++nextOrderNumber;

        message = "Order accepted";
        return true;
    }

    bool processNextOrder(string &orderId)
    {
        if (pendingOrders.empty())
        {
            return false;
        }

        orderId = pendingOrders.front();
        pendingOrders.pop();

        return true;
    }

    bool getOrder(const string &orderId, Order &result) const
    {
        auto it = orders.find(orderId);

        if (it == orders.end())
        {
            return false;
        }

        result = it->second;
        return true;
    }

    bool updateOrderStatus(
        const string &orderId,
        OrderStatus newStatus)
    {
        auto it = orders.find(orderId);

        if (it == orders.end())
        {
            return false;
        }

        it->second.setStatus(newStatus);
        return true;
    }
};

#endif

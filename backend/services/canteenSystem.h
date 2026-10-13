#ifndef CANTEEN_SYSTEM_H
#define CANTEEN_SYSTEM_H

#include "../models/models.h"
#include <vector>
#include <algorithm>

class CanteenSystem {
private:
    std::vector<Order> orders;
    int nextOrderId = 1001;

public:
    Order placeOrder(int studentId, int tableNumber, const std::vector<OrderItem>& items) {
        double total = 0.0;
        for (const auto& item : items) {
            total += item.price * item.quantity;
        }

        Order newOrder;
        newOrder.orderId = nextOrderId++;
        newOrder.studentId = studentId;
        newOrder.tableNumber = tableNumber;
        newOrder.items = items;
        newOrder.totalAmount = total;
        newOrder.status = "PENDING";

        orders.push_back(newOrder);
        return newOrder;
    }

    std::vector<Order> getOrdersForTable(int tableNumber) {
        std::vector<Order> tableOrders;
        for (const auto& order : orders) {
            if (order.tableNumber == tableNumber && order.status != "SERVED") {
                tableOrders.push_back(order);
            }
        }
        return tableOrders;
    }

    std::vector<Order> getAllActiveOrders() {
        std::vector<Order> active;
        for (const auto& order : orders) {
            if (order.status != "SERVED" && order.status != "CANCELLED") {
                active.push_back(order);
            }
        }
        return active;
    }

    bool updateStatus(int orderId, const std::string& newStatus) {
        for (auto& order : orders) {
            if (order.orderId == orderId) {
                order.status = newStatus;
                return true;
            }
        }
        return false;
    }
};

#endif // CANTEEN_SYSTEM_H
#ifndef ORDER_SYSTEM_H
#define ORDER_SYSTEM_H

#include "../models/orders.h"
#include <queue>            
#include <unordered_map>    
#include <vector>           
#include <algorithm>       
#include <iostream>

using namespace std;


class OrderSystem {
private:
    // DSA: Queue for FIFO Kitchen Order Processing
    queue<Order> pendingQueue;

    // DSA: Hash Map for O(1) direct lookup by orderId (e.g., "ORD1001")
    unordered_map<string, Order> orderMap;

    // DSA: Vector to retain complete order history
    vector<Order> allOrders;

public:
    OrderSystem() {}

    // Enqueue a newly placed order
    void addOrder(const Order& order) {
        // 1. Add to Hash Map for O(1) instant lookup
        orderMap[order.getOrderId()] = order;

        // 2. Add to FIFO queue for kitchen preparation
        if (order.getStatus() == "Pending") {
            pendingQueue.push(order);
        }

        // 3. Append to overall history
        allOrders.push_back(order);
    }

    // DSA: Hash Map Lookup - O(1) average time complexity
    Order* getOrderById(const string& orderId) {
        auto it = orderMap.find(orderId);
        if (it != orderMap.end()) {
            return &(it->second);
        }
        return nullptr;
    }

    // DSA: Queue Operation - Check if kitchen has waiting orders
    bool hasPendingOrders() const {
        return !pendingQueue.empty();
    }

    // DSA: Queue Operation - View the next order to cook without removing (O(1))
    Order peekNextOrder() const {
        if (!pendingQueue.empty()) {
            return pendingQueue.front();
        }
        return Order();
    }

    // DSA: Queue Operation - Process and pop the oldest pending order (O(1))
    bool processNextOrder() {
        if (pendingQueue.empty()) {
            return false;
        }

        Order current = pendingQueue.front();
        pendingQueue.pop(); // Dequeue FIFO

        // Update status in Hash Map and list
        string oid = current.getOrderId();
        if (orderMap.find(oid) != orderMap.end()) {
            orderMap[oid].updateStatus("Preparing");
        }

        for (auto& ord : allOrders) {
            if (ord.getOrderId() == oid) {
                ord.updateStatus("Preparing");
                break;
            }
        }
        return true;
    }

    // Update specific order status
    bool updateOrderStatus(const string& orderId, const string& newStatus) {
        auto it = orderMap.find(orderId);
        if (it == orderMap.end()) {
            return false;
        }

        bool updated = it->second.updateStatus(newStatus);
        if (updated) {
            for (auto& ord : allOrders) {
                if (ord.getOrderId() == orderId) {
                    ord.updateStatus(newStatus);
                    break;
                }
            }
        }
        return updated;
    }

    // Filter active orders for a specific table
    vector<Order> getOrdersForTable(int tableNumber) {
        vector<Order> tableOrders;
        for (const auto& ord : allOrders) {
            if (ord.getTableNumber() == tableNumber && ord.getStatus() != "Served" && ord.getStatus() != "Cancelled") {
                tableOrders.push_back(ord);
            }
        }
        return tableOrders;
    }

    // DSA: Sorting with std::sort (O(N log N))
    vector<Order> getAllOrdersSorted() {
        vector<Order> sortedOrders = allOrders;
        // Sort descending by order ID so newest orders appear first
        sort(sortedOrders.begin(), sortedOrders.end(),
            [](const Order& a, const Order& b) {
                return a.getOrderId() > b.getOrderId();
            });
        return sortedOrders;
    }

    int getPendingQueueSize() const {
        return pendingQueue.size();
    }
};

#endif // ORDER_SYSTEM_H

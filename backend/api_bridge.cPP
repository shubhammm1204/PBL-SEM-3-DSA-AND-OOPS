#include <iostream>
#include <string>
#include "services/canteenSystem.h"
#include "nlohmann/json.hpp"

using json = nlohmann::json;

CanteenSystem systemEngine;

int main() {
    std::string inputStr;
    if (std::getline(std::cin, inputStr)) {
        try {
            auto req = json::parse(inputStr);
            std::string action = req.value("action", "");
            json res;

            if (action == "CREATE_ORDER") {
                int studentId = req.value("studentId", 0);
                int tableNumber = req.value("tableNumber", 0);
                
                std::vector<OrderItem> items;
                for (auto& item : req["items"]) {
                    items.push_back({
                        item.value("menuItemId", 0),
                        item.value("name", ""),
                        item.value("quantity", 1),
                        item.value("price", 0.0)
                    });
                }

                Order created = systemEngine.placeOrder(studentId, tableNumber, items);

                res["success"] = true;
                res["orderId"] = created.orderId;
                res["tableNumber"] = created.tableNumber;
                res["status"] = created.status;
                res["totalAmount"] = created.totalAmount;
            } 
            else if (action == "GET_TABLE_ORDERS") {
                int tableNumber = req.value("tableNumber", 0);
                auto orders = systemEngine.getOrdersForTable(tableNumber);

                json orderArray = json::array();
                for (const auto& ord : orders) {
                    json o;
                    o["orderId"] = ord.orderId;
                    o["tableNumber"] = ord.tableNumber;
                    o["status"] = ord.status;
                    o["totalAmount"] = ord.totalAmount;
                    orderArray.push_back(o);
                }

                res["success"] = true;
                res["orders"] = orderArray;
            } 
            else {
                res["success"] = false;
                res["error"] = "Invalid action keyword";
            }

            std::cout << res.dump() << std::endl;
        } 
        catch (const std::exception& e) {
            json errRes;
            errRes["success"] = false;
            errRes["error"] = e.what();
            std::cout << errRes.dump() << std::endl;
        }
    }
    return 0;
}
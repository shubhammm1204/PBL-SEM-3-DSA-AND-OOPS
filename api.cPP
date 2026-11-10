#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <cstdlib>
#include "services/canteenSystem.h"

using namespace std;

CanteenSystem systemEngine;

string getJsonString(const string& json, const string& key) {
    string search = "\"" + key + "\"";
    size_t pos = json.find(search);
    if (pos == string::npos) return "";

    pos = json.find(':', pos + search.size());
    if (pos == string::npos) return "";

    pos = json.find('"', pos);
    if (pos == string::npos) return "";
    pos++;

    size_t endPos = json.find('"', pos);
    if (endPos == string::npos) return "";

    return json.substr(pos, endPos - pos);
}

int getJsonInt(const string& json, const string& key) {
    string search = "\"" + key + "\"";
    size_t pos = json.find(search);
    if (pos == string::npos) return 0;

    pos = json.find(':', pos + search.size());
    if (pos == string::npos) return 0;
    pos++;

    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t')) pos++;

    string numStr;
    while (pos < json.size() && (isdigit(json[pos]) || json[pos] == '-')) {
        numStr += json[pos++];
    }
    return numStr.empty() ? 0 : atoi(numStr.c_str());
}

vector<pair<string, int>> parseCartItems(const string& json) {
    vector<pair<string, int>> items;
    size_t pos = json.find("\"items\"");
    if (pos == string::npos) return items;

    pos = json.find('[', pos);
    if (pos == string::npos) return items;

    size_t endArray = json.find(']', pos);
    if (endArray == string::npos) return items;

    string arrayContent = json.substr(pos, endArray - pos + 1);

    size_t objStart = 0;
    while ((objStart = arrayContent.find('{', objStart)) != string::npos) {
        size_t objEnd = arrayContent.find('}', objStart);
        if (objEnd == string::npos) break;

        string itemObj = arrayContent.substr(objStart, objEnd - objStart + 1);

        string itemId = getJsonString(itemObj, "itemId");
        if (itemId.empty()) {
            itemId = getJsonString(itemObj, "menuItemId");
        }
        int qty = getJsonInt(itemObj, "quantity");
        if (qty <= 0) qty = 1;

        if (!itemId.empty()) {
            items.push_back(make_pair(itemId, qty));
        }

        objStart = objEnd + 1;
    }
    return items;
}

int main() {
    string inputStr;
    if (getline(cin, inputStr)) {
        string action = getJsonString(inputStr, "action");

        if (action == "GET_STUDENT_BALANCE") {
            string studentId = getJsonString(inputStr, "studentId");
            Student* s = systemEngine.getStudent(studentId);
            if (s) {
                cout << "{\"success\":true,\"studentId\":\"" << s->getStudentId()
                     << "\",\"name\":\"" << s->getName()
                     << "\",\"balance\":" << s->getBalance() << "}" << endl;
            } else {
                cout << "{\"success\":false,\"message\":\"Student ID not found\"}" << endl;
            }
        }
        else if (action == "CREATE_ORDER") {
            string studentId = getJsonString(inputStr, "studentId");
            int tableNumber = getJsonInt(inputStr, "tableNumber");
            vector<pair<string, int>> items = parseCartItems(inputStr);

            CanteenSystem::OrderResult res = systemEngine.placeOrder(studentId, tableNumber, items);

            if (res.success) {
                cout << "{\"success\":true,\"orderId\":\"" << res.orderId
                     << "\",\"tableNumber\":" << res.tableNumber
                     << ",\"status\":\"" << res.status
                     << "\",\"totalAmount\":" << res.totalAmount
                     << ",\"balance\":" << res.remainingBalance
                     << ",\"message\":\"" << res.message << "\"}" << endl;
            } else {
                cout << "{\"success\":false,\"message\":\"" << res.message
                     << "\",\"balance\":" << res.remainingBalance << "}" << endl;
            }
        }
        else if (action == "GET_TABLE_ORDERS") {
            int tableNumber = getJsonInt(inputStr, "tableNumber");
            vector<Order> tableOrders = systemEngine.getOrdersForTable(tableNumber);

            cout << "{\"success\":true,\"orders\":[";
            for (size_t i = 0; i < tableOrders.size(); ++i) {
                if (i > 0) cout << ",";
                cout << "{\"orderId\":\"" << tableOrders[i].getOrderId()
                     << "\",\"tableNumber\":" << tableOrders[i].getTableNumber()
                     << ",\"status\":\"" << tableOrders[i].getStatus()
                     << "\",\"totalAmount\":" << tableOrders[i].getTotalAmount() << "}";
            }
            cout << "]}" << endl;
        }
        else if (action == "PROCESS_NEXT_ORDER") {
            bool ok = systemEngine.processNextOrder();
            cout << "{\"success\":" << (ok ? "true" : "false")
                 << ",\"queueSize\":" << systemEngine.getQueueSize() << "}" << endl;
        }
        else {
            cout << "{\"success\":false,\"error\":\"Invalid action keyword\"}" << endl;
        }
    }
    return 0;
}
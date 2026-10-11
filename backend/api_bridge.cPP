#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <utility>

#include "models/models.h"
#include "services/canteenSystem.h"

using namespace std;

int main()
{
    // Keep this process running so in-memory state is retained.
    CanteenSystem canteen;

    // Register student
    canteen.addStudent(Student("GEU101", "Rahul", 200));

    // Menu IDs and prices match homepage.html exactly.
    canteen.addMenuItem(MenuItem("M001", "Campus Burger", "Burgers", 69));
    canteen.addMenuItem(MenuItem("M002", "Cheese Pizza", "Pizza", 99));
    canteen.addMenuItem(MenuItem("M003", "Masala Noodles", "Noodles", 50));
    canteen.addMenuItem(MenuItem("M004", "French Fries", "Snacks", 49));
    canteen.addMenuItem(MenuItem("M005", "Cold Coffee", "Drinks", 45));
    canteen.addMenuItem(MenuItem("M006", "Chocolate Brownie", "Desserts", 55));
    canteen.addMenuItem(MenuItem("M017", "Aloo Tikki Burger", "Burgers", 49));
    canteen.addMenuItem(MenuItem("M018", "Double Cheese Burger", "Burgers", 89));
    canteen.addMenuItem(MenuItem("M019", "Farmhouse Pizza", "Pizza", 129));
    canteen.addMenuItem(MenuItem("M020", "Paneer Pizza", "Pizza", 139));
    canteen.addMenuItem(MenuItem("M021", "Schezwan Noodles", "Noodles", 70));
    canteen.addMenuItem(MenuItem("M022", "Veg Momos", "Snacks", 50));
    canteen.addMenuItem(MenuItem("M023", "Fried Momos", "Snacks", 65));
    canteen.addMenuItem(MenuItem("M024", "Cheese Sandwich", "Snacks", 55));
    canteen.addMenuItem(MenuItem("M025", "Paneer Wrap", "Snacks", 79));
    canteen.addMenuItem(MenuItem("M026", "Peri Peri Fries", "Snacks", 59));
    canteen.addMenuItem(MenuItem("M027", "Mango Shake", "Drinks", 60));
    canteen.addMenuItem(MenuItem("M028", "Oreo Shake", "Drinks", 75));
    canteen.addMenuItem(MenuItem("M029", "Hot Coffee", "Drinks", 25));
    canteen.addMenuItem(MenuItem("M030", "Gulab Jamun", "Desserts", 35));
    canteen.addMenuItem(MenuItem("M031", "Chocolate Waffle", "Desserts", 69));

    string line;

    while (getline(cin, line))
    {
        istringstream input(line);
        string command;
        getline(input, command, '|');

        if (command == "HEALTH")
        {
            cout << "OK|SmartCanteen C++ ready" << endl;
        }
        else if (command == "STUDENT")
        {
            string studentId;
            getline(input, studentId, '|');

            if (!canteen.hasStudent(studentId))
            {
                cout << "ERROR|Student not found" << endl;
            }
            else
            {
                cout << "OK|"
                     << canteen.getStudentBalance(studentId)
                     << endl;
            }
        }
        else if (command == "ORDER")
        {
            string studentId;
            string tableText;
            string itemsText;

            getline(input, studentId, '|');
            getline(input, tableText, '|');
            getline(input, itemsText);

            int tableNumber;

            try
            {
                size_t pos;
                tableNumber = stoi(tableText, &pos);

                if (pos != tableText.size() || tableNumber <= 0)
                {
                    cout << "ERROR|Invalid table number" << endl;
                    continue;
                }
            }
            catch (...)
            {
                cout << "ERROR|Invalid table number" << endl;
                continue;
            }

            vector<pair<string, int>> items;
            istringstream itemStream(itemsText);
            string itemToken;
            bool invalid = false;

            while (getline(itemStream, itemToken, ','))
            {
                size_t colon = itemToken.find(':');

                if (colon == string::npos)
                {
                    invalid = true;
                    break;
                }

                string itemId = itemToken.substr(0, colon);
                string quantityText = itemToken.substr(colon + 1);

                try
                {
                    size_t pos;
                    int quantity = stoi(quantityText, &pos);

                    if (itemId.empty() ||
                        pos != quantityText.size() ||
                        quantity <= 0)
                    {
                        invalid = true;
                        break;
                    }

                    items.push_back(make_pair(itemId, quantity));
                }
                catch (...)
                {
                    invalid = true;
                    break;
                }
            }

            if (invalid || items.empty())
            {
                cout << "ERROR|Invalid cart" << endl;
                continue;
            }

            string orderId;
            string message;

            bool success = canteen.placeOrder(
                studentId,
                tableNumber,
                items,
                orderId,
                message);

            if (success)
            {
                cout << "OK|"
                     << orderId << "|"
                     << canteen.getStudentBalance(studentId) << "|"
                     << message << endl;
            }
            else
            {
                cout << "ERROR|" << message << endl;
            }
        }
        else
        {
            cout << "ERROR|Unknown command" << endl;
        }
    }

    return 0;
}
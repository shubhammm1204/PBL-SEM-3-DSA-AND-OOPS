
#ifndef MENU_ITEMS_H
#define MENU_ITEMS_H

#include <string>
using namespace std;

class MenuItem
{
private:
    string itemId;
    string name;
    string category;
    int price;
    bool available;

public:
    MenuItem()
        : price(0), available(false) {}

    MenuItem(string id, string itemName,
             string itemCategory, int itemPrice)
        : itemId(id),
          name(itemName),
          category(itemCategory),
          price(itemPrice < 0 ? 0 : itemPrice),
          available(true) {}

    string getItemId() const
    {
        return itemId;
    }

    string getName() const
    {
        return name;
    }

    string getCategory() const
    {
        return category;
    }

    int getPrice() const
    {
        return price;
    }

    bool isAvailable() const
    {
        return available;
    }

    void setAvailable(bool value)
    {
        available = value;
    }
};

#endif

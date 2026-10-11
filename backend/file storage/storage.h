
#ifndef STORAGE_H
#define STORAGE_H

#include <fstream>
#include <string>
#include <vector>
#include <cstdio>

using namespace std;

class Storage
{
private:
    string studentFile;
    string orderFile;

    vector<string> readLines(const string &path)
    {
        vector<string> records;
        ifstream file(path.c_str());
        string line;

        while (getline(file, line))
        {
            if (!line.empty())
            {
                records.push_back(line);
            }
        }

        return records;
    }

    bool writeLines(
        const string &path,
        const vector<string> &records)
    {
        string tempPath = path + ".tmp";
        ofstream file(tempPath.c_str());

        if (!file.is_open())
        {
            return false;
        }

        for (const string &record : records)
        {
            file << record << '\n';
        }

        file.close();

        if (!file)
        {
            remove(tempPath.c_str());
            return false;
        }

        // Windows may not replace an existing file using rename().
        // Remove the old file first if it exists.
        if (remove(path.c_str()) != 0)
        {
            ifstream existing(path.c_str());

            if (existing.good())
            {
                remove(tempPath.c_str());
                return false;
            }
        }

        if (rename(tempPath.c_str(), path.c_str()) != 0)
        {
            return false;
        }

        return true;
    }

public:
    Storage(
        const string &studentsPath = "data/students.txt",
        const string &ordersPath = "data/orders.txt") : studentFile(studentsPath),
                                                        orderFile(ordersPath) {}

    bool saveStudent(
        const string &studentId,
        const string &name,
        int balance)
    {
        if (studentId.empty() || balance < 0 ||
            studentId.find('|') != string::npos ||
            name.find('|') != string::npos)
        {
            return false;
        }

        vector<string> records = readLines(studentFile);
        string prefix = studentId + "|";
        string record = studentId + "|" + name + "|" +
                        to_string(balance);

        bool updated = false;

        for (string &existing : records)
        {
            if (existing.compare(0, prefix.size(), prefix) == 0)
            {
                existing = record;
                updated = true;
                break;
            }
        }

        if (!updated)
        {
            records.push_back(record);
        }

        return writeLines(studentFile, records);
    }

    vector<string> loadStudents()
    {
        return readLines(studentFile);
    }

    bool saveOrder(
        const string &orderId,
        const string &studentId,
        int tableNumber,
        int total,
        const string &status)
    {
        if (orderId.empty() || studentId.empty() ||
            tableNumber <= 0 || total < 0 ||
            orderId.find('|') != string::npos ||
            studentId.find('|') != string::npos ||
            status.find('|') != string::npos)
        {
            return false;
        }

        vector<string> records = readLines(orderFile);
        string prefix = orderId + "|";
        string record = orderId + "|" + studentId + "|" +
                        to_string(tableNumber) + "|" +
                        to_string(total) + "|" + status;

        bool updated = false;

        for (string &existing : records)
        {
            if (existing.compare(0, prefix.size(), prefix) == 0)
            {
                existing = record;
                updated = true;
                break;
            }
        }

        if (!updated)
        {
            records.push_back(record);
        }

        return writeLines(orderFile, records);
    }

    vector<string> loadOrders()
    {
        return readLines(orderFile);
    }
};

#endif

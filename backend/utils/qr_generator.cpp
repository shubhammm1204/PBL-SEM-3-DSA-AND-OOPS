#include <iostream>
#include <fstream>
#include <string>
#include <cstdio>
#include "qrcodegen.hpp"

using qrcodegen::QrCode;

std::string toSvgString(const QrCode &qr, int border) {
    std::string result = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    result += "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n";
    result += "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 ";
    result += std::to_string(qr.getSize() + border * 2) + " " + std::to_string(qr.getSize() + border * 2) + "\" stroke=\"none\">\n";
    result += "\t<rect width=\"100%\" height=\"100%\" fill=\"#FFFFFF\"/>\n";
    result += "\t<path d=\"";
    
    for (int y = 0; y < qr.getSize(); y++) {
        for (int x = 0; x < qr.getSize(); x++) {
            if (qr.getModule(x, y)) {
                if (x != 0 || y != 0)
                    result += " ";
                result += "M" + std::to_string(x + border) + "," + std::to_string(y + border) + "h1v1h-1z";
            }
        }
    }
    result += "\" fill=\"#000000\"/>\n";
    result += "</svg>\n";
    return result;
}

void generateTableQR(int tableNum, const std::string& baseUrl) {
    std::string targetUrl = baseUrl + "/?table=" + std::to_string(tableNum);
    
    QrCode qr = QrCode::encodeText(targetUrl.c_str(), QrCode::Ecc::MEDIUM);
    std::string svg = toSvgString(qr, 4);
    
    std::string filename = "frontend/qrcodes/table_" + std::to_string(tableNum) + ".svg";
    std::ofstream outFile(filename);
    outFile << svg;
    outFile.close();
    
    std::cout << "Generated: " << filename << " -> " << targetUrl << "\n";
}

int main() {
    // Updated IP address
    std::string baseUrl = "http://10.56.162.77:3000"; 
    int totalTables = 5;

    std::cout << "--- SmartCanteen Table QR Generator ---\n";
    for (int i = 1; i <= totalTables; i++) {
        generateTableQR(i, baseUrl);
    }
    std::cout << "QR Generation Complete.\n";
    return 0;
}

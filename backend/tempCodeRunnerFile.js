
const http = require("http");
const { spawn } = require("child_process");
const readline = require("readline");

const PORT = 18080;
const cpp = spawn(".\\api_bridge.exe", [], {
  stdio: ["pipe", "pipe", "inherit"]
});

const output = readline.createInterface({
  input: cpp.stdout
});

let waiting = null;

output.on("line", (line) => {
  if (waiting) {
    const resolve = waiting;
    waiting = null;
    resolve(line);
  }
});

cpp.on("error", (err) => {
  console.error("Could not start C++ backend:", err.message);
});

cpp.on("exit", (code) => {
  console.error("C++ backend exited:", code);
});

function sendToCpp(command) {
  return new Promise((resolve, reject) => {
    if (waiting) {
      reject(new Error("C++ request already in progress"));
      return;
    }

    waiting = resolve;
    cpp.stdin.write(command + "\n", (err) => {
      if (err && waiting) {
        waiting = null;
        reject(err);
      }
    });
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  res.end(JSON.stringify(data));
}

function parseCppResult(line) {
  const parts = line.split("|");

  if (parts[0] === "ERROR") {
    return { success: false, message: parts.slice(1).join("|") };
  }

  return { success: true, parts };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  try {
    if (req.method === "GET" && req.url === "/api/health") {
      const result = parseCppResult(await sendToCpp("HEALTH"));
      return sendJson(res, 200, {
        success: result.success,
        message: result.parts?.[1] || result.message
      });
    }

    const studentMatch = req.url.match(/^\/api\/students\/([A-Za-z0-9_-]+)$/);

    if (req.method === "GET" && studentMatch) {
      const result = parseCppResult(
        await sendToCpp(`STUDENT|${studentMatch[1]}`)
      );

      if (!result.success) {
        return sendJson(res, 404, result);
      }

      return sendJson(res, 200, {
        success: true,
        studentId: studentMatch[1],
        balance: Number(result.parts[1])
      });
    }

    if (req.method === "POST" && req.url === "/api/orders") {
      let body = "";

      for await (const chunk of req) {
        body += chunk;
        if (body.length > 100000) {
          return sendJson(res, 413, {
            success: false,
            message: "Request too large"
          });
        }
      }

      let data;

      try {
        data = JSON.parse(body);
      } catch {
        return sendJson(res, 400, {
          success: false,
          message: "Invalid JSON"
        });
      }

      if (
        typeof data.studentId !== "string" ||
        !/^[A-Za-z0-9_-]+$/.test(data.studentId) ||
        !Number.isInteger(data.tableNumber) ||
        !Array.isArray(data.items) ||
        data.items.length === 0 ||
        data.items.length > 50
      ) {
        return sendJson(res, 400, {
          success: false,
          message: "Invalid order request"
        });
      }

      const encodedItems = [];

      for (const item of data.items) {
        if (
          !item ||
          typeof item.itemId !== "string" ||
          !/^[A-Za-z0-9_-]+$/.test(item.itemId) ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0 ||
          item.quantity > 100
        ) {
          return sendJson(res, 400, {
            success: false,
            message: "Invalid cart item"
          });
        }

        encodedItems.push(`${item.itemId}:${item.quantity}`);
      }

      const command =
        `ORDER|${data.studentId}|${data.tableNumber}|${encodedItems.join(",")}`;

      const result = parseCppResult(await sendToCpp(command));

      if (!result.success) {
        return sendJson(res, 400, result);
      }

      return sendJson(res, 200, {
        success: true,
        orderId: result.parts[1],
        balance: Number(result.parts[2]),
        message: result.parts.slice(3).join("|")
      });
    }

    return sendJson(res, 404, {
      success: false,
      message: "Route not found"
    });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, {
      success: false,
      message: "Backend communication failed"
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`SmartCanteen API: http://localhost:${PORT}`);
});

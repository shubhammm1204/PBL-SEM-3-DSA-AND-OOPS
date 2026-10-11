const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const readline = require("readline");

const PORT = 18080;
const ALLOWED_ORIGIN = "http://127.0.0.1:3000";
const CPP_EXECUTABLE = path.join(__dirname, "api_bridge.exe");

let cpp = null;
let waiting = null;
let commandQueue = Promise.resolve();

function rejectWaitingRequest(child, error) {
  if (waiting && waiting.child === child) {
    const reject = waiting.reject;
    waiting = null;
    reject(error);
  }
}

function startCpp() {
  const child = spawn(CPP_EXECUTABLE, [], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  cpp = child;

  readline.createInterface({ input: child.stdout }).on("line", (line) => {
    if (waiting && waiting.child === child) {
      const resolve = waiting.resolve;
      waiting = null;
      resolve(line);
    } else {
      console.log("C++:", line);
    }
  });

  child.stderr.on("data", (data) => {
    const message = data.toString().trimEnd();
    if (message) {
      console.error("C++ stderr:", message);
    }
  });

  child.on("error", (err) => {
    console.error("Could not start C++ backend:", err.message);
    if (cpp === child) {
      cpp = null;
    }
    rejectWaitingRequest(child, err);
  });

  child.on("exit", (code) => {
    console.error("C++ backend exited:", code);
    if (cpp === child) {
      cpp = null;
    }
    rejectWaitingRequest(
      child,
      new Error(`C++ backend exited before responding (code ${code})`)
    );
  });

  return child;
}

function sendCommand(command) {
  return new Promise((resolve, reject) => {
    const child = cpp || startCpp();
    waiting = { child, resolve, reject };

    try {
      child.stdin.write(command + "\n", (err) => {
        if (err && waiting && waiting.child === child) {
          waiting = null;
          reject(err);
        }
      });
    } catch (err) {
      if (waiting && waiting.child === child) {
        waiting = null;
        reject(err);
      }
    }
  });
}

function sendToCpp(command) {
  const request = commandQueue.then(() => sendCommand(command));
  commandQueue = request.catch(() => {});
  return request;
}

process.once("exit", () => {
  if (cpp) {
    cpp.kill();
  }
});

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  res.end(JSON.stringify(data));
}

function parseCppResult(line) {
  const parts = line.split("|");

  if (parts[0] === "ERROR") {
    return {
      success: false,
      message: parts.slice(1).join("|"),
    };
  }

  if (parts[0] !== "OK") {
    return {
      success: false,
      message: `Unexpected C++ response: ${line}`,
    };
  }

  return { success: true, parts };
}

startCpp();

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  try {
    // Health check.
    if (req.method === "GET" && req.url === "/api/health") {
      const result = parseCppResult(await sendToCpp("HEALTH"));

      return sendJson(res, result.success ? 200 : 500, {
        success: result.success,
        message: result.parts?.[1] || result.message,
      });
    }

    // Get student balance.
    const studentMatch = req.url.match(/^\/api\/students\/([A-Za-z0-9_-]+)$/);

    if (req.method === "GET" && studentMatch) {
      const studentId = studentMatch[1];
      const result = parseCppResult(await sendToCpp(`STUDENT|${studentId}`));

      if (!result.success) {
        return sendJson(res, 404, result);
      }

      return sendJson(res, 200, {
        success: true,
        studentId,
        balance: Number(result.parts[1]),
      });
    }

    // Place an order.
    if (req.method === "POST" && req.url === "/api/orders") {
      let body = "";

      for await (const chunk of req) {
        body += chunk;

        if (body.length > 100000) {
          return sendJson(res, 413, {
            success: false,
            message: "Request too large",
          });
        }
      }

      let data;

      try {
        data = JSON.parse(body);
      } catch {
        return sendJson(res, 400, {
          success: false,
          message: "Invalid JSON",
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
          message: "Invalid order request",
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
            message: "Invalid cart item",
          });
        }

        encodedItems.push(`${item.itemId}:${item.quantity}`);
      }

      const command =
        `ORDER|${data.studentId}|${data.tableNumber}|` + encodedItems.join(",");

      const result = parseCppResult(await sendToCpp(command));

      if (!result.success) {
        return sendJson(res, 400, result);
      }

      return sendJson(res, 200, {
        success: true,
        orderId: result.parts[1],
        balance: Number(result.parts[2]),
        message: result.parts.slice(3).join("|"),
      });
    }

    return sendJson(res, 404, {
      success: false,
      message: "Route not found",
    });
  } catch (err) {
    console.error("Backend request error:", err);

    return sendJson(res, 500, {
      success: false,
      message: "Backend communication failed",
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`SmartCanteen API: http://localhost:${PORT}`);
});

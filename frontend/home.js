
"use strict";

const API_URL = "http://localhost:18080";
const STUDENT_ID = "GEU101";

const cart = new Map();

const navbarBalance = document.getElementById("navbar-balance");
const cardBalance = document.getElementById("card-balance");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartMessage = document.getElementById("cart-message");
const placeOrderButton = document.getElementById("place-order");
const tableNumberInput = document.getElementById("table-number");

// Display messages safely.
function showCartMessage(message, type = "") {
  cartMessage.textContent = message;
  cartMessage.className = type;
}

// Check that the backend is responding.
async function checkBackend() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Backend health check failed");
    }

    console.log("Backend:", data.message);
  } catch (error) {
    console.error("Cannot connect to backend:", error);
  }
}

// Fetch the student's real balance.
async function loadBalance() {
  try {
    const response = await fetch(
      `${API_URL}/api/students/${encodeURIComponent(STUDENT_ID)}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not load balance");
    }

    navbarBalance.textContent = data.balance;
    cardBalance.textContent = `${data.balance} Tokens`;

    console.log("Balance updated:", data.balance);
    return data.balance;
  } catch (error) {
    console.error("Balance error:", error);
    navbarBalance.textContent = "--";
    cardBalance.textContent = "Unavailable";
    return null;
  }
}

// Open and close the cart.
function openCart() {
  cartPanel.classList.add("visible");
  cartOverlay.classList.add("visible");
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartPanel.classList.remove("visible");
  cartOverlay.classList.remove("visible");
  cartPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

document.getElementById("cart-toggle").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

// Add items from the menu to the cart.
document.querySelectorAll(".food-card .add-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".food-card");

    const id = card.dataset.itemId;
    const name = card.dataset.name;
    const price = Number(card.dataset.price);

    if (
      !id ||
      !name ||
      !Number.isSafeInteger(price) ||
      price <= 0
    ) {
      showCartMessage("This food item has invalid details.", "error");
      openCart();
      return;
    }

    const existingItem = cart.get(id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.set(id, {
        id,
        name,
        price,
        quantity: 1,
      });
    }

    renderCart();
    showCartMessage(`${name} added to cart.`, "success");
  });
});

// Update quantities and calculate totals.
function renderCart() {
  let itemCount = 0;
  let total = 0;

  cartItems.replaceChildren();

  if (cart.size === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "Your cart is empty.";
    cartItems.appendChild(empty);
  }

  for (const item of cart.values()) {
    itemCount += item.quantity;
    total += item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("div");

    const name = document.createElement("h4");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = `₹${item.price} each`;

    details.append(name, price);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Remove one ${item.name}`);
    minus.addEventListener("click", () => changeQuantity(item.id, -1));

    const quantity = document.createElement("span");
    quantity.textContent = ` ${item.quantity} `;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Add one ${item.name}`);
    plus.addEventListener("click", () => changeQuantity(item.id, 1));

    const subtotal = document.createElement("p");
    subtotal.textContent = `₹${item.price * item.quantity}`;

    controls.append(minus, quantity, plus, subtotal);
    row.append(details, controls);
    cartItems.appendChild(row);
  }

  cartCount.textContent = itemCount;
  cartTotal.textContent = total;
  placeOrderButton.disabled = cart.size === 0;
}

// Change quantity or remove an item.
function changeQuantity(id, change) {
  const item = cart.get(id);

  if (!item) {
    return;
  }

  item.quantity += change;

  if (item.quantity <= 0) {
    cart.delete(id);
  }

  renderCart();
  showCartMessage("");
}

// Submit the order to the C++ backend through Node.js.
placeOrderButton.addEventListener("click", async () => {
  const tableNumber = Number(tableNumberInput.value);

  if (
    !Number.isInteger(tableNumber) ||
    tableNumber < 1 ||
    tableNumber > 1000
  ) {
    showCartMessage("Enter a valid table number.", "error");
    return;
  }

  if (cart.size === 0) {
    showCartMessage("Your cart is empty.", "error");
    return;
  }

  const order = {
    studentId: STUDENT_ID,
    tableNumber,
    items: Array.from(cart.values()).map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
    })),
  };

  placeOrderButton.disabled = true;
  showCartMessage("Placing your order...");

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Order could not be placed.");
    }

    cart.clear();
    renderCart();

    showCartMessage(
      `Order ${result.orderId} accepted! Remaining balance: ${result.balance} Tokens.`,
      "success"
    );

    await loadBalance();
  } catch (error) {
    console.error("Order error:", error);
    showCartMessage(error.message || "Unable to place order.", "error");
  } finally {
    placeOrderButton.disabled = cart.size === 0;
  }
});

// Allow students to open the cart from the hero section.
document.querySelector(".order-btn").addEventListener("click", () => {
  openCart();
});

// Scroll to the balance card.
document.getElementById("view-tokens").addEventListener("click", () => {
  document.querySelector(".token-section").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
});

// Initialize the page.
renderCart();
checkBackend();
loadBalance();

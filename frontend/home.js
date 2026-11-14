"use strict";

// Automatically adapts to backend on whatever port it is opened, or defaults to port 5000
const API_URL = (window.location.port && window.location.port !== "5500")
  ? window.location.origin
  : `http://${window.location.hostname || "localhost"}:5000`;
let STUDENT_ID = "";
let CURRENT_PROFILE = null;
const supabaseClient = window.cbSupabase;

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
const tableSelector = document.getElementById("tableSelector");

//  TABLE NUMBER MANAGEMENT & SYNC
function syncTableNumber(value) {
  let tableNum = Number(value);
  if (isNaN(tableNum) || tableNum < 1) tableNum = 1;
  if (tableNum > 5) tableNum = 5;

  localStorage.setItem("activeTableNumber", tableNum);
  if (tableSelector) tableSelector.value = tableNum;
  if (tableNumberInput) tableNumberInput.value = tableNum;

  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set("table", tableNum);
  window.history.replaceState({}, "", newUrl);
}

function initTableSync() {
  const urlParams = new URLSearchParams(window.location.search);
  let activeTable = Number(urlParams.get("table")) || Number(localStorage.getItem("activeTableNumber")) || 1;
  syncTableNumber(activeTable);

  if (tableSelector) {
    tableSelector.addEventListener("change", (e) => syncTableNumber(e.target.value));
  }
  if (tableNumberInput) {
    tableNumberInput.addEventListener("input", (e) => syncTableNumber(e.target.value));
    tableNumberInput.addEventListener("change", (e) => syncTableNumber(e.target.value));
  }
}

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
    const { data: { session } } = await supabaseClient.auth.getSession();
    const response = await fetch(
      `${API_URL}/api/students/${encodeURIComponent(STUDENT_ID)}`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
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

// Load the live menu catalogue. Admin edits are reflected here and the same
// snapshot is used by the C++ order validator for authoritative prices.
const studentMenu = document.getElementById("student-menu");

// Food image paths mapped using menu item IDs
const MENU_IMAGES = {
  M001: "IMAGES/campus burger.png",
  M002: "IMAGES/chesse Pizza.png",
  M003: "IMAGES/masala noodles.png",
  M004: "IMAGES/french fries.png",
  M005: "IMAGES/cold coffee.png",
  M006: "IMAGES/browine.png",
  M017: "IMAGES/aalo tikki burger.png",
  M018: "IMAGES/double chesse burger.png",
  M019: "IMAGES/farmhouse.png",
  M020: "IMAGES/panner pizza.png",
  M021: "IMAGES/scehzwan.png",
  M022: "IMAGES/veg momo.png",
  M023: "IMAGES/fried momo.png",
  M024: "IMAGES/cheese sandwich.png",
  M025: "IMAGES/panner wrap.png",
  M026: "IMAGES/peri peri fries.png",
  M027: "IMAGES/mango shake.png",
  M028: "IMAGES/oreo shake.png",
  M029: "IMAGES/hot coffee.png",
  M030: "IMAGES/gulab jamun.png",
  M031: "IMAGES/waffle.png"
};

// Load the live menu with food images
async function loadLiveMenu() {
  const { data: { session } } =
    await supabaseClient.auth.getSession();

  const response = await fetch(`${API_URL}/api/menu`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  const items = await response.json();

  if (!response.ok) {
    throw new Error(items.error || "Could not load menu");
  }

  studentMenu.replaceChildren();

  for (const item of items.filter(m => m.available)) {
    const card = document.createElement("article");

    card.className = "food-card";
    card.dataset.itemId = item.id;
    card.dataset.name = item.name;
    card.dataset.price = item.price;

    // Food image
    const image = document.createElement("div");
    image.className = "food-image";

    const imagePath = MENU_IMAGES[item.id];

    if (imagePath) {
      const img = document.createElement("img");
      img.src = imagePath;
      img.alt = item.name;
      img.loading = "lazy";

      img.onerror = () => {
        img.style.display = "none";
        image.textContent = item.emoji || "🍽️";
      };

      image.appendChild(img);
    } else {
      image.textContent = item.emoji || "🍽️";
    }

    // Food details
    const info = document.createElement("div");
    info.className = "food-info";

    const category = document.createElement("span");
    category.className = "food-category";
    category.textContent = item.category;

    const title = document.createElement("h3");
    title.textContent = item.name;

    const desc = document.createElement("p");
    desc.textContent = "Freshly prepared at Campus Bites.";

    const bottom = document.createElement("div");
    bottom.className = "food-bottom";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = `₹${item.price}`;

    const add = document.createElement("button");
    add.className = "add-cart";
    add.type = "button";
    add.innerHTML =
      '<i class="fa-solid fa-cart-plus"></i> Add';

    bottom.append(price, add);
    info.append(category, title, desc, bottom);

    card.append(image, info);
    studentMenu.appendChild(card);
  }
}

studentMenu.addEventListener("click", event => {
  const button = event.target.closest(".add-cart"); if (!button) return;
  const card = button.closest(".food-card");
  const id = card.dataset.itemId, name = card.dataset.name, price = Number(card.dataset.price);
  if (!id || !name || !Number.isSafeInteger(price) || price <= 0) { showCartMessage("This food item has invalid details.", "error"); openCart(); return; }
  const existing = cart.get(id);
  if (existing) existing.quantity += 1; else cart.set(id, { id, name, price, quantity: 1 });
  renderCart(); showCartMessage(`${name} added to cart.`, "success");
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
    tableNumber > 5
  ) {
    showCartMessage("Enter a valid table number (1 to 5).", "error");
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
        "Authorization": `Bearer ${(await supabaseClient.auth.getSession()).data.session.access_token}`,
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
      `Order ${result.orderId} accepted for Table ${tableNumber}! Remaining balance: ${result.balance} Tokens.`,
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

// Protect the student dashboard and bind it to the signed-in college account.
async function initializeStudentDashboard() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { location.replace("/login"); return; }
    const response = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${session.access_token}` } });
    const profile = await response.json();
    if (!response.ok) throw new Error(profile.error || "Account verification failed");
    if (profile.role === "admin") { location.replace("/admin"); return; }
    if (profile.role !== "student") throw new Error("This dashboard is for student accounts.");
    CURRENT_PROFILE = profile; STUDENT_ID = profile.collegeId;
    document.body.style.visibility = "visible";
    const logout = document.getElementById("student-logout");
    if (logout) logout.addEventListener("click", async () => { await supabaseClient.auth.signOut(); location.replace("/login"); });
    initTableSync(); renderCart(); checkBackend();
    await loadLiveMenu(); await loadBalance();
  } catch (error) { console.error(error); alert(error.message); await supabaseClient.auth.signOut(); location.replace("/login"); }
}
initializeStudentDashboard();
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

let orders = [];
let menuItems = [];

const customers = [
  ["Aarav Sharma","GEU101","aarav.student@example.com",18,"₹2,140","Active"],
  ["Priya Verma","GEU102","priya.student@example.com",14,"₹1,820","Active"],
  ["Rohan Gupta","GEU103","rohan.student@example.com",11,"₹1,260","Active"],
  ["Ananya Singh","GEU104","ananya.student@example.com",9,"₹980","Active"],
  ["Kabir Joshi","GEU105","kabir.student@example.com",7,"₹740","Active"],
  ["Meera Nair","GEU106","meera.student@example.com",5,"₹510","Active"]
];

let rechargeHistory = [];
let selectedTokenAccount = null;

const inventory = [
  ["Burger buns","ING-001",18,20],
  ["Cheese slices","ING-002",42,15],
  ["Cold coffee mix","ING-003",8,12],
  ["Potatoes","ING-004",7,15],
  ["Pizza base","ING-005",25,10]
];

let activeOrderFilter = "All";
let activeMenuCategory = "All";

function statusClass(s) {
  return s.toLowerCase().replace(/\s/g,"-");
}

function customerCell(name, initials) {
  return `<div class="customer-cell">
    <span class="mini-avatar">${initials}</span>
    <strong>${name}</strong>
  </div>`;
}

function renderOrders(targetId, filter="All", search="") {
  const rows = orders.filter(o =>
    (filter==="All" || o.status===filter) &&
    `${o.id} ${o.name} ${o.items}`.toLowerCase().includes(search.toLowerCase())
  );

  $(targetId).innerHTML = rows.length
    ? rows.map(o => `
      <tr>
        <td class="order-id">${o.id}</td>
        <td>${customerCell(o.name,o.initials)}</td>
        <td>${o.items}</td>
        <td>Table ${o.table}</td>
        <td><strong>₹${o.amount}</strong></td>
        <td>
          <span class="status ${statusClass(o.status)}">${o.status}</span>
        </td>
        <td>
          ${o.status==="Completed"
            ? "—"
            : `<button class="small-action" data-order="${o.id}">
                ${nextAction(o.status)}
              </button>`
          }
        </td>
      </tr>
    `).join("")
    : `<tr>
        <td colspan="7" style="text-align:center;padding:28px;color:#a49a8d">
          No matching orders found.
        </td>
      </tr>`;
}

function nextAction(status) {
  return status==="Pending"
    ? "Start preparing"
    : status==="Preparing"
      ? "Mark ready"
      : "Complete";
}

function updateCounts() {
  const count = orders.filter(o =>
    ["Pending","Preparing"].includes(o.status)
  ).length;

  $("#pending-stat").textContent = count;
  $("#pending-nav-count").textContent = count;
  $("#all-order-count").textContent = orders.length;
}

function renderAllOrders() {
  renderOrders("#orders-body",activeOrderFilter,$("#order-search").value);
  renderOrders("#recent-orders-body","All","");
  updateCounts();
}

// LOAD REAL ORDERS FROM BACKEND
async function loadOrders() {
  try {
    const result = await window.CBAdminApi.listOrders();

    orders = Array.isArray(result.orders)
      ? result.orders
      : [];

    renderAllOrders();

  } catch(error) {
    console.error("Order loading error:",error);
    showToast(error.message || "Could not load orders.");
  }
}

// MENU
async function renderMenu() {
  try {
    menuItems = await window.CBAdminApi.listMenu();
  } catch(error) {
    showToast(error.message);
    return;
  }

  const term = $("#menu-search").value.toLowerCase();

  const filtered = menuItems.filter(m =>
    (activeMenuCategory==="All" || m.category===activeMenuCategory) &&
    m.name.toLowerCase().includes(term)
  );

  $("#menu-grid").innerHTML = filtered.map(m => `
    <div class="menu-card">
      <div class="menu-emoji">${m.emoji}</div>

      <div class="menu-info">
        <strong>${escapeHtml(m.name)}</strong>

        <small>
          ${escapeHtml(m.category)} ·
          <span style="color:${m.available?'#39834d':'#b65c42'}">
            ${m.available?'Available':'Unavailable'}
          </span>
        </small>

        <div class="menu-price">₹${m.price}</div>
      </div>

      <div class="menu-card-actions">
        <button class="tiny-btn"
          data-edit-item="${menuItems.indexOf(m)}">
          Edit
        </button>

        <button class="tiny-btn"
          data-toggle-item="${menuItems.indexOf(m)}">
          ${m.available?'On':'Off'}
        </button>
      </div>
    </div>
  `).join("") || `
    <p style="padding:25px;color:#9a9082">
      No menu items found.
    </p>`;
}

// INVENTORY
function renderInventory() {
  $("#inventory-body").innerHTML = inventory.map(i => {
    const low = i[2] <= i[3];

    return `
      <tr>
        <td><strong>${i[0]}</strong></td>
        <td>${i[1]}</td>
        <td>${i[2]} units</td>
        <td>${i[3]} units</td>
        <td>
          <span class="status ${low?'pending':'ready'}">
            ${low?'Low stock':'In stock'}
          </span>
        </td>
        <td>
          <button class="small-action"
            data-restock="${inventory.indexOf(i)}">
            Restock
          </button>
        </td>
      </tr>`;
  }).join("");
}

// CUSTOMERS
function renderCustomers(term="") {
  const filtered = customers.filter(c =>
    c.join(" ").toLowerCase().includes(term.toLowerCase())
  );

  $("#customers-body").innerHTML = filtered.map(c => `
    <tr>
      <td><strong>${c[0]}</strong></td>
      <td>${c[1]}</td>
      <td>${c[2]}</td>
      <td>${c[3]}</td>
      <td><strong>${c[4]}</strong></td>
      <td><span class="status ready">${c[5]}</span></td>
    </tr>
  `).join("") || `
    <tr>
      <td colspan="6" style="text-align:center;padding:25px">
        No students found.
      </td>
    </tr>`;
}

// HELPERS
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g,c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&#39;"
  }[c]));
}

function showToast(message) {
  const t = $("#toast");
  t.textContent = message;
  t.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() =>
    t.classList.remove("show"),2400
  );
}

function goTo(page) {
  $$(".page-section").forEach(s =>
    s.classList.toggle("active",s.id===`page-${page}`)
  );

  $$(".nav-item[data-page]").forEach(b =>
    b.classList.toggle("active",b.dataset.page===page)
  );

  const title = page==="menu"
    ? "Menu management"
    : page==="tokens"
      ? "Token recharge"
      : page.charAt(0).toUpperCase()+page.slice(1);

  $("#breadcrumb-current").textContent = title;
  $("#sidebar").classList.remove("open");
}

// NAVIGATION
$$(".nav-item[data-page]").forEach(b =>
  b.addEventListener("click",()=>goTo(b.dataset.page))
);

$$("[data-go]").forEach(b =>
  b.addEventListener("click",()=>goTo(b.dataset.go))
);

$("#menu-toggle").addEventListener("click",() =>
  $("#sidebar").classList.toggle("open")
);

// ORDER FILTERS
$("#order-tabs").addEventListener("click",e => {
  const b = e.target.closest("[data-filter]");
  if(!b) return;

  activeOrderFilter = b.dataset.filter;

  $$(".tab",$("#order-tabs")).forEach(t =>
    t.classList.toggle("active",t===b)
  );

  renderOrders(
    "#orders-body",
    activeOrderFilter,
    $("#order-search").value
  );
});

$("#order-search").addEventListener("input",() =>
  renderOrders(
    "#orders-body",
    activeOrderFilter,
    $("#order-search").value
  )
);

// ORDER STATUS BUTTON
$("#orders-body").addEventListener("click",e => {
  const b = e.target.closest("[data-order]");
  if(!b) return;

  const o = orders.find(x => x.id===b.dataset.order);
  if(!o) return;

  o.status = o.status==="Pending"
    ? "Preparing"
    : o.status==="Preparing"
      ? "Ready"
      : "Completed";

  renderAllOrders();

  showToast(`${o.id} updated to ${o.status}`);
});

$("#recent-orders-body").addEventListener("click",e => {
  const b = e.target.closest("[data-order]");
  if(!b) return;

  goTo("orders");

  const o = orders.find(x => x.id===b.dataset.order);

  activeOrderFilter = "All";

  renderOrders("#orders-body","All","");

  if(o) showToast(`Viewing ${o.id}`);
});

// REFRESH ORDERS
$("#refresh-orders").addEventListener("click",async() => {
  await loadOrders();
  showToast("Orders refreshed");
});

// MENU FILTERS
$("#menu-tabs").addEventListener("click",e => {
  const b = e.target.closest("[data-category]");
  if(!b) return;

  activeMenuCategory = b.dataset.category;

  $$(".tab",$("#menu-tabs")).forEach(t =>
    t.classList.toggle("active",t===b)
  );

  renderMenu();
});

$("#menu-search").addEventListener("input",renderMenu);

// MENU EDIT AND AVAILABILITY
$("#menu-grid").addEventListener("click",async e => {
  const edit = e.target.closest("[data-edit-item]");
  const toggle = e.target.closest("[data-toggle-item]");

  if(edit) {
    const item = menuItems[Number(edit.dataset.editItem)];

    const name = prompt("Menu item name:",item.name);
    if(name===null) return;

    const priceText = prompt("Price in tokens:",String(item.price));
    if(priceText===null) return;

    const price = Number(priceText);

    if(!name.trim() || !Number.isSafeInteger(price) || price<1) {
      showToast("Enter a valid item name and whole-number price.");
      return;
    }

    try {
      await window.CBAdminApi.updateMenu(
        item.id,
        {name:name.trim(),price}
      );

      showToast("Menu item updated.");
      await renderMenu();

    } catch(error) {
      showToast(error.message);
    }

    return;
  }

  if(toggle) {
    const item = menuItems[Number(toggle.dataset.toggleItem)];

    try {
      const updated = await window.CBAdminApi.updateMenu(
        item.id,
        {available:!item.available}
      );

      showToast(
        `${updated.name} is now ${
          updated.available?"available":"unavailable"
        }`
      );

      await renderMenu();

    } catch(error) {
      showToast(error.message);
    }
  }
});

// ADD MENU ITEM MODAL
const modal = $("#item-modal");

function openModal() {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
  $("#item-name").focus();
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
  $("#item-form").reset();
  $("#item-emoji").value = "🍽️";
}

$("#add-item-button").addEventListener("click",openModal);
$("#close-modal").addEventListener("click",closeModal);
$("#cancel-modal").addEventListener("click",closeModal);

modal.addEventListener("click",e => {
  if(e.target===modal) closeModal();
});

$("#item-form").addEventListener("submit",async e => {
  e.preventDefault();

  try {
    await window.CBAdminApi.addMenu({
      name:$("#item-name").value.trim(),
      price:Number($("#item-price").value),
      category:$("#item-category").value,
      emoji:$("#item-emoji").value.trim() || "🍽️"
    });

    closeModal();
    await renderMenu();

    showToast("Menu item saved.");

  } catch(error) {
    showToast(error.message);
    alert(error.message);
  }
});

// TOKEN RECHARGE
function initialsFor(name) {
  return name.split(/\s+/)
    .slice(0,2)
    .map(part=>part[0])
    .join("")
    .toUpperCase();
}

function renderRechargeHistory() {
  $("#recharge-count").textContent =
    `${rechargeHistory.length} transaction${
      rechargeHistory.length===1?"":"s"
    }`;

  $("#recharge-history-body").innerHTML =
    rechargeHistory.length
      ? rechargeHistory.map(tx => `
        <tr>
          <td>${new Date(tx.created_at).toLocaleString()}</td>
          <td><strong>${tx.college_id}</strong></td>
          <td>${tx.member_name}</td>
          <td>${tx.member_role}</td>
          <td class="token-positive">+${tx.amount} tokens</td>
          <td>${tx.note||"—"}</td>
        </tr>
      `).join("")
      : `
        <tr>
          <td colspan="6" class="empty-history">
            No recharge transactions yet.
          </td>
        </tr>`;
}

async function loadRechargeHistory() {
  rechargeHistory = await window.CBAdminApi.history();
  renderRechargeHistory();
}

function showTokenAccount(account) {
  selectedTokenAccount = account;

  $("#token-empty-state").hidden = true;
  $("#token-member-card").hidden = false;

  $("#member-avatar").textContent = initialsFor(account.name);
  $("#member-name").textContent = account.name;
  $("#member-role").textContent = account.role;
  $("#member-college-id").textContent = account.collegeId;
  $("#member-balance").textContent = account.balance;

  $("#token-amount").value = "";
  $("#recharge-note").value = "";
}

$("#token-search-form").addEventListener("submit",async e => {
  e.preventDefault();

  const id = $("#college-id-input").value.trim().toUpperCase();

  try {
    const account = await window.CBAdminApi.findMember(id);
    showTokenAccount(account);

  } catch(error) {
    selectedTokenAccount = null;

    $("#token-member-card").hidden = true;
    $("#token-empty-state").hidden = false;

    $("#token-empty-state").innerHTML = `
      <span>⌕</span>
      <strong>Account not found</strong>
      <p>${escapeHtml(error.message)}</p>
    `;

    showToast(error.message);
  }
});

$("#token-recharge-form").addEventListener("submit",async e => {
  e.preventDefault();

  if(!selectedTokenAccount) return;

  const amount = Number($("#token-amount").value);

  if(!Number.isSafeInteger(amount) || amount<=0) {
    showToast("Enter a valid positive whole number");
    return;
  }

  const note = $("#recharge-note").value.trim();

  if(!confirm(
    `Add ${amount} tokens to ${selectedTokenAccount.name} (${selectedTokenAccount.collegeId})?`
  )) return;

  const submit = e.submitter;
  if(submit) submit.disabled = true;

  try {
    const result = await window.CBAdminApi.recharge(
      selectedTokenAccount.collegeId,
      amount,
      note
    );

    selectedTokenAccount = result.member;

    $("#member-balance").textContent = result.member.balance;
    $("#token-amount").value = "";
    $("#recharge-note").value = "";

    await loadRechargeHistory();

    showToast(
      `${amount} tokens credited to ${result.member.name}`
    );

  } catch(error) {
    showToast(error.message);
    alert(error.message);

  } finally {
    if(submit) submit.disabled = false;
  }
});

// INVENTORY ACTIONS
$("#inventory-body").addEventListener("click",e => {
  const b = e.target.closest("[data-restock]");
  if(!b) return;

  const item = inventory[Number(b.dataset.restock)];

  item[2] += 20;

  renderInventory();

  showToast(`${item[0]} restocked by 20 units`);
});

$("#add-stock-button").addEventListener("click",() =>
  showToast("Stock form can be connected in the backend phase.")
);

// CUSTOMER SEARCH AND EXPORT
$("#customer-search").addEventListener("input",e =>
  renderCustomers(e.target.value)
);

$("#customer-export").addEventListener("click",() =>
  downloadCSV(
    "campus-bites-customers.csv",
    ["Name","Student ID","Email","Orders","Total spent","Status"],
    customers
  )
);

// CSV DOWNLOAD
function downloadCSV(filename,headers,rows) {
  const csv = [headers,...rows]
    .map(r=>r.map(v=>
      `"${String(v).replaceAll('"','""')}"`
    ).join(","))
    .join("\n");

  const blob = new Blob([csv],{type:"text/csv"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function reportRows() {
  return [
    ["Metric","Value"],
    ["Revenue","24580"],
    ["Orders",orders.length],
    ["Active customers",customers.length],
    ["Pending orders",orders.filter(o=>o.status==="Pending").length]
  ];
}

$("#download-report").addEventListener("click",() =>
  downloadCSV(
    "campus-bites-report.csv",
    reportRows()[0],
    reportRows().slice(1)
  )
);

$("#reports-export").addEventListener("click",() =>
  downloadCSV(
    "campus-bites-report.csv",
    reportRows()[0],
    reportRows().slice(1)
  )
);

// SETTINGS AND HELP
$("#save-settings").addEventListener("click",() =>
  showToast("Settings saved in this preview only.")
);

$("#help-link").addEventListener("click",e => {
  e.preventDefault();
  showToast("Operations guide will be added in a later phase.");
});

// INITIAL RENDER
renderAllOrders();
renderMenu();
renderInventory();
renderCustomers();

// ADMIN AUTHENTICATION AND DATA LOADING
(async() => {
  try {
    await window.CBAdminAuth.requireAdmin();

    await loadOrders();
    await loadRechargeHistory();

  } catch(error) {
    alert(error.message);
    window.location.replace("admin-login.html");
  }
})();

// SIGN OUT
const signoutButton = $("#admin-signout");

if(signoutButton) {
  signoutButton.addEventListener("click",() =>
    window.CBAdminAuth.signOut()
  );
}
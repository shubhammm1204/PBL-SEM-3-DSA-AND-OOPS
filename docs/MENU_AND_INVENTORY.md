# Menu & Inventory Module Architecture

This document outlines the design, data structures, and API flow for the **Menu & Inventory** module in Campus Bites.

## 1. Module Responsibilities
- Maintain real-time item availability, pricing, and category groupings.
- Synchronize item stock levels between the backend data store and the live student ordering interface.
- Support admin-side price updates and item status toggles without server restarts.

## 2. Data Structures & Storage
- **Hash Map (`unordered_map` / key-value lookup):** Maps unique `item_id` keys directly to item records (`name`, `category`, `price`, `stock_count`, `is_available`) for $O(1)$ average-time lookup during order validation.
- **Dynamic Array / Vector:** Stores ordered menu listings for category-based filtering and price sorting on the client interface.
- **Persistent Store (`backend/data/menu.txt`):** Delimited flat-file storage ensuring inventory state persists across server sessions.

### Record Schema
| Field | Type | Description |
|---|---|---|
| `item_id` | String | Unique identifier (e.g., `ITEM_101`) |
| `name` | String | Display name of the food item |
| `category` | String | Menu group (`Snacks`, `Beverages`, `Meals`) |
| `price` | Number | Unit cost in INR (`₹`) |
| `stock` | Integer | Remaining available quantity |
| `available` | Boolean | Active visibility flag on student menu |

## 3. API Endpoints
- **`GET /api/menu`**
  - Reads current menu records from `backend/data/menu.txt`.
  - Filters out unavailable items for the student view and returns the full list for the admin dashboard.
- **`POST /api/menu/update`**
  - Validates admin session tokens via `backend/middleware/`.
  - Updates item price or stock count in memory and flushes the updated state back to `menu.txt`.
- **`POST /api/menu/validate-cart`**
  - Verifies requested item quantities against live `stock` counts prior to order confirmation and token deduction.

## 4. Integration Flow
1. Student loads the ordering page, triggering `GET /api/menu`.
2. Selected items are cross-checked against live inventory before creating a pending order entry.
3. Upon order confirmation, stock counts decrement atomically to prevent overselling during peak canteen hours.
4. Admin edits made through `admin.html` immediately reflect on subsequent menu fetches.

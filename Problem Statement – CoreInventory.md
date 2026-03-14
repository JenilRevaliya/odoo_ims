Problem Statement – CoreInventory

The project asks you to **build a modular Inventory Management System (IMS)**.

### What does this mean?

A **modular system** means the application is divided into different independent parts such as:

* Products module
* Receipts module
* Delivery module
* Transfers module
* Adjustment module

Each module performs a **specific function**, making the system easier to maintain and expand.

### Why is this system needed?

Currently many businesses manage stock using:

* Manual registers
* Excel spreadsheets
* Separate tracking files
* Paper documentation

These methods cause several problems:

1. Data inconsistency
2. Difficulty tracking real-time stock
3. Errors in stock counting
4. Poor coordination between departments
5. Lack of centralized information

### Goal of the System

The goal of CoreInventory is to **replace manual and scattered inventory tracking methods with a centralized digital application** that manages stock operations in real time. 

This means the system will:

* Store all inventory data in one place
* Update stock automatically
* Track every stock movement
* Provide a dashboard overview
* Allow multiple warehouses

---

# 2. Target Users

The system identifies two main user groups.

## 1. Inventory Managers

These users supervise the inventory system.

Responsibilities include:

* Monitoring stock levels
* Checking incoming shipments
* Tracking outgoing deliveries
* Reviewing stock alerts
* Managing warehouse operations

They mainly use the **dashboard and reporting features**.

---

## 2. Warehouse Staff

These users perform physical operations in the warehouse.

Their tasks include:

* Receiving goods from suppliers
* Picking items for orders
* Packing shipments
* Shelving products
* Moving items between racks
* Counting physical inventory

They interact mostly with **operations modules**.

---

# 3. Authentication System

Before accessing the system, users must authenticate.

Authentication ensures that **only authorized users can access inventory data**.

### Login Process

The system supports:

1. **User Sign-Up**
2. **User Login**

After login, the user is redirected to the **Inventory Dashboard**.

---

### Password Reset

If the user forgets their password:

1. They request a password reset
2. System sends **OTP (One Time Password)**
3. User verifies OTP
4. User resets password

OTP-based reset improves **security**.

---

# 4. Dashboard View

After login, the user lands on the **Dashboard**.

The dashboard provides a **quick overview of inventory activity**.

It acts as the **control center of the system**.

Instead of checking multiple modules, the dashboard gives an instant summary.

---

# 5. Dashboard KPIs (Key Performance Indicators)

KPIs show important real-time statistics.

### 1. Total Products in Stock

This shows the **total number of products currently available** across all warehouses.

Example:

```
Total Products: 1250
```

This helps managers understand the **inventory size**.

---

### 2. Low Stock / Out of Stock Items

These indicators warn when inventory is running out.

Two types of alerts:

Low Stock
Example:

```
Product: Steel Rod
Current Stock: 5
Minimum Required: 20
```

Out of Stock

```
Product: Copper Wire
Stock: 0
```

This helps avoid **production delays or sales loss**.

---

### 3. Pending Receipts

These represent **incoming shipments not yet processed**.

Example:

```
Supplier shipment expected
Status: Waiting
```

Until the receipt is validated, stock is **not added to inventory**.

---

### 4. Pending Deliveries

These are **orders that need to be shipped to customers**.

Example:

```
Customer Order #105
Status: Waiting for dispatch
```

Once validated, stock will **reduce**.

---

### 5. Internal Transfers Scheduled

These represent **planned stock movements between locations**.

Example:

```
Warehouse A → Production Floor
Status: Scheduled
```

This helps warehouse staff prepare transfers.

---

# 6. Dynamic Filters

Filters allow users to quickly narrow down data.

The system provides multiple filtering options.

---

## Filter by Document Type

Users can filter operations based on document categories:

* Receipts
* Delivery
* Internal transfers
* Adjustments

Example:

```
Show only Delivery Orders
```

---

## Filter by Status

Each operation has a status.

Statuses include:

Draft
The operation is created but not finalized.

Waiting
The operation is awaiting processing.

Ready
The operation is prepared and can be validated.

Done
The operation has been completed.

Canceled
The operation was cancelled.

These statuses help track **workflow progress**.

---

## Filter by Warehouse or Location

Businesses may have multiple storage locations.

Examples:

* Main warehouse
* Production floor
* Rack A
* Rack B

Users can filter data for a **specific location**.

---

## Filter by Product Category

Products may be grouped into categories such as:

* Raw materials
* Finished goods
* Spare parts
* Electronics

Filtering helps analyze inventory by category.

---

# 7. Navigation Structure

The system contains several modules accessible via navigation menus.

---

# 8. Products Module

This module manages all product-related data.

Users can:

* Create new products
* Update existing products
* View stock levels
* Organize products by category
* Define reordering rules

---

### Product Information Fields

Each product includes:

Name
Example:

```
Steel Rod
```

SKU (Stock Keeping Unit)

```
STL-001
```

Category

```
Raw Materials
```

Unit of Measure

Examples:

* Pieces
* Kilograms
* Liters
* Boxes

Initial Stock (optional)

Example:

```
Initial Stock: 100 units
```

---

### Stock Availability Per Location

A product can exist in **multiple warehouses or racks**.

Example:

```
Steel Rod
Warehouse A: 50
Warehouse B: 20
Production Rack: 30
```

Total stock = 100.

---

### Reordering Rules

Businesses can define **minimum stock levels**.

Example:

```
Minimum stock: 20
Reorder quantity: 100
```

If stock falls below 20, the system triggers a **reorder alert**.

---

# 9. Operations Module

Operations manage **stock movements**.

This module includes:

1. Receipts
2. Delivery Orders
3. Inventory Adjustments
4. Move History

---

# 10. Receipts (Incoming Goods)

Receipts represent **incoming inventory from suppliers**.

This increases stock levels.

---

### Receipt Workflow

Step 1
Create a new receipt.

Step 2
Add supplier details.

Step 3
Add products to the receipt.

Step 4
Enter received quantities.

Step 5
Validate the receipt.

Once validated:

Stock automatically increases.

---

### Example

Vendor delivers steel rods.

```
Product: Steel Rod
Received: 50 units
```

Stock update:

```
Previous Stock: 100
New Stock: 150
```

This operation is recorded in the **inventory ledger**. 

---

# 11. Delivery Orders (Outgoing Goods)

Delivery orders represent **goods leaving the warehouse for customers**.

This decreases inventory.

---

### Delivery Workflow

1. Pick items from storage
2. Pack items
3. Validate shipment

Once validated:

Stock decreases automatically.

---

### Example

Customer orders chairs.

```
Order: 10 Chairs
```

Stock update:

```
Previous Stock: 50
New Stock: 40
```

---

# 12. Internal Transfers

Internal transfers move stock **within the organization**.

These movements **do not change total stock quantity**.

They only change **location**.

---

### Examples

Warehouse → Production floor

Rack A → Rack B

Warehouse 1 → Warehouse 2

---

### Example

Steel rods:

```
Warehouse A: 100
Production Rack: 0
```

Transfer 20 rods:

```
Warehouse A: 80
Production Rack: 20
```

Total remains **100**.

---

### Movement Logging

Every transfer is recorded in a **movement ledger**.

This ensures traceability.

---

# 13. Stock Adjustments

Stock adjustments fix mismatches between:

1. System stock
2. Actual physical stock

---

### Why mismatches happen

Common reasons:

* Damaged goods
* Counting errors
* Theft
* Lost items
* Incorrect data entry

---

### Adjustment Process

1. Select product
2. Select warehouse/location
3. Enter actual quantity

The system calculates the difference.

Example:

```
System stock: 100
Physical stock: 97
```

Adjustment recorded:

```
-3 units
```

Stock becomes **97**.

The adjustment is logged permanently.

---

# 14. Move History

Move history stores **all inventory movements**.

This acts like a **stock ledger**.

It records:

* Receipts
* Deliveries
* Transfers
* Adjustments

This provides full **inventory traceability**.

---

# 15. Settings – Warehouse Management

The system allows configuration of warehouses.

Example warehouses:

* Main Warehouse
* Secondary Warehouse
* Production Floor

Each warehouse may contain **multiple locations**.

Example:

```
Warehouse A
   Rack A
   Rack B
   Rack C
```

---

# 16. Profile Menu

Users can manage their accounts.

Options include:

My Profile
Allows editing:

* Name
* Email
* Password

Logout
Ends the session securely.

---

# 17. Additional Features

The system includes several helpful tools.

---

### Low Stock Alerts

The system warns when inventory is below minimum levels.

Example:

```
Alert: Steel Rod stock below minimum level
```

---

### Multi-Warehouse Support

Companies may operate multiple warehouses.

Example:

```
Warehouse Mumbai
Warehouse Delhi
Warehouse Ahmedabad
```

The system tracks stock separately.

---

### SKU Search

Users can quickly search products using **SKU codes**.

Example search:

```
STL-002
```

---

### Smart Filters

Users can filter data by:

* Product
* Category
* Location
* Status
* Document type

This improves efficiency.

---

# 18. Simplified Inventory Flow Example

The document gives a real-world example.

---

### Step 1 – Receive Goods

Vendor delivers steel.

```
Receive: 100 kg steel
```

Stock update:

```
Stock = +100
```

---

### Step 2 – Internal Transfer

Move steel to production.

```
Main Store → Production Rack
```

Total stock remains:

```
100 kg
```

Only location changes.

---

### Step 3 – Deliver Finished Goods

Deliver steel frames.

```
Delivered: 20 kg steel
```

Stock update:

```
100 - 20 = 80
```

---

### Step 4 – Adjust Damaged Items

3 kg steel damaged.

```
Adjustment = -3
```

Final stock:

```
80 - 3 = 77
```

Every action is recorded in the **Stock Ledger**. 

---

# Final Concept

The entire system revolves around **tracking inventory movements**.

There are four core operations:

```
INCOMING STOCK (Receipts)

INTERNAL MOVEMENT (Transfers)

OUTGOING STOCK (Deliveries)

CORRECTIONS (Adjustments)
```

Together they create a **complete inventory tracking system**.



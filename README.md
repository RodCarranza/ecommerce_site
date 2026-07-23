
# Project Description

**TechVault: Advanced Hardware Catalog Workspace**

**TechVault** is an e-commerce web application engineered as a high-performance hardware catalog and user interaction system. Built on the **Model-View-Controller (MVC)** architecture, TechVault leverages **Node.js**, **Express**, **PostgreSQL**, and **EJS** templates to deliver a modern, secure, and fully reactive storefront experience—without relying on heavy client-side frameworks or disruptive popups.

---

## 🗄️ Database Schema

![TechVault ERD](https://github.com/user-attachments/assets/f7f82b1e-1f5c-4ee1-9327-ed6646809289)

---

## 👥 User Roles & Permissions

### 👤 Guest User
* **Browse Catalog:** View all products, including availability, real-time stock, pricing, detailed specifications, and customer reviews.
* **Account Creation:** Register a new customer account directly from the storefront.

### 🛒 Customer
*Includes all Guest permissions, plus:*
* **Cart & Checkout:** Add/remove items from the shopping cart and place orders.
* **Order Tracking:** Access and view personal order history.
* **Review Management:** Write, edit, and delete personal product reviews.

### 🛠️ Employee
*Focuses strictly on store operations and fulfillment (restricted from placing orders or managing a cart):*
* **Order Management:** View all customer orders and update status (*Placed*, *Processing*, *Shipped*, *Completed*).
* **Content Moderation:** Moderate customer reviews and delete inappropriate or disrespectful feedback.

### 👑 Admin / Owner
*Includes all Employee permissions, plus:*
* **Catalog Management:** Add, edit, or remove products (modify titles, prices, stock quantities, and descriptions).
* **User Administration:** View all registered accounts, manage user roles, delete accounts, and register new employees.

---

## 🔑 Test Account Credentials

| Role | Email |
| :--- | :--- |
| **Guest** | *No credentials required* |
| **Customer** | `user2@email.com` |
| **Employee** | `employee@email.com` |
| **Admin / Owner** | `admin@email.com` |

---

## ⚠️ Known Limitations

* **Review Timestamps:** The `reviews` table does not currently include an `updated_at` column, meaning edited reviews do not display an "edited" timestamp.
* **Inline / Embedded Styling:** Styles are applied directly within the EJS templates using embedded CSS and inline styles rather than a single external stylesheet.

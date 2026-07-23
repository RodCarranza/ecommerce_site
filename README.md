**Project Description**
TechVault: Advanced Hardware Catalog Workspace
TechVault is an e-commerce web application designed as a high-performance hardware catalog and user interaction system. Built using **Model-View-Controller (MVC)** architecture, this application utilizes **Node.js**, **Express**, **PostgreSQL**, and **EJS** templates to provide a modern, secure, and fully reactive storefront experience without relying on heavy client-side frameworks or disruptive popup components.

**Database Schema**
<img width="1372" height="863" alt="ecommerce ERD" src="https://github.com/user-attachments/assets/f7f82b1e-1f5c-4ee1-9327-ed6646809289" />

**User Roles**
•	**Guest User**: Guests can browse all products on the e-commerce website, including their availability, stock, price, details, and customer reviews. They can also create an account if they choose to.
•	**Customer**: Customers have all the permissions of guest users. In addition, they can add items to their shopping cart, place orders, view their order history, and leave product reviews. They can also edit or delete the reviews they have submitted.
•	**Employee**: Employees can view all customer orders and update their status (Placed, Processing, Shipped, or Completed). They can also moderate customer reviews by removing any that are inappropriate or disrespectful. However, employees cannot add items to a shopping cart, place orders, or view an order history, as the employee role is intended only for managing the store.
•	**Admin/Owner**: Admins have all the permissions of employees. In addition, they can add, edit, or remove products from the catalog, including updating product titles, prices, quantities, and descriptions. They can also view all registered users and their roles, delete user accounts when necessary, and register new employees in the system.

**Test Account Credentials**
| Role | Email / Access |
| :--- | :--- |
| **Guest** | *No credentials needed* |
| **Customer** | `user2@email.com` |
| **Employee** | `employee@email.com` |
| **Admin / Owner** | `admin@email.com` |

**Known Limitations**
This web application does not use a single CSS stylesheet for styling. Instead, styles are applied directly within the EJS pages using embedded CSS and inline styles. 
Additionally, the Reviews table does not include a column to track when a review has been updated.

RadaPOS Enterprise
RadaPOS Enterprise is a robust, multi-tenant Point of Sale and Inventory Management System designed to streamline retail operations for businesses ranging from fixed retail stores to high-volume event pop-ups. It provides a unified platform for Administrators, Vendors, and Cashiers to manage sales, inventory, and financial analytics in real-time.

System Overview
The platform is engineered to support complex transactional workflows including split payments, mobile money integrations (M-Pesa), and automated stock validation. It features strict data isolation protocols ensuring secure multi-tenancy, allowing multiple vendors to operate independently within a single system instance.

Key Features
1. Core Point of Sale & Transaction Processing
The central hub of the application, designed for speed and transactional integrity.

High-Performance Interface: A responsive, optimized cart system enabling cashiers to process high-volume transactions with minimal latency.

Smart Stock Validation: Real-time inventory checks prevent "stock-outs" by restricting sales of items exceeding available quantity.

Flexible Payment Methods:

Cash Payments: Instant recording of physical cash transactions with offline capability support.

M-Pesa Integration (STK Push): Automated mobile payment processing with real-time callback handling for immediate verification.

Split Payments: Advanced logic allowing a single transaction to be settled using a combination of Cash and M-Pesa.

Digital Receipt Generation: Automatic generation of PDF receipts for every completed transaction, ensuring auditability and professional customer records.

2. Advanced Inventory & Product Management
Comprehensive tools for vendors to maintain accurate stock records.

Product Lifecycle Management (CRUD): Full capability to add, edit, categorize, and delete products.

Bulk Data Import: Support for Excel/CSV file uploads, enabling vendors to import and update hundreds of inventory items simultaneously.

Low Stock Logic: Backend monitoring algorithms that track stock levels and trigger alerts when inventory falls below defined thresholds.

Promotional Logic: Capability to create and apply percentage-based discount codes at checkout to drive sales campaigns.

3. Multi-Tenancy & User Management
A secure, role-based architecture supporting distinct operational hierarchies.

Role-Based Access Control (RBAC): Distinct interfaces and permission sets for three primary user roles:

Admins: Complete system oversight and platform management.

Vendors: Business owners managing their specific inventory, staff, and finances.

Cashiers: Front-line employees restricted to POS and sales operations.

Strict Data Isolation: Architectural logic ensuring that Vendors and Cashiers can only access data relevant to their specific business entities.

Staff Administration: Vendors possess full autonomy to hire or terminate cashiers. Login credentials are automatically generated and securely distributed via email.

Vendor Payout Simulation: A digital ledger system allowing Vendors to manage wallet balances and simulate payments to suppliers or staff.

4. Analytics & Financial Reporting
Data-driven insights to monitor business health and performance.

Interactive Dashboards: Visual representations of sales trends, revenue performance, and transaction volume.

Performance Metrics: Automatic identification of top-selling products to inform restocking decisions.

Comprehensive Reporting: Generation of downloadable PDF reports containing detailed sales history for auditing purposes.

Net Profit Calculation: Real-time computation of financial standing by analyzing Income versus Expenses (Payouts).

5. Security & System Intelligence
Features designed to maintain system integrity and user awareness.

Audit Trail: A comprehensive security log tracking critical system actions, such as product deletion or staff changes, providing accountability for all sensitive operations.

System Notifications: A real-time alert system notifying users of critical events, including low stock warnings and system-wide announcements.

6. Branding & User Experience
A polished interface designed for modern retail environments.

Receipt Customization: Vendors can personalize digital receipts with specific business details and custom footers to enhance brand identity.

Modern UI/UX: A refined user interface featuring a video-based landing page and dynamic theme toggling (Dark/Light mode) to suit various lighting environments.

Technical Architecture
Frontend: React.js, Vite, Tailwind CSS

Backend: Python, Flask

Database: PostgreSQL / SQLAlchemy ORM

Authentication: JWT (JSON Web Tokens)

External Integrations: Safaricom Daraja API (M-Pesa), SendGrid (Email Services)

Installation and Setup
1. Clone the Repository

        git clone https://github.com/Davemuriu/RadaPOS.git  
        cd RadaPOS

2. Backend Setup

        cd server
        python -m venv venv
        source venv/bin/activate  # or venv\Scripts\activate on Windows
        pip install -r requirements.txt

    Environment Configuration:
    Create a .env file in the /server directory and configure your database URI, JWT secret key, and API keys for M-Pesa and SendGrid.

Database Initialization

    flask db upgrade

3. Frontend Setup

        cd ../client
        npm install
        npm run dev

                                                        Choose RadaPOS! 
                                                        The Pulse of Your Payments.
                                                        Anywhere, Anytime.
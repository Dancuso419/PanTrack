## **Technical Requirements Document (TRD)**

### **PanTrack**

**Version:** 1.1  
 **Document Owner:** Engineering Team  
 **Project Type:** Web Application  
 **Platform:** Web (MVP)  
 **Architecture:** Three-Tier Architecture

---

## **1\. Introduction**

### **1.1 Purpose**

This Technical Requirements Document (TRD) defines the technical specifications required for the design, development, testing, deployment, and maintenance of PanTrack.

It serves as the technical blueprint for developers, UI/UX designers, DevOps engineers, QA engineers, and future contributors.

### **1.2 Project Overview**

PanTrack is a web-based personal finance management application that enables users to:

* Record income  
* Record expenses  
* Create budgets  
* Categorize transactions  
* Analyze spending  
* View financial reports  
* Visualize financial data through dashboards

---

## **2\. System Architecture**

PanTrack follows a Three-Tier Architecture consisting of:

### **Presentation Layer (Frontend)**

Responsible for: User Interface, User Interaction, Dashboard, Forms, Charts

### **Application Layer (Backend)**

Responsible for: Business Logic, Authentication, Data Processing, API Services, Validation

### **Data Layer (Database)**

Responsible for: User Information, Financial Transactions, Categories, Budgets, Reports

### **Architecture Diagram**

       User

          │

          ▼

   React Frontend

          │

    REST API (HTTPS)

          │

   Express Backend

          │

       Prisma ORM

          │

     PostgreSQL DB

---

## **3\. Technology Stack**

### **Frontend**

| Technology | Purpose |
| ----- | ----- |
| React.js | User Interface |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| React Router | Navigation |
| React Query | Server State |
| Axios | API Communication |
| React Hook Form | Form Management |
| Zod | Validation |
| Recharts | Analytics Charts |

### **Backend**

| Technology | Purpose |
| ----- | ----- |
| Node.js | Runtime |
| Express.js | API Framework |
| TypeScript | Development |
| Prisma ORM | Database Access |
| JWT | Authentication |
| bcrypt | Password Hashing |

### **Database**

| Technology | Purpose |
| ----- | ----- |
| PostgreSQL | Relational Database |

### **Deployment**

| Service | Purpose |
| ----- | ----- |
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| Neon PostgreSQL | Database Hosting |
| GitHub | Version Control |

---

## **4\. Functional Modules**

### **4.1 Authentication Module**

Handles user authentication and authorization.

Features: Register, Login, Logout, Password Encryption, JWT Authentication, Session Validation

### **4.2 Dashboard Module**

Display: Total Income, Total Expenses, Remaining Balance, Savings, Budget Progress, Recent Transactions, Monthly Summary

### **4.3 Income Module**

Users can: Add Income, Edit Income, Delete Income, View Income History, Filter Income

### **4.4 Expense Module**

Users can: Add Expenses, Edit Expenses, Delete Expenses, View Expense History, Filter Expenses

### **4.5 Budget Module**

Users can: Create Budget, Edit Budget, Delete Budget, Track Budget Progress

### **4.6 Categories Module**

Supports: Default Categories, Custom Categories, Category Icons, Category Colors

### **4.7 Reports Module**

Generate: Daily Reports, Weekly Reports, Monthly Reports, Annual Reports

### **4.8 Analytics Module**

Generate: Pie Charts, Bar Charts, Line Charts, Spending Analysis, Income Analysis, Budget Analysis

---

## **5\. Database Design**

### **User Table**

| Field | Type | Notes |
| ----- | ----- | ----- |
| id | UUID | Primary Key |
| fullName | String | Required |
| email | String | Required, Unique |
| password | String | Hashed with bcrypt |
| currency | String | Default: NGN |
| createdAt | DateTime | Auto-generated |
| updatedAt | DateTime | Auto-updated |

### **Income Table**

| Field | Type | Notes |
| ----- | ----- | ----- |
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → User.id (cascade delete) |
| amount | Decimal | Must be \> 0 |
| categoryId | UUID | Foreign Key → Category.id |
| description | String | Optional |
| date | Date | Required |
| createdAt | DateTime | Auto-generated |

### **Expense Table**

| Field | Type | Notes |
| ----- | ----- | ----- |
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → User.id (cascade delete) |
| amount | Decimal | Must be \> 0 |
| categoryId | UUID | Foreign Key → Category.id |
| description | String | Optional |
| date | Date | Required |
| createdAt | DateTime | Auto-generated |

### **Category Table**

| Field | Type | Notes |
| ----- | ----- | ----- |
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → User.id (cascade delete) |
| name | String | Required |
| icon | String | Required |
| color | String | Required |
| isDefault | Boolean | True for system categories |

### **Budget Table**

| Field | Type | Notes |
| ----- | ----- | ----- |
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → User.id (cascade delete) |
| categoryId | UUID | Foreign Key → Category.id |
| amount | Decimal | Must be \> 0 |
| month | Integer | 1–12 |
| year | Integer | e.g. 2025 |

---

## **6\. Database Relationships**

User

├── Income (one-to-many, cascade delete)

├── Expense (one-to-many, cascade delete)

├── Budget (one-to-many, cascade delete)

└── Category (one-to-many, cascade delete)

Category

├── Income (one-to-many)

├── Expense (one-to-many)

└── Budget (one-to-many)

Each user owns multiple income records, expense records, budgets, and categories. Categories are also linked to income, expense, and budget records via foreign keys to ensure referential integrity.

---

## **7\. REST API Specification**

### **Authentication**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and receive JWT |
| POST | /api/auth/logout | Invalidate session |
| GET | /api/auth/me | Get current user profile |

#### **Example – Register Request**

json

POST /api/auth/register

Content-Type: application/json

{

  "fullName": "Sarah Eze",

  "email": "sarah@example.com",

  "password": "securepass123"

}

#### **Example – Register Success Response**

json

HTTP 201 Created

{

  "success": true,

  "message": "Account created successfully.",

  "data": {

    "id": "uuid-here",

    "fullName": "Sarah Eze",

    "email": "sarah@example.com"

  }

}

#### **Example – Login Request**

json

POST /api/auth/login

Content-Type: application/json

{

  "email": "sarah@example.com",

  "password": "securepass123"

}

#### **Example – Login Success Response**

json

HTTP 200 OK

{

  "success": true,

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  "data": {

    "id": "uuid-here",

    "fullName": "Sarah Eze",

    "email": "sarah@example.com"

  }

}

---

### **Income**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| GET | /api/income | Get all income records for user |
| POST | /api/income | Add a new income record |
| PATCH | /api/income/:id | Update an income record |
| DELETE | /api/income/:id | Delete an income record |

#### **Example – Add Income Request**

json

POST /api/income

Authorization: Bearer \<token\>

Content-Type: application/json

{

  "amount": 150000,

  "categoryId": "uuid-category",

  "description": "Monthly salary",

  "date": "2025-07-01"

}

#### **Example – Add Income Success Response**

json

HTTP 201 Created

{

  "success": true,

  "message": "Income added successfully.",

  "data": {

    "id": "uuid-here",

    "userId": "uuid-user",

    "amount": 150000,

    "categoryId": "uuid-category",

    "description": "Monthly salary",

    "date": "2025-07-01",

    "createdAt": "2025-07-01T10:00:00Z"

  }

}

---

### **Expenses**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| GET | /api/expenses | Get all expenses for user |
| POST | /api/expenses | Add a new expense |
| PATCH | /api/expenses/:id | Update an expense |
| DELETE | /api/expenses/:id | Delete an expense |

#### **Example – Add Expense Request**

json

POST /api/expenses

Authorization: Bearer \<token\>

Content-Type: application/json

{

  "amount": 5000,

  "categoryId": "uuid-category",

  "description": "Groceries",

  "date": "2025-07-03"

}

#### **Example – Add Expense Success Response**

json

HTTP 201 Created

{

  "success": true,

  "message": "Expense added successfully.",

  "data": {

    "id": "uuid-here",

    "userId": "uuid-user",

    "amount": 5000,

    "categoryId": "uuid-category",

    "description": "Groceries",

    "date": "2025-07-03",

    "createdAt": "2025-07-03T08:30:00Z"

  }

}

---

### **Categories**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| GET | /api/categories | Get all categories for user |
| POST | /api/categories | Create a custom category |
| DELETE | /api/categories/:id | Delete a category |

---

### **Budget**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| GET | /api/budget | Get all budgets for user |
| POST | /api/budget | Create a new budget |
| PATCH | /api/budget/:id | Update a budget |

---

### **Dashboard**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| GET | /api/dashboard | Get full dashboard summary |

#### **Example – Dashboard Response**

json

HTTP 200 OK

{

  "success": true,

  "data": {

    "totalIncome": 150000,

    "totalExpenses": 62000,

    "remainingBalance": 88000,

    "savings": 88000,

    "budgetStatus": \[

      {

        "category": "Food",

        "limit": 20000,

        "spent": 14000,

        "percentageUsed": 70

      }

    \],

    "recentTransactions": \[

      {

        "id": "uuid",

        "type": "expense",

        "amount": 5000,

        "category": "Food",

        "date": "2025-07-03"

      }

    \]

  }

}

---

### **Analytics**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| GET | /api/analytics | Get chart data for the current user |

---

### **Standard Error Response**

All endpoints return errors in this format:

json

{

  "success": false,

  "message": "A description of what went wrong."

}

| HTTP Status | Meaning |
| ----- | ----- |
| 400 | Bad Request – validation error |
| 401 | Unauthorized – missing or invalid token |
| 403 | Forbidden – action not allowed |
| 404 | Not Found – resource does not exist |
| 500 | Internal Server Error |

---

## **8\. Authentication Flow**

User Login

     │

     ▼

Validate Credentials

     │

     ▼

Hash Verification (bcrypt)

     │

     ▼

Generate JWT

     │

     ▼

Return Access Token

     │

     ▼

Frontend Stores Token (memory / httpOnly cookie)

     │

     ▼

User Accesses Protected Routes

     │

     ▼

Backend Verifies Token on every request

---

## **9\. Validation Rules**

### **Registration**

* Full Name: Required  
* Email: Valid format, must be unique  
* Password: Minimum 8 characters

### **Income**

* Amount: Required, must be \> 0  
* Category: Required  
* Date: Required

### **Expense**

* Amount: Required, must be \> 0  
* Category: Required  
* Date: Required

### **Budget**

* Amount: Must be \> 0  
* Category: Required  
* Month: Required (1–12)  
* Year: Required

---

## **10\. Security Requirements**

The system shall implement:

* JWT Authentication  
* Password Hashing (bcrypt)  
* HTTPS Encryption  
* CORS Protection  
* Helmet Middleware  
* Rate Limiting  
* Input Validation  
* SQL Injection Protection (via Prisma ORM)  
* Environment Variables for all secrets  
* Authentication Middleware on all protected routes

---

## **11\. Environment Variables**

The following environment variables must be defined in a .env file and never committed to version control:

DATABASE\_URL=postgresql://user:password@host:5432/pantrack

JWT\_SECRET=your\_jwt\_secret\_key

JWT\_EXPIRES\_IN=7d

PORT=5000

NODE\_ENV=development

CORS\_ORIGIN=http://localhost:3000

On Render (backend) and Vercel (frontend), these must be configured in the platform's environment settings dashboard.

---

## **12\. Performance Requirements**

| Requirement | Target |
| ----- | ----- |
| Dashboard Load Time | \< 2 seconds |
| API Response Time | \< 500 ms |
| Login Response | \< 1 second |
| Analytics Generation | \< 3 seconds |
| Search Results | \< 1 second |

---

## **13\. Error Handling**

The application shall:

* Display user-friendly error messages.  
* Log server errors.  
* Validate all user input.  
* Return standardized API responses (see Section 7).  
* Prevent application crashes.

---

## **14\. Folder Structure**

PanTrack/

client/

├── components/

├── pages/

├── layouts/

├── hooks/

├── services/

├── context/

├── utils/

├── assets/

└── App.tsx

server/

├── controllers/

├── routes/

├── middleware/

├── services/

├── prisma/

├── config/

├── utils/

├── types/

└── server.ts

---

## **15\. Testing Strategy**

### **Unit Testing**

Test: Utility Functions, Validation Logic, Authentication Logic

### **Integration Testing**

Test: APIs, Database Queries, Authentication

### **End-to-End Testing**

Test:

* User Registration  
* Login  
* Dashboard  
* Add Income  
* Add Expense  
* Create Budget  
* Generate Reports

---

## **16\. Deployment Strategy**

### **Frontend**

Deploy using Vercel.

Steps:

1. Push code to GitHub  
2. Connect repository to Vercel  
3. Set environment variables in Vercel dashboard  
4. Deploy via Vercel CI/CD on every push to main branch

### **Backend**

Deploy using Render.

Steps:

1. Connect GitHub repository to Render  
2. Set environment variables in Render dashboard  
3. Set start command: node dist/server.js  
4. Enable automatic deploys on push to main branch

### **Database**

Host on Neon PostgreSQL.

Steps:

1. Create a Neon project and database  
2. Copy the connection string into DATABASE\_URL  
3. Run npx prisma migrate deploy on first deployment

### **Version Control**

Source code managed with GitHub using feature branches, pull requests, and code reviews.

---

## **17\. Monitoring & Logging**

The system should include:

* API Request Logging  
* Server Error Logging  
* Database Monitoring  
* Application Health Checks  
* Performance Monitoring  
* Uptime Monitoring

---

## **18\. Future Technical Enhancements**

* Mobile Application (React Native)  
* AI-Powered Financial Insights  
* Open Banking Integration  
* Receipt OCR Scanning  
* Push Notifications  
* Savings Goals  
* Recurring Transactions  
* Multi-Currency Support  
* Dark Mode  
* Offline Mode with Data Synchronization  
* PDF and Excel Report Export  
* Two-Factor Authentication (2FA)

---

## **19\. Technical Risks & Mitigation**

| Risk | Mitigation |
| ----- | ----- |
| Data Loss | Automated backups and database recovery procedures |
| Unauthorized Access | JWT, bcrypt, HTTPS, and role-based authorization |
| Slow Performance | Database indexing on userId fields, caching, and pagination |
| High Traffic | Scalable cloud infrastructure and load balancing |
| Future Feature Expansion | Modular architecture and well-defined REST APIs |

---

## **20\. Conclusion**

The PanTrack technical architecture is designed to be secure, scalable, and maintainable. By leveraging modern technologies such as React, Node.js, Express, PostgreSQL, Prisma, and JWT, the platform provides a solid foundation for reliable personal finance management. The modular design allows for future enhancements — including AI-powered insights, bank integrations, and mobile applications — without requiring major architectural changes. This document serves as the primary technical reference for implementing, testing, deploying, and maintaining the PanTrack platform.


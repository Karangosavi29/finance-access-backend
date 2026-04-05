# Finance Data Processing and Access Control Backend

A backend system for a finance dashboard that supports financial record management, role-based access control, and summary-level analytics.

Built with **Node.js**, **Express**, and **MongoDB**.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (Access Token + Refresh Token)
- **Validation**: Manual validation with descriptive error responses
- **Password Hashing**: bcrypt

---

## Project Structure

```
src/
├── configs/
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── transaction.controller.js
│   └── dashboard.controller.js
├── db/
│   └── db.js
├── middleware/
│   └── auth.middleware.js
├── models/
│   ├── user.Model.js
│   └── transaction.Model.js
├── routes/
│   ├── auth.route.js
│   ├── user.route.js
│   ├── transaction.route.js
│   └── dashboard.route.js
├── utils/
│   ├── asyncHandler.js
│   ├── Apierror.js
│   └── Apiresponse.js
├── app.js
└── index.js
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Karangosavi29/finance-access-backend.git
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file in the root of the project

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=10d
NODE_ENV=development
```

### 4. Start the development server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

---

## Roles and Permissions

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| Register / Login | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View monthly trends | ❌ | ✅ | ✅ |
| Create transaction | ❌ | ✅ | ✅ |
| Update transaction | ❌ | ✅ | ✅ |
| Delete transaction | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Reference

### Auth Routes — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive tokens |
| POST | `/logout` | All logged in | Logout and clear tokens |
| POST | `/refresh-token` | All logged in | Rotate refresh token |

#### Register — Request Body
```json
{
    "name": "Karan",
    "email": "karan@example.com",
    "password": "yourpassword",
    "role": "admin"
}
```

#### Login — Request Body
```json
{
    "email": "karan@example.com",
    "password": "yourpassword"
}
```

---

### User Routes — `/api/v1/users`

All routes require `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | Get all users |
| GET | `/:id` | Admin | Get user by ID |
| PATCH | `/:id/role` | Admin | Update user role |
| PATCH | `/:id/status` | Admin | Update user status |
| DELETE | `/:id` | Admin | Delete user |

#### Update Role — Request Body
```json
{
    "role": "analyst"
}
```

#### Update Status — Request Body
```json
{
    "status": "inactive"
}
```

---

### Transaction Routes — `/api/v1/transactions`

All routes require `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Admin, Analyst | Create a transaction |
| GET | `/` | All logged in | Get all transactions (with filters + pagination) |
| GET | `/:id` | All logged in | Get transaction by ID |
| PATCH | `/:id` | Admin, Analyst | Update a transaction |
| DELETE | `/:id` | Admin | Delete a transaction |

#### Create Transaction — Request Body
```json
{
    "amount": 5000,
    "type": "income",
    "category": "salary",
    "date": "2026-04-01",
    "notes": "April salary"
}
```

#### Filter + Pagination — Query Params
```
GET /api/v1/transactions?type=income&category=salary&startDate=2026-01-01&endDate=2026-04-30&page=1&limit=10
```

| Param | Type | Description |
|---|---|---|
| `type` | string | Filter by `income` or `expense` |
| `category` | string | Filter by category name |
| `startDate` | date | Filter from this date |
| `endDate` | date | Filter until this date |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

---

### Dashboard Routes — `/api/v1/dashboard`

All routes require `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/summary` | All logged in | Total income, expenses, net balance |
| GET | `/categories` | All logged in | Category wise totals |
| GET | `/recent` | All logged in | Last 5 transactions |
| GET | `/trends` | Admin, Analyst | Monthly income vs expense trends |

#### Summary Response Example
```json
{
    "totalIncome": 50000,
    "totalExpenses": 20000,
    "netBalance": 30000
}
```

---

## Assumptions and Tradeoffs

1. **Role assignment on register** — Users can self-assign a role during registration. In a production system this would be restricted so only admins can assign elevated roles.

2. **Refresh token rotation** — Each login generates a new refresh token stored in an array on the user document. On logout, only the current session's token is removed, allowing multiple device sessions.

3. **Soft delete not implemented** — Transactions and users are hard deleted. This was a conscious tradeoff to keep the implementation clean and focused.

4. **No rate limiting** — Rate limiting was not implemented as this is an assessment project running locally.

5. **Category as free text** — Transaction categories are stored as lowercase strings rather than a fixed enum, giving flexibility to create any category without schema changes.

6. **Pagination on transactions only** — Pagination was added to the transactions list endpoint as it is the only endpoint likely to return large datasets.

---

## Error Response Format

All errors follow this consistent format:

```json
{
    "success": false,
    "statusCode": 400,
    "message": "All fields are required",
    "errors": []
}
```

## Success Response Format

```json
{
    "statuscode": 200,
    "message": "Success message",
    "data": {},
    "success": true
}
```

# 💧 Water Connect API

A water supply booking system backend built with Next.js, Prisma, and MySQL.

## 🚀 Setup

### Install Dependencies
npm install

### Setup Environment
Create .env file:
DATABASE_URL="mysql://root:password@localhost:3306/waterconndb"
JWT_SECRET="your-secret-key"

### Run Database Migration
npx prisma migrate dev

### Start Server
npm run dev

---

## 📌 API Endpoints

### 🔐 Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register/consumer | Register consumer |
| POST | /api/auth/register/supplier | Register supplier |
| POST | /api/auth/login | Login |

### 👤 Profile
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/profile/[id] | Get profile |
| PUT | /api/profile/[id] | Update profile |

### 📅 Booking
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/booking | Create booking |
| PUT | /api/booking/[id]/accept | Accept booking |
| PUT | /api/booking/[id]/reject | Reject booking |
| PUT | /api/booking/[id]/complete | Complete booking |
| GET | /api/booking/lookup/consumer/[id] | Consumer bookings |
| GET | /api/booking/lookup/supplier/[id] | Supplier bookings |

### 💳 Payment
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/payment | Create payment |
| GET | /api/payment/[id] | Get payment |
| PUT | /api/payment/[id] | Update status |

### ⭐ Rating
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/rating | Submit rating |
| GET | /api/rating/supplier/[id] | Get ratings |

### 🔧 Supplier Type
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/suppliertype | Add vehicle info |
| GET | /api/suppliertype/[id] | Get vehicle info |
| PUT | /api/suppliertype/[id] | Update vehicle info |

### 👑 Admin
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/admin/users | Get all users |
| DELETE | /api/admin/users/[id] | Delete user |

---

## 🛠️ Tech Stack
- Next.js 16 (App Router)
- Prisma ORM
- MySQL
- TypeScript
- bcryptjs (Password Hashing)
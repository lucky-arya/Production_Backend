# Production Backend

A production-ready Node.js backend API built with Express.js, MongoDB, and modern best practices. This project demonstrates a professional backend architecture with user authentication, file uploads, cloud storage integration, and Razorpay payment integration.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-v5-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v6+-green.svg)
![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-blue.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Payment Integration](#-payment-integration)
- [File Upload](#-file-upload)
- [Error Handling](#-error-handling)
- [Author](#-author)

## ✨ Features

- **Payment Integration** - Razorpay payment gateway with order creation & verification
- **User Authentication** - Complete auth flow with JWT (Access & Refresh Tokens)
- **Secure Password Hashing** - Using bcrypt for password encryption
- **File Uploads** - Multer middleware for handling multipart/form-data
- **Cloud Storage** - Cloudinary integration for image/video storage
- **MongoDB Database** - Mongoose ODM with data validation
- **RESTful API** - Well-structured REST endpoints
- **Cookie-based Auth** - HTTP-only secure cookies
- **CORS Enabled** - Cross-Origin Resource Sharing configured
- **Production Ready** - Follows industry-standard best practices

## 🛠 Tech Stack

| Technology | Description |
|------------|-------------|
| **Node.js** | JavaScript runtime environment |
| **Express.js v5** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB object modeling |
| **JWT** | JSON Web Tokens for authentication |
| **Bcrypt** | Password hashing library |
| **Cloudinary** | Cloud-based media management |
| **Multer** | Multipart form data handling |
| **Razorpay** | Payment gateway integration |
| **Cookie-Parser** | Cookie parsing middleware |
| **CORS** | Cross-origin resource sharing |
| **Dotenv** | Environment variable management |

## 📁 Project Structure

```├── payment.html       # Payment form interface
│   └── temp/              # Temporary file storage
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── home.controller.js
│   │   ├── payment.controller.js
│   │   └── user.controllers.js
│   ├── db/                # Database configuration
│   │   └── index.js
│   ├── middlewares/       # Custom middleware
│   │   ├── auth.middlewares.js
│   │   └── multer.middlewares.js
│   ├── models/            # Mongoose schemas
│   │   ├── subscriptions.models.js
│   │   ├── user.models.js
│   │   └── video.models.js
│   ├── routes/            # API routes
│   │   ├── home.routes.js
│   │   ├── payment.routes.js
│   │   └── user.routes.js
│   ├── utils/             # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── app.js             # Express app configuration
│   ├── constants.js       # Application constants
│   └── index.js           # Entry point
├── .env                   # Environment variables (create this)
├── .gitignore
├── package.json
├── PAYMENT_TESTING_GUIDE.md
├── PRODUCTION_PAYMENT_FLOW.md           # Entry point
├── .env                   # Environment variables (create this)
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd production-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables))

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **For production**
   ```bash
   npm start
   ```

The server will start at `http://localhost:<PORT>` (default: 5000)

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
CORS_ORIGIN=*

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/your_database_name

# JWT Configuration

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ACCESS_TOKEN_SECRET=your_access_token_secret_key
ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
REFRESH_TOKEN_EXPIRES_IN=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📡 API Endpoints


### Payment Routes (`/api/v1`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/create-order` | Create Razorpay order | ❌ |
| `POST` | `/payment/verify` | Verify payment signature | ❌ |
### Base URL
```
http://localhost:5000
```

### User Routes (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/register` | Register a new user | ❌ |
| `POST` | `/login` | Login user | ❌ |
| `POST` | `/logout` | Logout user | ✅ |

### Request/Response Examples

#### Register User
```http
POST /api/v1/users/register
Content-Type: multipart/form-data
```

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | ✅ | User's full name |
| `email` | string | ✅ | User's email address |
| `username` | string | ✅ | Unique username |
| `password` | string | ✅ | User password |
| `avatar` | file | ✅ | Profile avatar image |
| `coverImage` | file | ❌ | Cover image |

**Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "avatar": "cloudinary_url",
    "coverImage": "cloudinary_url",
    "watchHistory": [],
    "createdAt": "2026-02-04T00:00:00.000Z",
    "updatedAt": "2026-02-04T00:00:00.000Z"
  },
  "message": "User registered successfully",
  "success": true
}
```

#### Login User
```http
POST /api/v1/users/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "username": "johndoe",
  "password": "your_password"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "user": { ... },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "User logged in successfully",
  "success": true
}
```

#### Logout User
```http
POST /api/v1/users/logout
Authorization: Bearer <access_token>
```

## 🔑 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication with a dual-token strategy:

### Access Token
## 💳 Payment Integration

This API integrates **Razorpay** payment gateway for secure payment processing.

### Payment Flow

1. **Create Order** - Backend creates a Razorpay order
2. **Payment Processing** - Frontend opens Razorpay checkout modal
3. **Payment Verification** - Backend verifies payment signature using HMAC SHA256

### Create Order

```http
POST /api/v1/create-order
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 500,
  "currency": "INR",
  "receipt": "receipt_123"
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "id": "order_xxxxx",
    "amount": 50000,
    "currency": "INR",
    "receipt": "receipt_123",
    "status": "created"
  },
  "message": "Order created successfully",
  "success": true
}
```

### Verify Payment

```http
POST /api/v1/payment/verify
Content-Type: application/json
```

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_signature": "signature_hash"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "paymentId": "pay_xxxxx",
    "orderId": "order_xxxxx"
  },
  "message": "Payment verified successfully",
  "success": true
}
```

### Payment Page

Access the payment form at: **http://localhost:3000/payment.html**

### Testing Payments


### Subscription Model
```javascript
{
  subscriber: User,      // Reference to User (who is subscribing)
  channel: User,         // Reference to User (channel being subscribed to)
  createdAt: Date,
  updatedAt: Date
}
```
**Test Card Details:**
- **Card Number:** `4111 1111 1111 1111`
- **Expiry:** Any future date (e.g., `12/28`)
- **CVV:** Any 3 digits (e.g., `123`)

For detailed testing guide, see [PAYMENT_TESTING_GUIDE.md](PAYMENT_TESTING_GUIDE.md)
- Used for authenticating API requests
- Stored in HTTP-only cookies

### Refresh Token
- Long-lived token (configurable via `REFRESH_TOKEN_EXPIRES_IN`)
- Used to generate new access tokens
- Stored in database and HTTP-only cookies

### Protected Routes
To access protected routes, include the access token:

**Via Cookie (Automatic):**
Cookies are automatically sent with requests when credentials are included.

**Via Header:**
```http
Authorization: Bearer <your_access_token>
```

## 📤 File Upload

File uploads are handled using **Multer** middleware with **Cloudinary** cloud storage.

### Supported Files
- Images (avatar, cover image, thumbnail)
- Videos (for video content)

### Upload Flow
1. Files are temporarily stored in `./public/temp`
2. Uploaded to Cloudinary
3. Local temporary file is deleted
4. Cloudinary URL is stored in the database

### File Size Limits
- JSON body: 10MB
- URL-encoded: 10MB

## ⚠️ Error Handling

The API uses a standardized error response format:

### ApiError Class
```javascript
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "data": null,
  "error": []
}
```

### Common Error Codes
| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Authentication required |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `500` | Internal Server Error |

## 📊 Data Models

### User Model
```javascript
{
  username: String,      // Required, unique, lowercase, indexed
  email: String,         // Required, unique, lowercase
  fullName: String,      // Required, indexed
  avatar: String,        // Required, Cloudinary URL
  coverImage: String,    // Optional, Cloudinary URL
  watchHistory: [Video], // Array of Video references
  password: String,      // Required, hashed with bcrypt
  refreshToken: String,  // JWT refresh token
  createdAt: Date,
  updatedAt: Date
}
```

### Video Model
```javascript
{
  videoFile: String,     // Required, Cloudinary URL
  thumbnail: String,     // Required, Cloudinary URL
  title: String,         // Required
  description: String,   // Required
  duration: String,      // Required
  views: Number,         // Default: 0
  isPublished: Boolean,
  owner: User,           // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm test` | Run tests (not configured) |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the **ISC License**.

## 👤 Author

**Shivam Kumar**

---

<p align="center">
  Made with ❤️ for learning production-level backend development
</p>

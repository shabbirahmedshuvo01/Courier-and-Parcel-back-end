# Courier and Parcel Management System - Backend

A comprehensive backend API for managing courier and parcel delivery services built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization** (Customer, Courier, Admin roles)
- **Parcel Management** (Create, track, update parcels)
- **Delivery Management** (Assign couriers, track deliveries)
- **Real-time Tracking** (Track parcels by tracking number)
- **User Management** (Profile management, role-based access)
- **Courier Management** (Courier stats and performance tracking)

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Courier-and-Parcel-Back-end
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/courier_management
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

4. Start MongoDB service
Make sure MongoDB is running on your system.

5. Run the application
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Parcels
- `POST /api/parcels` - Create new parcel
- `GET /api/parcels` - Get all parcels (with pagination)
- `GET /api/parcels/:id` - Get parcel by ID
- `PUT /api/parcels/:id` - Update parcel (Admin/Courier)
- `DELETE /api/parcels/:id` - Delete parcel (Admin)
- `GET /api/parcels/track/:trackingNumber` - Track parcel (Public)
- `GET /api/parcels/my-parcels` - Get user's parcels

### Couriers (Admin only)
- `GET /api/couriers` - Get all couriers
- `GET /api/couriers/stats` - Get courier statistics

### Deliveries
- `GET /api/deliveries` - Get all deliveries (Admin)
- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries` - Create new delivery (Admin)
- `PUT /api/deliveries/:id` - Update delivery
- `GET /api/deliveries/my-deliveries` - Get courier's deliveries
- `PUT /api/deliveries/:id/status` - Update delivery status (Courier)

## User Roles

### Customer
- Create and track parcels
- View own parcel history
- Update profile

### Courier
- View assigned deliveries
- Update delivery status
- Track delivery route

### Admin
- Manage users and parcels
- Assign deliveries to couriers
- View system statistics
- Full CRUD operations

## Data Models

### User
- Basic info (name, email, phone, address)
- Role-based access (customer, courier, admin)
- Password hashing with bcrypt

### Parcel
- Tracking number (auto-generated)
- Sender and recipient details
- Parcel details (weight, dimensions, value)
- Shipping information (service type, cost, estimated delivery)
- Status tracking with history

### Delivery
- Links parcel to courier
- Delivery route tracking
- Proof of delivery
- Status updates

## Sample Requests

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "customer",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  }
}
```

### Create Parcel
```json
POST /api/parcels
Authorization: Bearer <token>
{
  "recipient": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+0987654321",
    "address": {
      "street": "456 Oak Ave",
      "city": "Another City",
      "state": "NY",
      "zipCode": "54321"
    }
  },
  "parcelDetails": {
    "weight": 2.5,
    "dimensions": {
      "length": 10,
      "width": 8,
      "height": 6
    },
    "description": "Electronics",
    "value": 299.99,
    "category": "electronics"
  },
  "shipping": {
    "service": "express"
  }
}
```

## Development

### Project Structure
```
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/            # Database models
├── routes/            # API routes
├── utils/             # Utility functions
├── .env               # Environment variables
├── server.js          # Main server file
└── package.json       # Dependencies
```

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- CORS protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
# Courier-and-Parcel-back-end

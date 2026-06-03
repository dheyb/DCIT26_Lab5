# API Documentation for Database Connection

This document describes the API endpoints that your backend needs to implement to work with the frontend's axios integration.

## Base URL Configuration

The frontend is configured to use: `http://localhost:3000/api`

To change this, edit `src/assets/Utils/api.js` and update the `baseURL` in the axios instance configuration.

## Authentication Endpoints

### POST /api/auth/login
Login a user and return a token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "username": "string",
    "email": "string",
    "name": "string"
  },
  "token": "jwt_token_string"
}
```

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "phone": "string"
}
```

**Response:**
```json
{
  "username": "string",
  "email": "string",
  "name": "string",
  "phone": "string"
}
```

### POST /api/auth/logout
Logout the current user (requires authentication).

## User Endpoints

### GET /api/users/:userId
Get user profile by ID.

### PUT /api/users/:userId
Update user profile.

## Menu/Product Endpoints

### GET /api/menu
Get all menu items.

**Response:**
```json
{
  "Coffee Based": [
    {
      "id": 1,
      "name": "Americano",
      "price": 120,
      "image": "url_to_image"
    }
  ],
  "Non - Coffee Based": [],
  "Frapped Based": [],
  "Rice Meals": [],
  "Chicken Wings": []
}
```

### GET /api/menu/:id
Get a specific menu item by ID.

### POST /api/menu
Create a new menu item (admin only).

### PUT /api/menu/:id
Update a menu item (admin only).

### DELETE /api/menu/:id
Delete a menu item (admin only).

## Order Endpoints

### POST /api/orders
Create a new order.

**Request Body:**
```json
{
  "userId": "string",
  "items": [
    {
      "id": 1,
      "name": "string",
      "price": 120,
      "quantity": 2
    }
  ],
  "total": 240,
  "deliveryAddress": "string"
}
```

### GET /api/orders/user/:userId
Get all orders for a specific user.

### GET /api/orders/:orderId
Get a specific order by ID.

### PUT /api/orders/:orderId/status
Update order status.

**Request Body:**
```json
{
  "status": "pending|processing|completed|cancelled"
}
```

## Cart Endpoints

### GET /api/cart/:userId
Get cart items for a user.

### POST /api/cart/:userId
Add item to cart.

### PUT /api/cart/:userId/:itemId
Update cart item quantity.

### DELETE /api/cart/:userId/:itemId
Remove item from cart.

### DELETE /api/cart/:userId
Clear cart.

## Review Endpoints

### GET /api/reviews/product/:productId
Get all reviews for a product.

### POST /api/reviews
Create a new review.

**Request Body:**
```json
{
  "productId": 1,
  "userId": "string",
  "username": "string",
  "rating": 5,
  "comment": "string"
}
```

### PUT /api/reviews/:reviewId
Update a review.

### DELETE /api/reviews/:reviewId
Delete a review.

## Saved Items Endpoints

### GET /api/saved/:userId
Get saved items for a user.

### POST /api/saved/:userId
Add item to saved items.

**Request Body:**
```json
{
  "itemId": 1
}
```

### DELETE /api/saved/:userId/:itemId
Remove item from saved items.

## Announcement Endpoints

### GET /api/announcements
Get all announcements.

### POST /api/announcements
Create a new announcement (admin only).

### PUT /api/announcements/:id
Update an announcement (admin only).

### DELETE /api/announcements/:id
Delete an announcement (admin only).

## Delivery Endpoints

### GET /api/delivery/:userId
Get delivery addresses for a user.

### POST /api/delivery/:userId
Add a delivery address.

### PUT /api/delivery/:userId/:addressId
Update a delivery address.

### DELETE /api/delivery/:userId/:addressId
Delete a delivery address.

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The frontend automatically includes the token from localStorage for all requests.

## Error Handling

The frontend expects error responses in the following format:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized (will redirect to login)
- 404: Not Found
- 500: Server Error

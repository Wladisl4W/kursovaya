# Marketplace Tracker Project

## Overview
This is a marketplace tracking application that allows users to monitor products across Wildberries (WB) and Ozon marketplaces. The system provides unified statistics by matching equivalent products from different marketplaces and displaying consolidated information.

## Architecture
- **Backend**: Go (Gin framework) with PostgreSQL database (default)
- **Frontend**: React with Material UI components
- **Authentication**: JWT tokens for user authentication
- **Encryption**: AES encryption for API tokens
- **Containerization**: Docker + Docker Compose


## Features
- User registration and login
- Add stores (WB and Ozon) using API tokens
- Retrieve products from marketplaces using official APIs
- Manual matching of equivalent products from different marketplaces
- Unified statistics for matched products
- Full CRUD operations for product mappings

## Project Structure
```
project/
├── backend/                 # Go API
│   ├── cmd/
│   │   └── server/          # Entry point
│   ├── internal/
│   │   ├── config/          # Configuration
│   │   ├── database/        # Database connection
│   │   ├── models/          # Data models
│   │   ├── handlers/        # HTTP handlers
│   │   ├── routes/          # Routes
│   │   ├── service/         # Business logic
│   │   └── middleware/      # Middleware
│   └── pkg/
│       ├── api/             # API clients (WB, Ozon)
│       └── utils/           # Utilities (encryption, JWT)
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Components
│   │   ├── pages/           # Pages
│   │   ├── services/        # Centralized API service
│   │   ├── utils/           # Utilities
│   │   └── styles/          # Styles
└── docker-compose.yml       # Docker configuration
```

## Models
The application has the following key data models:

- **User**: Contains user information (ID, email, password)
- **Store**: Represents a marketplace store (ID, user ID, type ("wb" or "ozon"), encrypted API token)
- **Product**: Product information from marketplaces (ID, store ID, external ID from marketplace, name, price, quantity)
- **ProductMapping**: Links equivalent products from different marketplaces (ID, product1 ID, product2 ID, user ID)
- **Admin**: Administrative user information (ID, username, password)

## Running the Application

### With Docker (Recommended)

For PostgreSQL (default):
```bash
docker-compose up --build
```

> **Note**: The current implementation uses PostgreSQL.

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Without Docker
#### Backend
```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Environment Variables
### Backend
- `DB_HOST`: Database host (default: "postgres")
- `DB_PORT`: Database port (default: "5432")
- `DB_USER`: Database user (default: "postgres")
- `DB_PASSWORD`: Database password (default: "password")
- `DB_NAME`: Database name (default: "marketplace_tracker")
- `JWT_SECRET`: Secret key for JWT tokens
- `ENCRYPTION_KEY`: Key for encrypting API tokens
- `PORT`: Server port (default: "8080")

### Frontend
- `REACT_APP_API_URL`: URL for the API server

## API Endpoints
### Authentication
- `POST /api/auth/register` — user registration
- `POST /api/auth/login` — user login

### Stores
- `GET /api/stores` — get user's stores (requires token)
- `POST /api/stores` — add a store (requires token)

### Products
- `GET /api/products` — get products from marketplaces (requires token)
- `GET /api/products/saved` — get saved products from DB (requires token)

### Mappings
- `GET /api/mappings` — get product mappings (requires token)
- `POST /api/mappings` — create a product mapping (requires token)
- `DELETE /api/mappings/:id` — delete a product mapping (requires token)

## Technical Details
- All API tokens are encrypted with AES before saving to DB
- Uses real API endpoints from Wildberries and Ozon
- Server and client-side validation of input data
- Centralized API service in frontend for managing requests
- Support for both marketplaces (WB and Ozon)
- Intuitive interface for product matching
- Unified statistics for matched products
- Error handling and data validation
- Fully tested and production-ready system

For testing backend:
```bash
cd backend
go test ./...
```
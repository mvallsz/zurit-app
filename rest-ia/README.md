# Rest-IA Backend

Backend API for food ordering and restaurant management with AI integration, Kafka streams, Socket.io notifications, and BREVO API.

## Features

- **Food Ordering System**: Complete order management for restaurants
- **Restaurant Management**: Menus, tables, reservations, and categories
- **Kafka Streams**: Real-time event processing and messaging
- **Socket.io Notifications**: Real-time updates for orders and reservations
- **BREVO API Integration**: Email and SMS notifications
- **AI Integration**: OpenAI integration with configurable contexts
- **RAG Support**: Retrieval-Augmented Generation for intelligent responses

## Project Structure

```
rest-ia/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── entities/         # Entity definitions
│   ├── interfaces/       # TypeScript interfaces
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   │   ├── ai/           # AI and RAG services
│   │   ├── kafka/        # Kafka producer/consumer
│   │   ├── notifications/# BREVO notification service
│   │   └── socket/       # Socket.io service
│   └── utils/            # Utility functions
├── tests/                # Test files
├── .env.example          # Environment variables example
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
PORT=3500
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/rest-ia

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=rest-ia
KAFKA_GROUP_ID=rest-ia-group

# BREVO (Sendinblue)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourapp.com
BREVO_SENDER_NAME=Rest-IA

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# RAG Configuration
RAG_ENABLED=true
RAG_CHUNK_SIZE=1000
RAG_OVERLAP=200
```

## Installation

```bash
cd rest-ia
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token

### Restaurants
- `GET /api/v1/restaurants` - List all restaurants
- `GET /api/v1/restaurants/:id` - Get restaurant by ID
- `POST /api/v1/restaurants` - Create restaurant
- `PUT /api/v1/restaurants/:id` - Update restaurant
- `DELETE /api/v1/restaurants/:id` - Delete restaurant

### Menus
- `GET /api/v1/menus` - List all menus
- `GET /api/v1/menus/:id` - Get menu by ID
- `POST /api/v1/menus` - Create menu
- `PUT /api/v1/menus/:id` - Update menu
- `DELETE /api/v1/menus/:id` - Delete menu

### Menu Items
- `GET /api/v1/menu-items` - List all menu items
- `GET /api/v1/menu-items/:id` - Get menu item by ID
- `POST /api/v1/menu-items` - Create menu item
- `PUT /api/v1/menu-items/:id` - Update menu item
- `DELETE /api/v1/menu-items/:id` - Delete menu item

### Orders
- `GET /api/v1/orders` - List all orders
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/:id` - Update order
- `PATCH /api/v1/orders/:id/status` - Update order status
- `DELETE /api/v1/orders/:id` - Cancel order

### Customers
- `GET /api/v1/customers` - List all customers
- `GET /api/v1/customers/:id` - Get customer by ID
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Deliveries
- `GET /api/v1/deliveries` - List all deliveries
- `GET /api/v1/deliveries/:id` - Get delivery by ID
- `POST /api/v1/deliveries` - Create delivery
- `PUT /api/v1/deliveries/:id` - Update delivery
- `PATCH /api/v1/deliveries/:id/status` - Update delivery status

### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Tables
- `GET /api/v1/tables` - List all tables
- `GET /api/v1/tables/:id` - Get table by ID
- `POST /api/v1/tables` - Create table
- `PUT /api/v1/tables/:id` - Update table
- `DELETE /api/v1/tables/:id` - Delete table

### Reservations
- `GET /api/v1/reservations` - List all reservations
- `GET /api/v1/reservations/:id` - Get reservation by ID
- `POST /api/v1/reservations` - Create reservation
- `PUT /api/v1/reservations/:id` - Update reservation
- `DELETE /api/v1/reservations/:id` - Cancel reservation

### AI
- `POST /api/v1/ai/chat` - Chat with AI assistant
- `POST /api/v1/ai/context` - Configure AI context
- `GET /api/v1/ai/contexts` - List AI contexts
- `POST /api/v1/ai/rag/query` - Query with RAG
- `POST /api/v1/ai/rag/documents` - Add documents to RAG

### Notifications
- `POST /api/v1/notifications/email` - Send email notification
- `POST /api/v1/notifications/sms` - Send SMS notification

## WebSocket Events

### Orders
- `order:created` - New order created
- `order:updated` - Order updated
- `order:status-changed` - Order status changed

### Deliveries
- `delivery:assigned` - Delivery assigned
- `delivery:status-changed` - Delivery status changed
- `delivery:location-updated` - Delivery location updated

### Reservations
- `reservation:created` - New reservation created
- `reservation:confirmed` - Reservation confirmed
- `reservation:cancelled` - Reservation cancelled

## Kafka Topics

- `orders` - Order events
- `deliveries` - Delivery events
- `notifications` - Notification events
- `ai-requests` - AI processing requests
- `ai-responses` - AI processing responses

## License

MIT

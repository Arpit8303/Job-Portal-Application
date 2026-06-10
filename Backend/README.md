# Job Portal Backend

RESTful API for the Job Portal Application built with Node.js and Express.

## 📦 Project Structure

```
Backend/
├── config/
│   ├── db.js              # Database connection
│   └── models/            # Database models configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── jobsController.js   # Jobs CRUD operations
│   ├── userController.js   # User management
│   └── testController.js   # Test endpoints
├── middlewares/
│   ├── authMiddleware.js   # JWT verification
│   └── errorMiddleware.js  # Error handling
├── models/
│   ├── userModel.js        # User schema
│   └── jobsModel.js        # Jobs schema
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── jobsRoutes.js       # Jobs endpoints
│   ├── userRoutes.js       # User endpoints
│   └── testRoutes.js       # Test endpoints
├── utils/                  # Utility functions
├── test/                   # Test files
├── server.js               # Main entry point
├── package.json
├── .env                    # Environment variables (ignored by git)
├── .gitignore              # Git ignore rules
└── jobs-data.json          # Sample jobs data
```

## 🚀 Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the following variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Login and get JWT token
- `POST /logout` - Logout user

### Jobs (`/api/jobs`)
- `GET /` - Get all jobs
- `GET /:id` - Get specific job details
- `POST /` - Create new job (admin only)
- `PUT /:id` - Update job (admin only)
- `DELETE /:id` - Delete job (admin only)
- `POST /:id/apply` - Apply for a job

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /applications` - Get user's applications
- `GET /:id` - Get user details (admin only)

### Test (`/api/test`)
- `GET /` - Test endpoint

## 🔐 Authentication

Uses JWT (JSON Web Tokens) for authentication. Include token in Authorization header:
```
Authorization: Bearer <your_token>
```

## 🛡️ Middleware

- **authMiddleware.js** - Verifies JWT tokens
- **errorMiddleware.js** - Handles errors globally

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (development/production) |
| `DATABASE_URL` | Database connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRY` | Token expiration time |

## 🧪 Testing

Test endpoints available in `/api/test` routes for development and debugging.

## 📚 Controllers

- **authController.js** - Handles user registration and login
- **jobsController.js** - Manages job CRUD operations
- **userController.js** - Handles user profile management
- **testController.js** - Test endpoints for debugging

## ⚠️ Important Notes

- `.env` file is ignored by Git (never commit sensitive data)
- Always validate input data
- Use proper error handling in all routes
- JWT tokens are required for protected routes

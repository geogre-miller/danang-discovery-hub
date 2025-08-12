# Da Nang Discovery Hub

A full-stack web application for discovering cafes and restaurants in Da Nang, Vietnam.

## 🏗️ Project Structure

### Frontend (React + TypeScript + Vite)
```
src/
├── components/
│   ├── admin/
│   │   └── PlaceManagement.tsx         # Admin place management component
│   ├── common/
│   │   ├── MapView.tsx                 # Leaflet map component
│   │   ├── PlaceCard.tsx              # Place card component with like/dislike
│   │   └── ScrollToTop.tsx            # Scroll to top utility
│   ├── layout/
│   │   └── Header.tsx                 # Main navigation header
│   └── ui/                            # Shadcn/ui components
├── context/
│   └── AuthContext.tsx                # Authentication context
├── hooks/
│   ├── use-mobile.tsx                 # Mobile detection hook
│   ├── use-places.ts                  # React Query hooks for places
│   └── use-toast.ts                   # Toast notification hook
├── lib/
│   ├── api.ts                         # Axios instance with interceptors
│   └── utils.ts                       # Utility functions
├── pages/
│   ├── AdminDashboard.tsx             # Admin dashboard
│   ├── Favorites.tsx                  # User favorites
│   ├── Home.tsx                       # Main home page
│   ├── Login.tsx                      # Login page
│   ├── PlaceDetails.tsx               # Individual place details
│   └── Register.tsx                   # Registration page
├── services/
│   ├── auth.service.ts                # Authentication API calls
│   └── places.service.ts              # Places API calls
├── types/
│   ├── auth.ts                        # Authentication TypeScript types
│   └── place.ts                       # Place TypeScript types
└── main.tsx                           # App entry point with React Query
```

### Backend (Node.js + Express + MongoDB)
```
backend/
├── config/
│   ├── db.js                          # MongoDB connection
│   └── passport.js                    # Passport OAuth configuration
├── middleware/
│   └── auth.js                        # JWT authentication middleware
├── models/
│   ├── Place.js                       # Place mongoose model
│   └── User.js                        # User mongoose model
├── routes/
│   ├── auth.js                        # Authentication routes
│   └── places.js                      # Places CRUD routes
├── .env                               # Environment variables
├── package.json                       # Backend dependencies
└── server.js                          # Express server setup
```

## 🚀 Features

### Frontend Features
- **Responsive Design**: Mobile-first responsive design using Tailwind CSS
- **Authentication**: JWT-based auth with refresh tokens
- **Place Management**: CRUD operations for places
- **Interactive Components**: Like/dislike functionality, favorites
- **Admin Dashboard**: Protected admin routes for place management
- **Search & Filters**: Search places by name and filter by category
- **Maps Integration**: Interactive maps using Leaflet
- **Optimistic Updates**: React Query for data caching and synchronization

### Backend Features
- **RESTful API**: Clean REST endpoints for all operations
- **Authentication**: JWT access tokens + refresh tokens
- **OAuth Integration**: Google and Facebook login support
- **Data Validation**: Request validation and error handling
- **CORS Support**: Configured for frontend integration
- **MongoDB Integration**: Mongoose ODM for database operations

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Leaflet** - Map integration
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Passport** - OAuth strategies
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment configuration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Main-Cafe
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file with your MongoDB URI
   echo "MONGO_URI=your_mongodb_connection_string" > .env
   echo "JWT_SECRET=your_jwt_secret" >> .env
   echo "REFRESH_TOKEN_SECRET=your_refresh_secret" >> .env
   echo "PORT=5000" >> .env
   
   # Start the backend server
   npm start
   # or for development with auto-reload
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   # In the root directory
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

### Quick Start Scripts

**Windows users can use the provided batch file:**
```bash
# Start backend (run this first)
./start-backend.bat

# In another terminal, start frontend
npm run dev
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/current` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

### Places
- `GET /places` - Get all places (with optional filters)
- `POST /places` - Create new place
- `GET /places/:id` - Get place by ID
- `PUT /places/:id` - Update place
- `DELETE /places/:id` - Delete place
- `POST /places/:id/like` - Like a place
- `POST /places/:id/dislike` - Dislike a place

## 🔐 Authentication Flow

1. **Registration/Login**: User creates account or logs in
2. **JWT Tokens**: Server returns access token (15min) + refresh token (7 days)
3. **Token Storage**: Frontend stores tokens in localStorage
4. **API Requests**: Access token sent in Authorization header
5. **Token Refresh**: Automatic refresh using interceptors when access token expires
6. **Logout**: Tokens cleared from storage

## 👤 User Roles

- **User**: Can view places, like/dislike, manage favorites
- **Admin**: All user permissions + place management (CRUD operations)

## 🎨 UI/UX Features

- **Dark/Light Mode**: Theme switching support
- **Responsive**: Mobile-first design
- **Loading States**: Skeleton loaders and loading indicators  
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Smooth Animations**: Framer Motion transitions
- **Optimistic Updates**: Immediate UI feedback

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required if not OAuth),
  googleId: String (optional),
  facebookId: String (optional),
  avatar: String (optional),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date
}
```

### Place Model
```javascript
{
  name: String (required),
  address: String (required),
  category: String (required),
  time: String (default: "Hours not specified"),
  likes: Number (default: 0),
  dislikes: Number (default: 0),
  imageUrl: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **React Query** for excellent data management
- **Tailwind CSS** for utility-first styling
- **MongoDB Atlas** for database hosting
- **Vercel/Netlify** for deployment options

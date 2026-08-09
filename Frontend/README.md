# 📱 JobLedger Frontend

> A modern, fast, and intuitive job tracking application built with React + Vite

[![React](https://img.shields.io/badge/React-18.2.0-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0.0-646cff?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Author:** [Arpit Tiwari](https://github.com/Arpit8303)  
**Email:** arpittiwari1200@gmail.com

## ✨ Features

- 🎯 **Job Management** - Create, edit, and organize all your job applications
- 📊 **Analytics & Insights** - Beautiful charts and statistics for your job search progress
- 🔐 **Secure Authentication** - JWT-based authentication with protected routes
- 🌓 **Dark/Light Theme** - Toggle between dark and light modes
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Lightning Fast** - Built with Vite for instant development and fast builds
- 🎨 **Modern UI** - Beautiful gradient design with purple accent colors
- 🔍 **Advanced Filtering** - Search and filter jobs with ease

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React** | UI library |
| **Vite** | Build tool & dev server |
| **React Router** | Client-side routing |
| **Axios** | HTTP client |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Icon library |
| **ESLint** | Code quality |

## 📂 Project Structure

```
Frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── ProtectedRoute.jsx
│   │   ├── JobCard.jsx
│   │   ├── Charts.jsx
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Landing.jsx      # Home page
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Dashboard.jsx    # User dashboard
│   │   ├── Jobs.jsx         # Jobs listing
│   │   └── Profile.jsx      # User profile
│   ├── services/            # API services
│   │   ├── api.js           # API configuration
│   │   ├── authService.js   # Auth API
│   │   └── jobService.js    # Job API
│   ├── context/             # React context
│   │   └── AppContext.jsx   # Global app state
│   ├── assets/              # Images, logos, fonts
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint rules
├── index.html               # HTML template
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file** (if needed)
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Development

Start the development server with hot module replacement:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## 🎨 Design System

### Colors

**Primary Colors:**
- Purple: `#7C3AED`
- Purple Light: `#A78BFA`
- Purple Dark: `#6D28D9`

**Accent Colors:**
- Blue: `#3B82F6`
- Green: `#10B981`
- Orange: `#F97316`

### Component Examples

#### Button Variants
```jsx
<button className="btn btn--primary">Primary Button</button>
<button className="btn btn--blue">Blue Button</button>
<button className="btn btn--green">Green Button</button>
<button className="btn btn--outline">Outline Button</button>
```

## 📡 API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/jobs` | Get all jobs |
| POST | `/api/jobs` | Create new job |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/users/profile` | Get user profile |

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for authentication:

1. User credentials are sent to backend
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is sent in Authorization header for protected requests
5. Protected routes require valid token

Protected routes:
- `/dashboard`
- `/jobs`
- `/profile`

## 🐛 Common Issues

### Issue: "Port 5173 already in use"
```bash
# Kill the process using port 5173
# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### Issue: Backend API not responding
- Ensure backend is running on `http://localhost:5000`
- Check API URL in environment variables
- Verify CORS is enabled on backend

### Issue: Styles not loading
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Production
npm run build        # Build for production
npm run preview      # Preview production build locally

# Quality
npm run lint         # Run ESLint
```

## 🎯 Future Enhancements

- [ ] Export applications as PDF
- [ ] Email notifications
- [ ] Advanced calendar view
- [ ] Interview scheduling
- [ ] Salary tracker
- [ ] Company reviews integration
- [ ] Mobile app version

## 📝 Environment Variables

Create a `.env` file in the Frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**JobLedger Team**
- GitHub: [@yourusername](https://github.com)
- Email: your.email@example.com

## 📞 Support

For support, email support@jobLedger.com or open an issue on GitHub.

## 🙏 Acknowledgments

- React community for excellent documentation
- Vite team for amazing tooling
- All contributors and users

---

Made with ❤️ for job seekers everywhere

## ⚙️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Features

- ⚡ Fast refresh with HMR
- 📦 Optimized builds
- 🔍 ESLint integration
- 🎨 CSS support

## 🔗 API Integration

The frontend connects to the backend API running on `http://localhost:5000`. Update the API base URL in your environment or API configuration file if needed.

## 📖 Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [ESLint Documentation](https://eslint.org)

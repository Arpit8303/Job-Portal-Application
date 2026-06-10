# Job Portal Frontend

React + Vite frontend application for the Job Portal platform. This provides a fast development experience with HMR (Hot Module Replacement) and ESLint integration.

## 📦 Project Structure

```
Frontend/
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components
│   ├── assets/          # Images and static files
│   ├── App.jsx          # Main App component
│   ├── App.css          # App styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static public assets
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
├── index.html           # HTML template
└── package.json
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 🛠 Build Tools

- **Vite** - Next generation frontend tooling
- **React** - UI library
- **ESLint** - Code quality tool

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

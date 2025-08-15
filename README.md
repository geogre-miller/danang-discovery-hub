# Da Nang Discovery Hub

A modern web application for discovering and managing places in Da Nang, Vietnam. Built with React, TypeScript, and featuring MapTiler and Geoapify integration for maps and location services.

## 🚀 Features

- **Place Discovery**: Browse and search through various places in Da Nang
- **Interactive Maps**: View places on interactive MapTiler maps with category-based markers
- **Smart Search**: Real-time place search with Geoapify autocomplete
- **User Authentication**: Secure login and registration system
- **Favorites System**: Save and manage your favorite places
- **Admin Dashboard**: Comprehensive place management for administrators
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Real-time Updates**: Like/dislike system with animated feedback

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Maps**: MapTiler SDK for map display
- **Location Services**: Geoapify for autocomplete and geocoding
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Node.js, Express, MongoDB

## 🗺️ Maps & Location Integration

This project uses **MapTiler** for map display and **Geoapify** for location search:

### MapTiler Features
- Interactive street maps
- Category-based marker colors
- Custom marker styling
- Responsive map display
- 100,000 free map loads/month

### Geoapify Features
- Real-time place autocomplete
- GPS location detection
- Address formatting
- Vietnam-focused search results
- 3,000 free requests/day

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MapTiler API key
- Geoapify API key

## 🔧 Installation

1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```sh
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```bash
VITE_MAPTILER_KEY=your_maptiler_api_key
VITE_GEOAPIFY_KEY=your_geoapify_api_key
```

4. **Start the development server**
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Build for Production

```sh
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── common/         # Common components (maps, cards, etc.)
│   ├── layout/         # Layout components (header, navigation)
│   └── ui/             # shadcn/ui components
├── pages/              # Page components
├── services/           # API services (auth, places, maps)
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## 🔑 API Keys Setup

### MapTiler API Key
1. Visit [MapTiler Cloud](https://cloud.maptiler.com/)
2. Sign up for a free account
3. Create a new API key
4. Add it to your `.env` file as `VITE_MAPTILER_KEY`

### Geoapify API Key
1. Visit [Geoapify](https://www.geoapify.com/)
2. Sign up for a free account
3. Create a new API key
4. Add it to your `.env` file as `VITE_GEOAPIFY_KEY`

## 🎨 Customization

### Map Styling
Modify marker colors in `src/components/common/MapTilerView.tsx`:
```typescript
const getCategoryColor = (category?: string): string => {
  const colors: Record<string, string> = {
    'Coffee Shop': '#8B4513',
    'Restaurant': '#FF6347',
    // Add your custom colors here
  };
  return colors[category || ''] || '#e74c3c';
};
```

### Search Bias
Configure search bias in Geoapify autocomplete components:
```tsx
<GeoapifyAutocomplete
  bias="countrycode:vn" // Bias towards Vietnam
  // other props...
/>
```

## 🔍 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📖 Documentation

- [MapTiler & Geoapify Integration Guide](./MAPTILER_GEOAPIFY_INTEGRATION.md)
- [Animation Improvements](./ANIMATION_IMPROVEMENTS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [MapTiler](https://maptiler.com/) for map services
- [Geoapify](https://geoapify.com/) for location services
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Lucide](https://lucide.dev/) for icons

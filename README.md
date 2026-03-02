# The Blueprint 🌌

**The Blueprint** is a premium, minimalist developer dashboard designed for modern engineers. It provides a curated feed of trending open-source repositories, latest research papers (arXiv, Hugging Face), and industry news, all wrapped in a sleek, glassmorphism-inspired interface.

## ✨ Key Features

### 🌪️ Smart Trending Feed
- **Carousel Navigation**: Browse through top GitHub repositories with smooth, floating side-navigation arrows.
- **Deep Discovery**: Access up to 20 trending projects per category (Computer Science, Mechanical, Civil, etc.).
- **Flexible Filters**: Toggle between Daily, Weekly, and Monthly trends to stay on top of the ecosystem.

### ☁️ Cloud Sync & Security
- **GitHub Gist Integration**: Your personal "Vault" of saved items is automatically synchronized to a private, version-controlled GitHub Gist.
- **Transparent Status**: Real-time sync indicators with direct links to your cloud data.
- **Secure Architecture**: Strictly follows security best practices by utilizing environment variables for all sensitive API credentials.

### 👤 Integrated Profile System
- **Standalone Management**: A dedicated profile page for managing account settings, sync status, and cloud references.
- **Theme-Aware UI**: Fully optimized for both sleek Dark Mode and clean Light Mode.

### 📱 Responsive Design
- **Mobile-First**: Smooth vertical and horizontal scrolling optimized for all device sizes, from mobile phones to high-res monitors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Firebase project (for Auth)
- A GitHub Personal Access Token (or using the integrated OAuth flow)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jayasriganesh/The-Blueprint.git
   cd the-blueprint
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run in Development**:
   ```bash
   npm run dev
   ```

### Deployment

The project is configured for seamless deployment to **GitHub Pages**:
```bash
npm run deploy
```

## 🛠️ Built With

- **React 19**: Modern UI library for a fast, component-driven experience.
- **Vite**: Ultra-fast build tool and development server.
- **Lucide React**: Beautiful, consistent iconography.
- **Framer Motion**: Smooth, high-performance micro-animations.
- **Firebase**: Secure authentication and backend services.
- **GitHub API**: Real-time data fetching and Gist-based cloud storage.

## 📄 License

This project is open-source and available under the MIT License.

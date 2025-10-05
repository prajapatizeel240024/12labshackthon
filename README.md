## 🏗️ How 12labshackthon is Built - Complete Architecture Guide

Based on my analysis of the codebase, here's a comprehensive breakdown of how this video-powered AI chatbot application is constructed:

## 📋 **System Architecture Overview**

The AgenticRAG application follows a **3-tier architecture**:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │  Twelve Labs API │
│                 │    │                 │    │                 │
│ • Chat Interface│◄──►│ • API Proxy     │◄──►│ • Video Search  │
│ • Admin Panel   │    │ • File Upload   │    │ • Intelligence  │
│ • Video Search  │    │ • Status Check  │    │ • Indexing      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   OpenAI API    │
                    │                 │
                    │ • GPT Models    │
                    │ • Chat Completions│
                    │ • Streaming     │
                    └─────────────────┘
```

## 🛠️ **Build Process & Technologies**

### **Frontend (React + TypeScript + Vite)**

**Technology Stack:**
- **React 19.1.0** - Modern React with latest features
- **TypeScript 5.8.3** - Type safety and better development experience
- **Vite 7.0.6** - Fast build tool and development server
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **React Router 7.7.1** - Client-side routing

**Key Dependencies:**
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0", 
  "typescript": "^5.8.3",
  "vite": "^7.0.6",
  "tailwindcss": "^4.1.11",
  "react-router-dom": "^7.7.1",
  "react-markdown": "^10.1.0",
  "i18next": "^25.3.2"  // Multi-language support
}
```

**Build Configuration (`vite.config.ts`):**
```typescript
export default defineConfig({
    plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
    server: {
        open: true,
        port: 3000,  // Development server
    },
    build: {
        chunkSizeWarningLimit: 2000,
    },
});
```

### **Backend (Node.js + Express)**

**Technology Stack:**
- **Node.js 18+** - JavaScript runtime
- **Express 4.18.2** - Web framework
- **Multer 1.4.5** - File upload handling
- **CORS 2.8.5** - Cross-origin resource sharing
- **node-fetch 2.7.0** - HTTP client for API calls

**Key Dependencies:**
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5", 
  "multer": "^1.4.5-lts.1",
  "form-data": "^4.0.0",
  "node-fetch": "^2.7.0"
}
```

## 🚀 **Build & Deployment Process**

### **1. Automated Setup (Recommended)**

**Windows:**
```cmd
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

The setup script automatically:
- ✅ Checks Node.js and npm installation
- ✅ Installs all dependencies for both frontend and backend
- ✅ Creates necessary directories (`uploads/`)
- ✅ Generates configuration templates (`env.json`)
- ✅ Creates start scripts for easy deployment

### **2. Manual Build Process**

**Backend Setup:**
```bash
cd backend
npm install
mkdir uploads  # For temporary file storage
npm start      # Production server on port 3001
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run build:css  # Build Tailwind CSS
npm start          # Development server on port 5173
```

### **3. Production Build**

**Frontend Production Build:**
```bash
cd frontend
npm run build:css && tsc && vite build
```

This creates an optimized `dist/` folder with:
- Minified JavaScript bundles
- Optimized CSS
- Static assets
- Production-ready React app

## 🏛️ **Application Architecture**

### **Frontend Architecture**

**Component Structure:**
```
src/
├── components/           # React components
│   ├── AdminDashboard.tsx    # Video management interface
│   ├── Chat.tsx             # Main chat interface  
│   ├── VideoSearchService.ts # Video search integration
│   └── ...
├── service/             # Business logic services
│   ├── ChatService.ts       # AI conversation management
│   ├── VideoSearchService.ts # Video search operations
│   └── ...
├── models/              # TypeScript interfaces
├── utils/               # Utility functions
└── env.json            # Configuration
```

**Key Services:**

1. **ChatService.ts** - Orchestrates AI conversations
   - Enhances messages with video context
   - Manages streaming responses
   - Handles OpenAI API integration

2. **VideoSearchService.ts** - Video search operations
   - Manages video search requests
   - Formats search results
   - Handles API communication

3. **AdminDashboard.tsx** - Video management
   - Video upload interface
   - Index configuration
   - Status monitoring

### **Backend Architecture**

**Server Structure (`server.js`):**
```javascript
// Key endpoints
POST /api/indexes          // Create video index
POST /api/tasks            // Upload video files
GET  /api/tasks/:taskId    // Check upload status
POST /api/search           // Search videos
GET  /api/indexes/:id      // Get index details
GET  /health               // Health check
```

**Core Functionality:**
- **CORS Management** - Handles cross-origin requests
- **File Upload** - Processes video files with Multer
- **API Proxy** - Forwards requests to Twelve Labs API
- **Error Handling** - Comprehensive error management
- **File Cleanup** - Automatic temporary file removal

## 🔧 **Configuration System**

### **Environment Configuration (`frontend/src/env.json`):**
```json
{
  "openapi_key": "sk-proj-...",     // OpenAI API Key
  "default_model": "gpt-4o",        // Default GPT model
  "default_temperature": 0.7,       // AI creativity (0-1)
  "TwLabs": "tlk_..."              // Twelve Labs API Key
}
```

### **API Integration:**
- **OpenAI API** - GPT models for chat completions
- **Twelve Labs API** - Video intelligence and search
- **Backend Proxy** - Secure API key management

## 🎯 **Key Features Implementation**

### **1. Video Search Integration**
- **Visual Search** - Objects, scenes, actions
- **Audio Search** - Spoken words, music, sounds
- **Text Search** - Text within video frames
- **Logo Detection** - Brand identification

### **2. AI-Powered Chat**
- **Streaming Responses** - Real-time AI responses
- **Video Context** - Enhanced responses with video information
- **Multi-language Support** - 15+ languages
- **Custom Instructions** - Configurable AI behavior

### **3. Admin Dashboard**
- **Video Management** - Upload, delete, monitor videos
- **Index Configuration** - Create and manage video indexes
- **Status Monitoring** - Real-time processing status
- **Analytics** - Search performance tracking

## 🚀 **Deployment Options**

### **Development Mode:**
```bash
# Backend with auto-restart
cd backend && npm run dev

# Frontend with hot reload  
cd frontend && npm start
```

### **Production Mode:**
```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start
```

### **Docker Deployment:**
```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports: ["3001:3001"]
    
  frontend:
    build: ./frontend  
    ports: ["80:80"]
```

## 📊 **Performance Optimizations**

### **Frontend:**
- **Code Splitting** - Lazy loading of components
- **Debounced Streaming** - Prevents excessive API calls
- **Result Caching** - Stores video metadata locally
- **Progressive Loading** - Streams AI responses

### **Backend:**
- **Request Proxying** - Handles CORS and authentication
- **File Cleanup** - Automatic temporary file removal
- **Error Handling** - Comprehensive error management
- **Status Monitoring** - Tracks video processing

## 🔐 **Security Features**

- **API Key Management** - Secure key storage and rotation
- **File Upload Security** - Type validation and size limits
- **CORS Configuration** - Proper cross-origin handling
- **Input Sanitization** - Prevents injection attacks

## 🎉 **Getting Started**

1. **Clone Repository**
2. **Run Setup Script** (`setup.bat` or `setup.sh`)
3. **Configure API Keys** in `frontend/src/env.json`
4. **Start Application** (`start-all.bat` or `start-all.sh`)
5. **Access Application** at `http://localhost:5173`

This architecture provides a robust, scalable foundation for video-powered AI conversations with modern development practices and comprehensive error handling.

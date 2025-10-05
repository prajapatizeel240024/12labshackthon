# 🎬Video-Powered AI Chatbot

A sophisticated AI chatbot that combines **Twelve Labs Video Intelligence** with **OpenAI GPT models** to provide intelligent, context-aware responses based on your video content.

## ✨ Features

- 🎥 **Video Intelligence**: Search through video content using visual and audio analysis
- 🤖 **AI-Powered Chat**: Natural language conversations with video context
- 📊 **Real-time Search**: Instant video search results with timestamps and confidence scores
- 🎯 **Smart Context**: AI responses enhanced with relevant video information
- 📱 **Modern UI**: Beautiful, responsive interface with dark/light mode
- 🔄 **Real-time Streaming**: Live AI responses with video context
- 📈 **Admin Dashboard**: Complete video management and configuration
- 🌍 **Multi-language Support**: 15+ languages supported

## 🏗️ Architecture

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

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenAI API Key** (GPT-4 access recommended)
- **Twelve Labs API Key** (Video Intelligence)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AgenticRAG
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the backend server
npm start
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Configure API keys
# Edit src/env.json with your API keys
```

**Configure API Keys in `frontend/src/env.json`:**
```json
{
  "openapi_key": "sk-proj-YOUR_OPENAI_KEY_HERE",
  "default_model": "gpt-4o",
  "TwLabs": "tlk_YOUR_TWELVE_LABS_KEY_HERE"
}
```

```bash
# Start the frontend development server
npm start
```

The frontend will run on `http://localhost:5173`

### 4. Initial Setup

1. **Open the application** in your browser
2. **Go to Admin Dashboard** → Settings tab
3. **Create or configure your video index**:
   - Option 1: Create new index
   - Option 2: Use existing Twelve Labs index ID
4. **Upload videos** or **sync existing videos**
5. **Start chatting** with video context!

## 📋 Detailed Setup Guide

### Backend Configuration

The backend serves as a proxy between your frontend and external APIs, handling:

- **CORS management**
- **API key security**
- **File uploads**
- **Video search requests**
- **Status monitoring**

**Key Endpoints:**
- `POST /api/search` - Video search
- `POST /api/tasks` - Video upload
- `GET /api/tasks/:id` - Check upload status
- `GET /api/indexes/:id` - Index management

### Frontend Configuration

**Environment Variables (`src/env.json`):**
```json
{
  "openapi_key": "sk-proj-...",
  "default_model": "gpt-4o",
  "default_system_prompt": "You are a helpful assistant.",
  "default_temperature": 0.7,
  "speech_model": "tts-1",
  "speech_voice": "alloy",
  "speech_speed": 1.0,
  "TwLabs": "tlk_..."
}
```

**Key Components:**
- `AdminDashboard.tsx` - Video management interface
- `Chat.tsx` - Main chat interface
- `VideoSearchService.ts` - Video search integration
- `ChatService.ts` - AI conversation management

## 🎯 Usage Guide

### 1. Video Management

**Upload Videos:**
1. Go to **Admin Dashboard** → **Videos** tab
2. Enter video title and select file
3. Click **Upload Video**
4. Wait for indexing to complete (status: Ready)

**Sync Existing Videos:**
1. Go to **Admin Dashboard** → **Settings** tab
2. Enter your Twelve Labs Index ID
3. Click **"Sync from Index"**
4. Videos will be loaded into the dashboard

### 2. Chat with Video Context

**Ask Questions:**
```
"Tell me about octopuses"
"Show me dance videos"
"What fashion content do you have?"
"Find videos with water scenes"
```

**AI Response Format:**
```
📹 **Video Title** (Confidence: 95%)
   ⏰ Time: 0:10 - 2:25
   📝 Content: Educational content about octopuses...
```

### 3. Search Capabilities

**Visual Search:**
- Objects, scenes, actions
- People and faces
- Text in video frames
- Brand logos

**Audio Search:**
- Spoken words and dialogue
- Music and sounds
- Narration and commentary

## 🔧 Configuration Options

### Search Parameters

**Search Options:**
```typescript
options: ['visual', 'audio', 'text_in_video', 'logo']
```

**Confidence Thresholds:**
- `low` - 50%+ confidence (more results)
- `medium` - 70%+ confidence (balanced)
- `high` - 85%+ confidence (precise matches)

### AI Model Settings

**Available Models:**
- `gpt-4o` (Recommended)
- `gpt-4o-mini`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

**Temperature Settings:**
- `0.0-0.3` - More focused, deterministic
- `0.4-0.7` - Balanced creativity
- `0.8-1.0` - More creative, varied responses

## 🛠️ Development

### Project Structure

```
AgenticRAG/
├── backend/                 # Node.js backend server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── uploads/            # Temporary file storage
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── service/        # Business logic services
│   │   ├── utils/          # Utility functions
│   │   ├── models/         # TypeScript interfaces
│   │   └── env.json        # Configuration
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── docs/                   # Documentation
```

### Key Services

**VideoSearchService.ts:**
- Manages video search operations
- Handles API communication
- Formats search results

**ChatService.ts:**
- Orchestrates AI conversations
- Enhances messages with video context
- Manages streaming responses

**AdminDashboard.tsx:**
- Video upload and management
- Index configuration
- Status monitoring

### Development Commands

**Backend:**
```bash
cd backend
npm start          # Start production server
npm run dev        # Start with nodemon (auto-restart)
```

**Frontend:**
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm run serve      # Preview production build
```

## 🔍 Troubleshooting

### Common Issues

**"Video search not available"**
- ✅ Check API keys in `src/env.json`
- ✅ Verify backend server is running on port 3001
- ✅ Ensure Index ID is configured

**"No videos found"**
- ✅ Upload videos or sync from existing index
- ✅ Wait for videos to reach "Ready" status
- ✅ Check browser console for errors

**"Connection refused"**
- ✅ Start backend server: `cd backend && npm start`
- ✅ Verify backend is running on port 3001
- ✅ Check firewall settings

**"API key invalid"**
- ✅ Verify OpenAI API key has GPT-4 access
- ✅ Check Twelve Labs API key is valid
- ✅ Ensure keys are properly formatted in `env.json`

### Debug Mode

**Enable Console Logging:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for video search logs:
   - `🔍 Video search available: true`
   - `📹 Videos from Twelve Labs:`
   - `✅ Converted videos:`

**Backend Logs:**
```bash
cd backend
npm start
# Watch for API request logs
```

## 📊 Performance Optimization

### Frontend Optimizations

- **Debounced streaming** prevents excessive API calls
- **Result caching** stores video metadata locally
- **Progressive loading** streams AI responses
- **Error boundaries** handle component failures gracefully

### Backend Optimizations

- **Request proxying** handles CORS and authentication
- **File cleanup** removes temporary uploads
- **Error handling** provides detailed error messages
- **Status monitoring** tracks video processing

## 🔐 Security Considerations

### API Key Management

- **Never commit API keys** to version control
- **Use environment variables** in production
- **Rotate keys regularly** for security
- **Monitor API usage** to prevent abuse

### File Upload Security

- **File type validation** prevents malicious uploads
- **Size limits** prevent resource exhaustion
- **Temporary storage** with automatic cleanup
- **Input sanitization** prevents injection attacks

## 🌟 Advanced Features

### Custom Chat Instructions

Edit `src/utils/VideoSearchPrompts.ts` to customize:
- AI response format
- Video search instructions
- System prompts

### Multi-language Support

The system supports 15+ languages:
- English, Spanish, French, German
- Chinese, Japanese, Korean
- Arabic, Hindi, Portuguese
- And more...

### Video Analytics

Track video performance:
- Search frequency
- Confidence scores
- User engagement
- Content discovery

## 📈 Scaling Considerations

### Production Deployment

**Frontend:**
- Build static files: `npm run build`
- Serve with CDN (Cloudflare, AWS CloudFront)
- Enable gzip compression

**Backend:**
- Use PM2 for process management
- Configure reverse proxy (Nginx)
- Set up load balancing
- Monitor with logging services

### Database Integration

For production, consider adding:
- **PostgreSQL** for user data
- **Redis** for caching
- **MongoDB** for video metadata
- **Elasticsearch** for advanced search

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Twelve Labs** for video intelligence API
- **OpenAI** for GPT models
- **React** and **Vite** for the frontend framework
- **Node.js** and **Express** for the backend

## 📞 Support

For support and questions:
- Check the [troubleshooting section](#troubleshooting)
- Review the [workflow documentation](VIDEO_CHATBOT_WORKFLOW.md)
- Open an issue on GitHub

---

**Built with ❤️ for intelligent video-powered conversations**

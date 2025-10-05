# 🎬 Frontend - Video-Powered AI Chatbot

A sophisticated React frontend for the AgenticRAG video-powered AI chatbot system that combines **Twelve Labs Video Intelligence** with **OpenAI GPT models** to provide intelligent, context-aware responses based on video content.

## ✨ Features

- 🎥 **Video Intelligence**: Search through video content using visual and audio analysis
- 🤖 **AI-Powered Chat**: Natural language conversations with video context
- 📊 **Real-time Search**: Instant video search results with timestamps and confidence scores
- 🎯 **Smart Context**: AI responses enhanced with relevant video information
- 📱 **Modern UI**: Beautiful, responsive interface with dark/light mode
- 🔄 **Real-time Streaming**: Live AI responses with video context
- 📈 **Admin Dashboard**: Complete video management and configuration
- 🌍 **Multi-language Support**: 15+ languages supported

## 🏗️ Technology Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **i18next** - Internationalization support

## 📋 Requirements

* [Node.JS](https://nodejs.dev/en/) 18+
* [npm](https://www.npmjs.com/) 8+
* [OpenAI API Account](https://openai.com/blog/openai-api) with GPT-4 access
* [Twelve Labs API Account](https://twelvelabs.io/) for video intelligence

## 🚀 Quick Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd AgenticRAG/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API keys**
Edit `src/env.json` with your API keys:
```json
{
  "openapi_key": "sk-proj-YOUR_OPENAI_KEY_HERE",
  "default_model": "gpt-4o",
  "TwLabs": "tlk_YOUR_TWELVE_LABS_KEY_HERE"
}
```

4. **Start the development server**
```bash
npm start
```

The application will open at [http://localhost:5173](http://localhost:5173)

## 🛠️ Development Commands

```bash
npm start          # Start development server
npm run build      # Build for production
npm run serve      # Preview production build
npm run build:css  # Build Tailwind CSS
```

## 🏛️ Frontend Architecture & File Structure

### 📁 Project Structure
```
frontend/
├── public/                    # Static assets
│   ├── locales/              # i18n translation files (15+ languages)
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/           # React components (40+ files)
│   ├── service/             # Business logic services
│   ├── models/              # TypeScript interfaces
│   ├── utils/               # Utility functions
│   ├── constants/           # App constants and endpoints
│   ├── hooks/               # Custom React hooks
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # Application entry point
│   ├── env.json             # Configuration file
│   └── tailwind.css         # Compiled CSS
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

### 🧩 Core Components

#### **Main Application Components**
- **`App.tsx`** - Root component with routing and layout
- **`MainPage.tsx`** - Main chat interface container
- **`SideBar.tsx`** - Navigation sidebar with conversation list
- **`Chat.tsx`** - Primary chat interface with video context

#### **Video Intelligence Components**
- **`AdminDashboard.tsx`** - Complete video management interface (1,443 lines)
- **`VideoSearchDemo.tsx`** - Video search demonstration
- **`VideoSearchGuide.tsx`** - User guide for video search
- **`VideoSearchDiagnostic.tsx`** - Diagnostic tools for troubleshooting
- **`VideoSearchTest.tsx`** - Testing interface for video search
- **`VideoSearchStatus.tsx`** - Real-time video processing status

#### **Chat & UI Components**
- **`ChatBlock.tsx`** - Individual chat message blocks
- **`MessageBox.tsx`** - Message input and display
- **`MarkdownBlock.tsx`** - Markdown rendering for AI responses
- **`UserContentBlock.tsx`** - User message display
- **`ConversationList.tsx`** - Chat history management
- **`ConversationListItem.tsx`** - Individual conversation items

#### **Settings & Configuration**
- **`ChatSettingsForm.tsx`** - Chat configuration interface
- **`ChatSettingsList.tsx`** - Settings management
- **`ModelSelect.tsx`** - AI model selection dropdown
- **`TemperatureSlider.tsx`** - AI creativity control
- **`TopPSlider.tsx`** - AI response diversity control
- **`UserSettingsModal.tsx`** - User preferences

#### **Utility Components**
- **`Button.tsx`** - Reusable button component
- **`Tooltip.tsx`** - Contextual help tooltips
- **`ConfirmDialog.tsx`** - Confirmation dialogs
- **`CopyButton.tsx`** - Copy-to-clipboard functionality
- **`ScrollToBottomButton.tsx`** - Auto-scroll to latest messages
- **`TextToSpeechButton.tsx`** - Speech synthesis controls
- **`SpeechSpeedSlider.tsx`** - TTS speed adjustment

#### **Custom Chat Features**
- **`CustomChatEditor.tsx`** - Custom chat creation interface
- **`CustomChatSplash.tsx`** - Custom chat welcome screen
- **`ExploreCustomChats.tsx`** - Browse custom chat templates
- **`EditableField.tsx`** - Inline editing components
- **`EditableInstructions.tsx`** - Custom instruction editing

### 🔧 Services Layer

#### **Core Services**
- **`ChatService.ts`** (493 lines) - AI conversation orchestration
  - Enhances messages with video context
  - Manages streaming responses
  - Handles OpenAI API integration
  - Video search integration

- **`VideoSearchService.ts`** (227 lines) - Video intelligence operations
  - Twelve Labs API integration
  - Video search and indexing
  - Result formatting and caching
  - Error handling and retry logic

- **`ConversationService.ts`** - Chat history management
- **`FileDataService.ts`** - File upload and management
- **`SpeechService.ts`** - Text-to-speech functionality
- **`NotificationService.ts`** - User notifications and alerts

#### **Data Management**
- **`ChatSettingsDB.ts`** - Local storage for chat settings
- **`EventEmitter.ts`** - Event-driven architecture
- **`CustomError.ts`** - Custom error handling

### 📊 Models & Types

#### **TypeScript Interfaces**
- **`ChatCompletion.ts`** - OpenAI API response types
- **`ChatSettings.ts`** - Chat configuration models
- **`FileData.ts`** - File upload and metadata types
- **`model.ts`** - AI model definitions and capabilities
- **`SpeechSettings.ts`** - Text-to-speech configuration

### 🎣 Custom Hooks

- **`useVideoSearch.ts`** - Video search functionality hook
  - Search state management
  - Result formatting
  - Error handling
  - Availability checking

### ⚙️ Configuration & Constants

#### **API Configuration**
- **`apiEndpoints.ts`** - OpenAI API endpoints
- **`appConstants.ts`** - Application-wide constants
  - File upload limits
  - Chat streaming settings
  - UI configuration values

#### **Environment Configuration**
- **`env.json`** - API keys and settings
- **`config.ts`** - Runtime configuration
- **`i18n.ts`** - Internationalization setup

### 🎨 Styling & Assets

#### **CSS Files**
- **`App.css`** - Main application styles
- **`globalStyles.css`** - Global style definitions
- **`tailwind.css`** - Compiled Tailwind CSS
- **Component-specific CSS** - Individual component styles

#### **Internationalization**
- **`public/locales/`** - Translation files for 15+ languages
  - English, Spanish, French, German
  - Chinese, Japanese, Korean
  - Arabic, Hindi, Portuguese
  - And more...

### 🛠️ Development Tools

#### **Build Configuration**
- **`vite.config.ts`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration
- **`postcss.config.cjs`** - PostCSS configuration

#### **Testing & Quality**
- **`setupTests.ts`** - Test environment setup
- **`App.test.tsx`** - Application tests
- **`cypress/`** - End-to-end testing framework

## 🔧 Configuration

The application uses `src/env.json` for configuration:

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

## 🌐 Backend Integration

This frontend works with the AgenticRAG backend server running on `http://localhost:3001`. The backend handles:
- Video file uploads
- Twelve Labs API integration
- CORS management
- Health monitoring

## 📚 Documentation

- [Complete Setup Guide](../README.md)
- [Video Chatbot Workflow](../VIDEO_CHATBOT_WORKFLOW.md)
- [Video Search Guide](../VIDEO_SEARCH_CHATBOT_GUIDE.md)
- [Features Documentation](FEATURES.md)

## 🤝 Contributing

All contributions are welcome. Feel free to open an issue or create a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

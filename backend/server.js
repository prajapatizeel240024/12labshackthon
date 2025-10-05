// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const API_BASE_URL = 'https://api.twelvelabs.io/v1.3';

// Create Index
app.post('/api/indexes', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/indexes`, {
      method: 'POST',
      headers: {
        'x-api-key': req.body.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        index_name: req.body.index_name,
        models: req.body.models || [
          {
            model_name: 'marengo2.7',
            model_options: ['visual', 'audio']
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Twelve Labs API Response:', data); // Debug log
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || data.error || 'Failed to create index' 
      });
    }
    
    // Twelve Labs API returns the index ID in the _id field
    res.json({
      _id: data._id || data.id,  // Handle both possible field names
      ...data
    });
  } catch (error) {
    console.error('Create index error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Index
app.delete('/api/indexes/:indexId', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/indexes/${req.params.indexId}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': req.query.apiKey || req.body.apiKey
      }
    });

    if (!response.ok) {
      const data = await response.json();
      return res.status(response.status).json({ 
        error: data.message || data.error || 'Failed to delete index' 
      });
    }
    
    res.json({ success: true, message: 'Index deleted successfully' });
  } catch (error) {
    console.error('Delete index error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload Video (Create Task)
app.post('/api/tasks', upload.single('video_file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  // Debug logging
  console.log('Upload request body:', req.body);
  console.log('Upload request file:', req.file);

  if (!req.body.index_id) {
    return res.status(400).json({ error: 'index_id parameter is required' });
  }

  if (!req.body.apiKey) {
    return res.status(400).json({ error: 'apiKey parameter is required' });
  }

  try {
    const formData = new FormData();
    formData.append('index_id', req.body.index_id);
    formData.append('video_file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'x-api-key': req.body.apiKey,
        ...formData.getHeaders()
      },
      body: formData
    });

    const data = await response.json();
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || data.error || 'Failed to upload video' 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Check Task Status
app.get('/api/tasks/:taskId', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${req.params.taskId}`, {
      headers: {
        'x-api-key': req.query.apiKey
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || data.error || 'Failed to get task status' 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Task status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search Videos - FIXED VERSION with correct parameters
app.post('/api/search', express.json(), async (req, res) => {
  try {
    console.log('🔍 BACKEND: Search request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { apiKey, index_id, query, options } = req.body;

    console.log('Extracted values:');
    console.log('- API Key:', apiKey ? '✅ Present' : '❌ Missing');
    console.log('- Index ID:', index_id);
    console.log('- Query:', query);
    console.log('- Options:', options);

    // Create FormData for Twelve Labs API
    const formData = new FormData();
    formData.append('index_id', index_id);
    formData.append('query_text', query);
    
    // Try sending search_options as comma-separated string
    const searchOptions = options || ['visual'];
    formData.append('search_options', searchOptions.join(','));
    
    formData.append('group_by', 'video');
    formData.append('threshold', 'low');
    formData.append('sort_option', 'score');
    formData.append('page_limit', '10');
    
    console.log('📤 Sending to Twelve Labs API with FormData');
    console.log('📤 Query text:', query);
    console.log('📤 Search options string:', searchOptions.join(','));

    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        // Don't set Content-Type - FormData sets it automatically with boundary
      },
      body: formData
    });

    console.log('📥 Twelve Labs API response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📥 Twelve Labs API response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ Twelve Labs API error:', data);
      return res.status(response.status).json({ 
        error: data.message || data.error || 'Search failed' 
      });
    }
    
    console.log('✅ Sending successful response to frontend');
    res.json(data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Index Details (optional endpoint)
app.get('/api/indexes/:indexId', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/indexes/${req.params.indexId}`, {
      headers: {
        'x-api-key': req.query.apiKey
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || data.error || 'Failed to get index' 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Get index error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List Videos in Index (optional endpoint)
app.get('/api/indexes/:indexId/videos', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/indexes/${req.params.indexId}/videos?page_limit=50`, {
      headers: {
        'x-api-key': req.query.apiKey
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || data.error || 'Failed to list videos' 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Twelve Labs proxy server is running' });
});

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Twelve Labs Backend Server Running on port ${PORT}        ║
╠═══════════════════════════════════════════════════════════╣
║   Endpoints:                                              ║
║   - POST   /api/indexes          (Create index)          ║
║   - POST   /api/tasks            (Upload video)          ║
║   - GET    /api/tasks/:taskId    (Check task status)     ║
║   - POST   /api/search           (Search videos)         ║
║   - GET    /health               (Health check)          ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
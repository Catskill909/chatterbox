import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  IconButton
} from '@mui/material'
import { PlayArrow, Download, VolumeUp } from '@mui/icons-material'
import axios from 'axios'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64748b',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
})

function App() {
  const [feedUrl, setFeedUrl] = useState('https://blog.resemble.ai/feed/')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [languages, setLanguages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [generating, setGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [exaggeration, setExaggeration] = useState(0.5)
  const [cfgWeight, setCfgWeight] = useState(0.5)

  const fetchFeed = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`/api/feed?url=${encodeURIComponent(feedUrl)}`)
      setPosts(response.data.posts || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch feed')
    }
    setLoading(false)
  }

  const fetchLanguages = async () => {
    try {
      const response = await axios.get('/api/languages')
      setLanguages(response.data.languages || [])
    } catch (err) {
      console.error('Failed to fetch languages:', err)
    }
  }

  const generateAudio = async () => {
    if (!selectedPost) return
    
    setGenerating(true)
    setError('')
    setAudioUrl(null)
    
    try {
      const response = await axios.post('/api/generate', {
        text: selectedPost.content,
        language: selectedLanguage,
        exaggeration: exaggeration,
        cfg_weight: cfgWeight
      })
      
      if (response.data.success) {
        setAudioUrl(response.data.audio_url)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate audio')
    }
    setGenerating(false)
  }

  useEffect(() => {
    fetchFeed()
    fetchLanguages()
  }, [])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Chatterbox TTS Demo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Convert blog posts to natural-sounding English audio with Chatterbox Turbo
          </Typography>
        </Box>

        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                label="RSS/Atom Feed URL"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                variant="outlined"
                size="medium"
              />
              <Button
                variant="contained"
                onClick={fetchFeed}
                disabled={loading}
                sx={{ 
                  minWidth: 120,
                  height: 56,
                  bgcolor: '#64748b',
                  '&:hover': {
                    bgcolor: '#475569'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Load Feed'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {posts.length > 0 && (
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Posts ({posts.length})
          </Typography>
        )}

        <Box sx={{ display: 'grid', gap: 2 }}>
          {posts.map((post, idx) => (
            <Card
              key={idx}
              sx={{
                bgcolor: 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: selectedPost?.id === post.id ? '2px solid #64748b' : '2px solid transparent',
                '&:hover': {
                  bgcolor: '#2a2a2a',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }
              }}
              onClick={() => setSelectedPost(post)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {post.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {post.published}
                  </Typography>
                  {post.author && post.author !== 'Unknown' && (
                    <>
                      <Typography variant="caption" color="text.secondary">•</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.author}
                      </Typography>
                    </>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {post.excerpt}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {selectedPost && (
          <Card 
            sx={{ 
              mt: 3, 
              bgcolor: '#2a2a2a', 
              border: '2px solid #64748b',
              boxShadow: '0 8px 24px rgba(100,116,139,0.2)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                {selectedPost.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, color: '#e0e0e0' }}>
                {selectedPost.content}
              </Typography>

              {/* TTS Controls */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#1e1e1e', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  <VolumeUp sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Voice Settings (Chatterbox Turbo - English)
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Expressiveness: {exaggeration.toFixed(1)}
                    </Typography>
                    <Slider
                      value={exaggeration}
                      onChange={(e, val) => setExaggeration(val)}
                      min={0}
                      max={1}
                      step={0.1}
                      size="small"
                      sx={{ color: '#64748b' }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Higher = more dramatic
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Pacing: {cfgWeight.toFixed(1)}
                    </Typography>
                    <Slider
                      value={cfgWeight}
                      onChange={(e, val) => setCfgWeight(val)}
                      min={0}
                      max={1}
                      step={0.1}
                      size="small"
                      sx={{ color: '#64748b' }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Lower = slower, more deliberate
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Generate Button */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={generateAudio}
                  disabled={generating}
                  startIcon={generating ? <CircularProgress size={20} /> : <PlayArrow />}
                  sx={{
                    bgcolor: '#64748b',
                    '&:hover': {
                      bgcolor: '#475569'
                    }
                  }}
                >
                  {generating ? 'Generating...' : 'Generate Audio'}
                </Button>
                {audioUrl && (
                  <Chip 
                    label="Ready to play" 
                    color="success"
                    sx={{ bgcolor: '#10b981', color: 'white' }}
                  />
                )}
              </Box>

              {/* Audio Player */}
              {audioUrl && (
                <Box sx={{ p: 2, bgcolor: '#1e1e1e', borderRadius: 1 }}>
                  <audio 
                    controls 
                    src={audioUrl}
                    style={{ width: '100%', marginBottom: '8px' }}
                  />
                  <Button
                    size="small"
                    startIcon={<Download />}
                    href={`${audioUrl}?download=true`}
                    sx={{ color: '#64748b' }}
                  >
                    Download Audio
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && posts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Enter a feed URL above to get started
            </Typography>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App

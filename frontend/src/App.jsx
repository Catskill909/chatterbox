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
  Chip
} from '@mui/material'
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

  useEffect(() => {
    fetchFeed()
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
            Convert blog posts to natural-sounding audio with AI
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
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{
                    bgcolor: '#64748b',
                    '&:hover': {
                      bgcolor: '#475569'
                    }
                  }}
                >
                  Generate Audio
                </Button>
                <Chip 
                  label="Chatterbox TTS integration coming next" 
                  sx={{ bgcolor: '#1e1e1e', color: '#b0b0b0' }}
                />
              </Box>
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

'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I am your personal AI assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        console.error('Response status:', response.status)
        const errorText = await response.text()
        console.error('Response text:', errorText)
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error occurred:', error)
      setMessages((messages) => [
        ...messages,
        {
          role: 'assistant',
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ])
    }
    setIsLoading(false)
  }
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundImage: 'url(/personalai.jpg)', // Background image path from public folder
        backgroundSize: 'cover', // Make sure the image covers the entire background
        backgroundPosition: 'center', // Center the image
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
      }}
      p={3}
    >
      <Box
        width="100%"
        maxWidth="600px"
        display="flex"
        justifyContent="flex-start"
        mb={2} // Margin at the bottom to separate from chat box
      >
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff', // White text color
            fontWeight: 'bold',
            fontFamily: 'Roboto, sans-serif', // Modern font
            textShadow: '2px 2px 8px rgba(0, 191, 255, 0.3)', // Subtle shadow for a glowing effect
          }}
        >
          Personal Assistant
        </Typography>
      </Box>

      <Stack
        direction={'column'}
        width="100%"
        maxWidth="600px"
        height="700px"
        border="2px solid #00bfff" // Bright blue border
        borderRadius="12px" // Rounded corners
        p={2}
        spacing={3}
        bgcolor="#ffffff" // White background for the chat box
        boxShadow="0px 4px 20px rgba(0, 191, 255, 0.3)" // Light shadow for a soft, futuristic look
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          sx={{
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#00bfff', // Scrollbar color matching the theme
              borderRadius: '8px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#00bfff' // Bright blue for AI responses
                    : '#4caf50' // Green for user messages
                }
                color="white"
                borderRadius={16}
                p={3}
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)" // Subtle shadow for message bubbles
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#00bfff', // Input border color
                },
                '&:hover fieldset': {
                  borderColor: '#00a3cc', // Hover border color
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00bfff', // Focused border color
                },
              },
            }}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage} 
            disabled={isLoading}
            sx={{
              backgroundColor: '#00bfff', // Button color
              '&:hover': {
                backgroundColor: '#00a3cc', // Hover color
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

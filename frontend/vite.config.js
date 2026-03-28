import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read backend .env file manually
const backendEnvPath = path.resolve(__dirname, '../backend/.env')
const envContent = fs.readFileSync(backendEnvPath, 'utf-8')

// Parse env variables manually
const envVars = {}
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    if (key) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled'
    ]
  },
  define: {
    'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(envVars.RAZORPAY_KEY_ID),
    'import.meta.env.VITE_UPI_ID': JSON.stringify(envVars.UPI_ID),
  }
})
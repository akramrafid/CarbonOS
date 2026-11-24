import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// [COMMENTED OUT FOR PERSONAL REFERENCE — switched domAnimation -> domMax + strict so layoutId in DashboardSidebar works under LazyMotion]
// import { MotionConfig, LazyMotion, domAnimation } from 'framer-motion'
import { MotionConfig, LazyMotion, domMax } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './styles/tokens.css'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <LazyMotion strict features={domMax}>
            <ThemeProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </ThemeProvider>
          </LazyMotion>
        </MotionConfig>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)

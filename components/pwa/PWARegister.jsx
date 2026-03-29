'use client'

import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration.scope)
          })
          .catch((error) => {
            console.log('SW registration failed:', error)
          })
      })
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.addEventListener('message', (event) => {
        if (event.data?.type === 'SHOW_NOTIFICATION') {
          const { title, options } = event.data
          navigator.serviceWorker.registration.showNotification(title, options)
        }
      })
    }
  }, [])

  return null
}

export async function showAppNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      options,
    })
  }
}

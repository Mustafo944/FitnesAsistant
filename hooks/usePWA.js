'use client'

import { useEffect } from 'react'

export function usePWA() {
  // Service worker registration is handled by PWARegister component
  // This hook is kept for potential future PWA-related functionality
  useEffect(() => {
    // Placeholder for future PWA functionality
  }, [])
}

export function PWAInstallPrompt() {
  useEffect(() => {
    let deferredPrompt
    let installed = false

    const handleAppInstalled = () => {
      installed = true
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    const handleBeforeInstallPrompt = (e) => {
      if (installed) return
      e.preventDefault()
      deferredPrompt = e
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  return null
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export async function showNotification(title, options = {}) {
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      options,
    })
  }
}

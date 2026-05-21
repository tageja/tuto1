'use client'

// This file exists solely as a dynamic-import boundary so that react-joyride
// (which uses removed React 18 APIs) is never included in the server bundle.
// learn/layout.tsx imports this file via next/dynamic with ssr:false.
export { default } from './TourProvider'

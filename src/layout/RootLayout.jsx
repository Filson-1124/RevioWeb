import React from 'react'
import NavBar from '../components/NavBar'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { AudioProvider } from '../components/AudioContext'
import MusicPlayer from '../components/MusicPlayer'

const RootLayout = () => {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return <Navigate to="/" />

  return (
    <AudioProvider>
      <div className="relative flex flex-col md:flex-row h-screen bg-[#12121A] overflow-x-hidden">
        <NavBar />

        <div
          className="flex-1 overflow-y-auto pb-[10%] md:pb-0  relative z-0"
        >
          <Outlet />
        </div>

        {/* Player overlay wrapper — entire screen, but pointer-events-none so it won't block clicks,
            then pointer-events-auto on the inner container lets the MusicPlayer receive events. */}
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          <div className="pointer-events-auto">
            <MusicPlayer />
          </div>
        </div>
      </div>
    </AudioProvider>
  )
}

export default RootLayout

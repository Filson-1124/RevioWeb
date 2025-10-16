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
      {/* Fill viewport and prevent outer scrolling */}
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#12121A] relative">
        {/* NavBar: stay in-flow and non-scrollable (use flex-shrink-0) */}
        <div className="flex-shrink-0">
          <NavBar />
        </div>

        {/* The only scrollable area: main (Outlet) */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative z-0">
          <Outlet />
        </main>

        {/* Floating music player */}
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

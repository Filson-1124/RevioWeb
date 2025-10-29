import React, { useState } from 'react'
import NavBar from '../components/NavBar'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { AudioProvider } from '../components/AudioContext'
import MusicPlayer from '../components/MusicPlayer'

const RootLayout = () => {
  const [showNav, setShowNav] = useState(true)

  return (
    <AudioProvider>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden md:overflow-auto bg-[#12121A] relative">
        {showNav && (
          <div className="flex-shrink-0">
            <NavBar />
          </div>
        )}
        <main className="flex-1 overflow-y-auto no-scrollbar relative z-0">
          <Outlet context={{ setShowNav }} />
        </main>
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

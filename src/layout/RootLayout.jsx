import React from 'react'
import NavBar from '../components/NavBar'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { AudioProvider } from '../components/AudioContext' // ✅ import AudioProvider
import MusicPlayer from '../components/MusicPlayer'

const RootLayout = () => {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/" />
  } else {
    return (
      <AudioProvider> {/* ✅ Only wrap protected content */}
        <div className='flex h-screen'>
          <NavBar className='fixed top-0 left-0 h-screen w-64 overflow-x-hidden' />
          <div className='flex-1 overflow-y-auto'>
            <Outlet />
          </div>
          <MusicPlayer/>
        </div>
      </AudioProvider>
    )
  }
}

export default RootLayout

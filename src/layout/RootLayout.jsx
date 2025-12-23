import React, { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { Outlet } from 'react-router-dom'

import NavBar from '../components/NavBar'
import { AudioProvider } from '../components/AudioContext'
import MusicPlayer from '../components/MusicPlayer'

const RootLayout = () => {
  const [showNav, setShowNav] = useState(true)

  return (
    <IonPage>
      <AudioProvider>
        {/* Desktop Sidebar / Mobile Bottom Nav */}
        {showNav && (
          <div
            className={`
              fixed z-50
              bottom-0 left-0 w-full h-16
              md:w-28 md:h-full md:top-0 md:left-0
              bg-[#1E1E2E]
              flex md:flex-col
              justify-center md:justify-start
              items-center
            `}
          >
            <NavBar />
          </div>
        )}

        {/* Main Content */}
        <IonContent fullscreen className="relative">
          <div className="pb-16 md:pl-28">
            <Outlet context={{ setShowNav }} />
          </div>
        </IonContent>

        {/* Floating MusicPlayer */}
        <div className="fixed bottom-24 right-4 z-[9999] pointer-events-auto">
          <MusicPlayer />
        </div>

        {/* Example Floating Pomodoro button */}
      
      </AudioProvider>
    </IonPage>
  )
}

export default RootLayout

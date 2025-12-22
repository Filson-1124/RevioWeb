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
        <div className="flex flex-col md:flex-row h-full bg-[#12121A] relative">
          
          {showNav && (
            <div className="flex-shrink-0">
              <NavBar />
            </div>
          )}

          {/* Ionic controls scrolling here */}
          <IonContent fullscreen className="relative">
            <main className="flex-1 relative z-0">
              <Outlet context={{ setShowNav }} />
            </main>
          </IonContent>

          <div className="fixed inset-0 pointer-events-none z-[9999]">
            <div className="pointer-events-auto">
              <MusicPlayer />
            </div>
          </div>

        </div>
      </AudioProvider>
    </IonPage>
  )
}

export default RootLayout

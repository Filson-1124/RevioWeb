import React from 'react'
import { IonContent } from '@ionic/react'
import { Outlet } from 'react-router-dom'
import Library from '../pages/Library'

const LibraryLayout = () => {
  return (
    <div className="flex flex-col h-full">

      <div className="flex-shrink-0">
        <Library />
      </div>

      {/* Ionic-managed scroll area */}
      <IonContent fullscreen className="ion-no-padding">
        <main className="flex-1 no-scrollbar pb-24 md:pb-0">
          <Outlet />
        </main>
      </IonContent>

    </div>
  )
}

export default LibraryLayout

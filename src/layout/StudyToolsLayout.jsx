import React from 'react'
import { Outlet } from 'react-router-dom'
import { IonContent } from '@ionic/react'

const StudyToolsLayout = () => {
  return (
    <IonContent fullscreen className="ion-no-padding">
      <Outlet />
    </IonContent>
  )
}

export default StudyToolsLayout

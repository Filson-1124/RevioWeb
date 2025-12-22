import React from 'react';
import mobileIcon from '../assets/phoneIcon.png'
import { IonText, IonTitle, IonButton } from '@ionic/react';
// import qr from '../assets/QRNEW.png'

const Download = () => {
  return (
    <div className="bg-[#12121a] min-h-screen flex gap-10 items-center justify-center p-4">
      <div className="bg-[#20202C] rounded-xl shadow-lg p-6 max-w-sm text-center ">
        
      
       
          <img src={mobileIcon} alt="" />
       
        <IonTitle>
          <h1 className="text-white text-2xl font-bold mb-4">Get the Revio App!</h1>
        </IonTitle>

        <IonText>
          <p className="text-white mb-6">
            Enjoy a smoother, faster, and more engaging experience. Download our mobile app today!
          </p>
        </IonText>

        {/*popopop booom booom*/}
        <div className="flex flex-col gap-3">
        <IonButton
          onClick={() => window.open('https://expo.dev/artifacts/eas/bi6ADTfJDkiL4wth43Ru7W.apk', '_blank')}
          // className=" cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          color="primary"
          expand="block"
        >
          <IonText>Download Revio Mobile</IonText>
      </IonButton>
        </div>
     
      </div>
    

    </div>
  );
}

export default Download;

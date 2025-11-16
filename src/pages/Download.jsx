import React from 'react';
import mobileIcon from '../assets/phoneIcon.png'
import qr from '../assets/QRNEW.png'

const Download = () => {
  return (
    <div className="bg-[#12121a] min-h-screen flex gap-10 items-center justify-center p-4">
      <div className="bg-[#20202C] rounded-xl shadow-lg p-6 max-w-sm text-center ">
        
        {/* Icon Placeholder */}
       
          <img src={mobileIcon} alt="" />
       

        {/* Title */}
        <h1 className="text-white text-2xl font-bold mb-4">Get the Revio App!</h1>

        {/* Encouraging Message */}
        <p className="text-white mb-6">
          Enjoy a smoother, faster, and more engaging experience. Download our mobile app today!
        </p>

        {/* Download Buttons */}
        {/*popopop booom booom*/}
        <div className="flex flex-col gap-3">
            <button
          onClick={() => window.open('https://expo.dev/artifacts/eas/i1arLoPUUo5XLzjdEteddN.apk', '_blank')}
          className=" cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        > 
  Download Revio Mobile
</button>
        </div>
     
      </div>
    

    </div>
  );
}

export default Download;

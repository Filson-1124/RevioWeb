import React from 'react';
import mobileIcon from '../assets/phoneIcon.png'
import qr from '../assets/qr.png'

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
          onClick={() => window.open('https://expo.dev/accounts/mari_dev1/projects/Revio-Mobile/builds/c07ea047-ce47-43fe-8d62-1a42f5691a5e', '_blank')}
          className=" cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        > 
  Download Revio Mobile
</button>
        </div>
     
      </div>
       <h1 className='hidden md:block text-white text-2xl font-bold mb-4'>Or</h1>
       <div className="bg-[#20202C] rounded-xl shadow-lg p-6 max-w-sm text-center hidden md:block ">
        
        {/* Icon Placeholder */}
       
          <img src={qr} alt="" className='border-3 border-[#7d69bb] rounded-xl' />
       

        {/* Title */}
        <h1 className="text-white text-2xl font-bold mb-4">Scan the QR code!</h1>

        {/* Encouraging Message */}
       
       

      </div>

    </div>
  );
}

export default Download;

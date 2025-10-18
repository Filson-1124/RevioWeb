import React from 'react';
import mobileIcon from '../assets/phoneIcon.png'

const Download = () => {
  return (
    <div className="bg-[#12121a] min-h-screen flex items-center justify-center p-4">
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
        <div className="flex flex-col gap-3">
            <button
          onClick={() => window.open('https://expo.dev/accounts/mari_dev1/projects/Revio-Mobile/builds/d323445d-4493-465e-aa73-24213365b238?fbclid=IwY2xjawNgYe1leHRuA2FlbQIxMQABHn9175SgJ6g1e1GBJ0R5YBBIPYTi9HGaN03SBPi7-sEfaClXQBBNsgvGow23_aem_SgMzXfzaeVITEUAt4rXmCw', '_blank')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        > 
  Download Revio Mobile
</button>
        </div>

      </div>
    </div>
  );
}

export default Download;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import 'react-toastify/dist/ReactToastify.css';
import createLoadingScreen from '../assets/creationLoadingScreen.png';
import LoadingBar from '../components/LoadingBar'; // your existing loading bar component
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRegister } from '../functions/useRegister';

const Register = () => {
 const {state, actions}=useRegister();
 const {username,email,iniPassword,rePassword,showPass,isUpCase,isNumber,isLength,isDisabled,isSubmitDisabled,isCreating,isDone,fadeOut}=state;
 const {setUsername,setEmail,setIniPassword,setRePassword,setShowpass,handleSubmit}=actions;

  // Show loading screen while creating account
  if (isCreating) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center text-center p-4 transition-opacity duration-700 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        } bg-[#12121A]`}
      >
        <img src={createLoadingScreen} alt="Creating Account..." className="w-40 sm:w-40 md:w-80 mb-6" />
        <p className="text-[#9898D9] font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
          {isDone ? "Account Created — Sending Verification..." : "Creating your account, please wait..."}
        </p>
        <LoadingBar isDone={isDone} />
        <p className="text-[10px] text-[#808080] p-2 w-full md:w-[50%] mt-2 rounded-2xl">
          <b>Note:</b> This process may take a few seconds depending on your internet speed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-10 flex place-content-center bg-[#12121A] ">
        <div className="bg-[#1C1C26] w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-8 md:p-10 border border-[#5C5B5B] rounded-2xl shadow-lg lg:overflow-auto h-[80vh]">
          <h1 className="text-[#FFFBEF] text-2xl sm:text-3xl md:text-4xl font-poppins font-semibold mb-6 text-center md:text-left place-self-center">
            Create Account
          </h1>

          <form className="flex flex-col text-[#FFFBEF] gap-3 sm:gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your Username"
                className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C] text-sm sm:text-base"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your Email"
                className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C] text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  value={iniPassword}
                  onChange={(e) => setIniPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#9E9E9E] p-2 pr-10 text-white placeholder:text-[#9E9E9E] bg-transparent text-sm sm:text-base"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  {showPass ? (
                    <IoEyeSharp color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(false)} />
                  ) : (
                    <FaEyeSlash color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(true)} />
                  )}
                </div>
              </div>

              <ul className="text-[10px] sm:text-xs font-light font-poppins list-disc pl-5 mt-1">
                <li className={isUpCase ? 'text-green-500' : 'text-[#7E7C7C]'}>At least 1 uppercase</li>
                <li className={isNumber ? 'text-green-500' : 'text-[#7E7C7C]'}>At least 1 number</li>
                <li className={isLength ? 'text-green-500' : 'text-[#7E7C7C]'}>At least 8 characters</li>
              </ul>
            </div>

            <div className="flex flex-col">
              <label htmlFor="reEnterPassword">Re-enter password</label>
              <input
                disabled={isDisabled}
                type={showPass ? 'text' : 'password'}
                id="reEnterPassword"
                placeholder="Re-enter your Password"
                className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C] disabled:cursor-not-allowed text-sm sm:text-base"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
            </div>

            <button
              disabled={isSubmitDisabled}
              className="bg-[#B5B5FF] text-[#200448] font-poppinsbold p-2 rounded-2xl border border-[#200448]
                w-[70%] sm:w-[60%] self-center mt-4
                active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448]
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100"
              type="submit"
            >
              Sign up
            </button>
          </form>

          <h4 className="text-[#7E7C7C] text-center mt-4 text-sm sm:text-base">
            Already have an account?{' '}
            <Link to="/">
              <span className="text-blue-600 underline cursor-pointer">Login</span>
            </Link>
          </h4>
        </div>
      </div>

   
    </>
  );
};

export default Register;

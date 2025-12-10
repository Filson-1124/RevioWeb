import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import 'react-toastify/dist/ReactToastify.css';
import createLoadingScreen from '../assets/creationLoadingScreen.png';
import LoadingBar from '../components/LoadingBar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRegister } from '../functions/useRegister';

const Register = () => {
  const {state, actions}=useRegister();
  const {
    username, email, iniPassword, rePassword,
    showPass, isUpCase, isNumber, isLength,
    isDisabled, isSubmitDisabled, isCreating,
    isDone, fadeOut, isEmailVerified
  } = state;

  const {
    setUsername, setEmail, setIniPassword,
    setRePassword, setShowpass, handleSubmit,
    doesEmailExist
  } = actions;

  if (isCreating) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center text-center p-4 transition-opacity duration-700 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        } bg-[#12121A]`}
      >
        <img src={createLoadingScreen} alt="Creating Account..." className="w-40 sm:w-40 md:w-80 mb-6" />
        <p className="text-[#9898D9] font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
          {isDone ? "Account Created — Finalizing..." : "Please wait..."}
        </p>
        <LoadingBar isDone={isDone} />
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
            
            {/* Username */}
            <div className="flex flex-col">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your Username"
                className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Email + Verify button */}
            <div className="flex flex-col">
              <label>Email</label>
              <div className='flex gap-2 w-full'>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C] w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type='button'
                  className='border border-amber-300 px-5 rounded-xl'
                  onClick={() => doesEmailExist()}
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Password fields (appear after verification) */}
            <div className={`flex flex-col transition-opacity duration-300 ${
              isEmailVerified ? "opacity-100" : "opacity-40"
            }`}>
              <label>Password</label>

              <div className="relative w-full">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={iniPassword}
                  onChange={(e) => setIniPassword(e.target.value)}
                  disabled={!isEmailVerified}
                  className="w-full rounded-lg border disabled:cursor-not-allowed border-[#9E9E9E] p-2 pr-10 bg-transparent"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  {showPass ? (
                    <IoEyeSharp color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(false)} />
                  ) : (
                    <FaEyeSlash color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(true)} />
                  )}
                </div>
              </div>

              <ul className="text-[10px] list-disc pl-5 mt-1">
                <li className={isUpCase ? 'text-green-500' : 'text-[#7E7C7C]'}>At least 1 uppercase</li>
                <li className={isNumber ? 'text-green-500' : 'text-[#7E7C7C]'}>At least 1 number</li>
                <li className={isLength ? 'text-green-500' : 'text-[#7E7C7C]'}>At least 8 characters</li>
              </ul>
            </div>

            <div className={`flex flex-col transition-opacity duration-300 ${
              isEmailVerified ? "opacity-100" : "opacity-40"
            }`}>
              <label>Re-enter password</label>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Re-enter your Password"
                className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C]"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                disabled={!isEmailVerified}
              />
            </div>

            {/* Submit */}
            <button
              disabled={isSubmitDisabled}
              className="bg-[#B5B5FF] text-[#200448] font-poppinsbold p-2 rounded-2xl mt-4 disabled:bg-gray-400"
              type="submit"
            >
              Sign up
            </button>
          </form>

          <h4 className="text-[#7E7C7C] text-center mt-4">
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

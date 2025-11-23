import React, { useState, useEffect } from 'react'
import createLoadingScreen from '../assets/creationLoadingScreen.png'
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom'
import { CiCirclePlus } from "react-icons/ci"
import { IoClose } from "react-icons/io5"
import { useAuth } from '../components/AuthContext'
import { LuArrowLeft } from "react-icons/lu"
import LoadingBar from './LoadingBar'
import { useCreate } from '../functions/useCreate'
import errorPic from '../assets/RevioEmptyClear.png'



const CreateReviewer = () => {
const {state, actions}=useCreate()
const {  title,
    subTitle,
    createTitle,
    createSubTitle,
    info,
    selectedFile,
    fileUrl,
    isCreating,
    isDone,
    fadeOut,
    isError,
    errorMess
   }=state

  const { 
    handleCreateReviewer,
    handleFileChange,
    handleRemoveFile,setIsError}=actions

    const navigate=useNavigate();

if (isCreating) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-center items-center text-center pb-[40%] md:pb-0 p-4 transition-opacity duration-700 bg-[#12121A] bg-opacity-95 pointer-events-auto ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src={createLoadingScreen}
        alt="creationLoadingScreen"
        className="w-40 sm:w-40 md:w-80 mb-6"
      />
      <p className="text-white font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
        {isDone ? 'Reviewer Created — Preparing Display...' : createTitle}
      </p>
      <p className="w-full sm:w-40 md:w-80 text-[#ffffff3b] font-poppinsbold text-sm sm:text-base md:text-sm mb-4">
        {isDone ? '' : createSubTitle}
      </p>
      <LoadingBar isDone={isDone} />
      <p className="text-[10px] text-[#808080] p-2 w-full md:w-[50%] mt-2 rounded-2xl">
        <b>Disclaimer: </b>
        This feature uses AI to generate educational content from your materials.
        While designed for accuracy, please review and verify the results before academic use.
      </p>
    </div>
  );
}

if(isError){
  return(
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-[#1E1E2E] rounded-2xl p-6 text-center w-[70%]  sm:w-[400px] border border-[#B5B5FF] shadow-2xl">
      <img src={errorPic} alt="" />
      <h2 className="text-white text-lg font-bold mb-3">
        Oopss, there seems to be an error.
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        {errorMess}
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setIsError(false)
           }}
          className=" cursor-pointer px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold active:scale-95"
        >
          Okay
        </button>
        
      </div>
    </div>
  </div>

      );
}


  return (
    <div className="flex flex-col text-white w-full items-center h-screen px-4 pb-[45%] md:pb-0 sm:px-8 md:px-[5%] py-10 relative">
      <div className="w-full flex justify-between items-center absolute top-6 left-0 px-5">
        <button
          onClick={() => navigate(`/Main/Create`)}
          className="transition-all duration-100 active:scale-95 cursor-pointer flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base"
        >
          <LuArrowLeft size={18} className="md:size-5" />
          Back
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full gap-10">
        <div className="w-full sm:w-[90%] md:w-[80%] text-start">
          {title ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
              {subTitle && (
                <h2 className="text-lg sm:text-xl font-semibold text-violet-300 mb-2">
                  {subTitle}
                </h2>
              )}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {info}
              </p>
            </>
          ) : (
            <p className="text-red-500">No reviewer type selected.</p>
          )}
        </div>

        <div className="bg-[#2E2E40] flex flex-col items-center text-center p-6 sm:p-10 rounded-xl gap-4 w-full sm:w-[80%] md:w-[60%]">
          <input
            id="fileUpload"
            type="file"
            className="hidden"
            accept=".docx,.pdf,.pptx"
            onChange={handleFileChange}
          />
          <label
            htmlFor="fileUpload"
            className={`inline-flex w-[12rem] sm:w-[14rem] md:w-[15rem] h-[4rem] sm:h-[5rem] items-center justify-center gap-2 px-6 py-3 ${
              selectedFile
                ? "bg-gray-500 cursor-not-allowed opacity-60"
                : "bg-[#B5B5FF] hover:bg-violet-700 cursor-pointer"
            } text-[#200448] rounded-xl font-poppinsbold shadow-md transition-all duration-200 active:scale-95`}
          >
            <CiCirclePlus size={30} className="sm:size-[35px]" />
            <span className="text-sm sm:text-base">
              {selectedFile ? "File Uploaded" : "Upload File"}
            </span>
          </label>

          <p className="text-[#ffffff46] text-xs sm:text-sm text-center">
            Please upload a file with .docx, .pdf, or .pptx
          </p>

          {selectedFile && (
            <div className="text-center mt-4 space-y-3 w-full">
              <p className="text-white text-sm sm:text-base font-medium break-words">
                {selectedFile.name}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer px-4 py-2 text-sm sm:text-base bg-violet-500 hover:bg-violet-600 rounded-md text-white font-semibold transition-all"
                >
                  View File
                </a>
                <button
                  onClick={handleRemoveFile}
                  className="cursor-pointer px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-600 rounded-md text-white font-semibold flex items-center gap-1 transition-all justify-center"
                >
                  <IoClose size={18} /> Remove File
                </button>
              </div>

              <button
                className="cursor-pointer mt-4 px-6 py-2 text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold transition-all"
                onClick={handleCreateReviewer}
              >
                Create Reviewer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateReviewer

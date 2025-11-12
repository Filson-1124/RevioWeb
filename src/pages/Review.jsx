// Imports
//ipush
import React, { useState, useEffect } from 'react'
import Lottie from "lottie-react";
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { LuArrowLeft } from "react-icons/lu"
import { IoArrowRedoSharp, IoArrowUndo, IoGameController } from "react-icons/io5"
import { IoMdStarOutline } from "react-icons/io";
import { FaRegLightbulb } from "react-icons/fa";
import { FaEdit } from "react-icons/fa"
import { FaTrashAlt } from "react-icons/fa";
import deletingScreen from '../assets/deletingScreen.png'
import LoadingBar from '../components/LoadingBar';
import calendarAnimation from '../assets/animation/Calendar Success Add.json'
import {motion} from 'motion/react'


import { FaMapPin } from "react-icons/fa";
import { CiMapPin } from "react-icons/ci";
import { TbPinned } from "react-icons/tb";
import { TbPinnedFilled } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useReview } from '../functions/useReview';

const Review = () => {
  const { state, actions } = useReview();
const {   reviewer,
    id,
    reviewerId,
    flipped,
    message,
    isDeleting,
    deleting,
    fadeOut,
    isDone,
    isDeletingSum,
    isFlashcard,
    isAcronymCard,
    isMarked,
    displayMarked,
    current,
    correctChoice,
    currentAcronym,
    currentTitle,activeCards,currentIndex,currentGroupIndex,settingDate,dateSet,calendarAnimationDisplay,containerVariants,contentVariants } = state;
const {
    setIsDeleting,
    setIsDeletingSum,
    setDisplayMarked,
    handleFlip,
    handleNext,
    handlePrev,
    handleMark,
    handleDelete,
    handleSetStartDate,setSettingDate,setDateSet,setCalendarAnimationDisplay} = actions;

const navigate=useNavigate();



 
   if (deleting) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center text-center pb-[40%] md:pb-0 p-4 transition-opacity duration-700 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img src={deletingScreen} alt="creationLoadingScreen" className="w-40 sm:w-40 md:w-80 mb-6" />
        <p className="text-white font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
          {isDone ? "Reviewer Deleted" :"Deleting Reviewer, please wait"}
        
        </p>
     
        <LoadingBar isDone={isDone} />
      </div>
    )
  }

  return (

    
    
    <div className='flex flex-col items-center justify-start min-h-full bg-[#121212] pt-6 pb-[45%] md:pb-10 px-4 gap-7 md:px-10 lg:pb-40'>
       {settingDate && 
            (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#1E1E2E] rounded-2xl p-6 text-center w-[70%]  sm:w-[400px] border border-[#B5B5FF] shadow-2xl">
          
            <h2 className="text-white text-lg font-bold mb-3">
           Do you want to set the starting date of the interval to today's date?
            </h2>
         
            <div className="flex justify-center gap-4">
              <button className='cursor-pointer px-4 py-2 rounded-xl bg-gray-600 hover:scale-105 hover:bg-red-600  text-white font-semibold active:scale-95' onClick={()=>setSettingDate(false)}>
                No
              </button>
              <button
                onClick={() => {handleSetStartDate(id, reviewerId); setSettingDate(false); setDateSet(true);setCalendarAnimationDisplay(true) }}
                className=" cursor-pointer px-4 py-2 rounded-xl bg-[#23e55d] hover:scale-105 text-white font-semibold active:scale-95"
              >
                Yes
              </button>
              
              
            </div>
          </div>
        </div>
      
            )}

    {dateSet && ( 
  <div  
    className={`fixed inset-0 flex justify-center items-center bg-[#000000c9] z-[9999]
     transition-all duration-500 ease-in-out transform
${calendarAnimationDisplay ? 'opacity-100 scale-100 visible' : 'opacity-0 invisible'}
`}
  >
    <Lottie
      animationData={calendarAnimation}
      loop={false}
      style={{ width: 300, height: 300 }}
      onComplete={() => setCalendarAnimationDisplay(false)} // Trigger fade-out when animation ends
    />
  </div>
)}


      <div className="w-full flex justify-between items-center relative mb-6">
        <button
          onClick={() => navigate(`/Main/Library/${id}`)}
          className="cursor-pointer absolute left-0 top-2 md:left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base transition-all duration-100 active:scale-95"
        >
          <LuArrowLeft size={18} className='md:size-5' />
          Back
        </button>
         <button
          onClick={() => setDisplayMarked(!displayMarked)}
          className={`${isFlashcard?"block":"hidden "}cursor-pointer absolute top-0.5  md:top-2 right-0 flex items-center gap-2 text-white p-2 md:p-3 rounded-xl text-sm md:text-base`}
        >
        
          {displayMarked?<TbPinnedFilled size={40}/>:<TbPinned size={40}/>}

        </button>
        <button
  onClick={() => setSettingDate(true)}
  className={`${isFlashcard?"flex":"hidden"} transition-all duration-100 active:scale-95  cursor-pointer absolute  top-3 right-12  md:right-15 items-center gap-2 
text-white bg-transparent border border-[#B5B5FF] hover:bg-[#51516B] p-2 sm:p-2.5 md:p-3 rounded-xl text-xs sm:text-sm md:text-base`}
>
  <FaRegCalendarAlt color='#B5B5FF'/>
  Set Start Date
</button>
      </div>

     
      
      

      {isFlashcard && (
  <>

    {isAcronymCard ? 
      <div className="flex flex-col justify-center md:justify-between items-center gap-5 pt-10">
        <h1 className="text-white text-2xl md:text-3xl font-bold">
          {reviewer.title}
        </h1>
      </div>
      : 
      <div className="flex flex-col md:justify-between items-center gap-5 place-self-center pt-10">
        <h1 className="text-white text-2xl md:text-3xl font-bold">
          {reviewer.title}
        </h1>
      </div>
    }

    {/* Flashcard Section */}
    <div className="relative w-[90vw] sm:w-[35rem] md:w-[38rem] lg:w-[50rem] xl:w-[35rem] h-[18rem] sm:h-[35rem] md:h-[25rem] lg:h-[23rem] xl:h-[25rem] perspective transition-all duration-500">
      <div
        className={`transition-transform duration-500 [transform-style:preserve-3d] w-full h-full ${flipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        {/* FRONT SIDE */}
        <div  
          className={`absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer ${isAcronymCard ? 'bg-[#2E2E40]' : 'bg-[#8267B1]'} transition-all duration-200ms`}
        >
          <button 
            className='absolute top-3 right-3 text-white text-md cursor-pointer bg-[#6A558D] rounded-full p-4 hover:scale-105 transition-all duration-75 active:scale-90'  
            onClick={(e)=>{e.stopPropagation(); handleMark(current.id);}}
          >
            {displayMarked || isMarked ? <FaMapPin  /> : <CiMapPin  />}
          </button>

          {isAcronymCard ? (
            <>  
              <h1 className={` text-white text-md md:text-2xl font-bold mt-10 md:mt-6 text-center ${flipped ? "opacity-0 md:opacity-100" : ""} transition-all duration-[200ms]`}> 
                {currentTitle}
              </h1>  
              <p className="text-sm text-gray-300 italic place-self-center mb-3">
                Click to flip to reveal the key phrase
              </p>
            </> 
          ) : ""} 
          
          {isAcronymCard ? (
            <div className={`scroll-container bg-[#5C5C76] p-3 md:px-6 rounded-lg shadow-inner w-full h-full overflow-y-auto flex ${flipped ? "opacity-0 md:opacity-100" : ""} transition-all duration-[200ms]`}>
              <div className="m-auto text-center text-lg md:text-lg font-extrabold tracking-widest leading-loose font-poppinsbold">
                {currentAcronym?.contents?.map((item, index) => (
                  <p key={index} className="first-letter:text-[#E4FF35] text-white">
                    {item?.word ?? ''}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* FIXED WRAPPING HERE */}
              <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white place-self-center break-words text-center max-w-[90%]">
                {current?.term ?? 'No term available'}
              </p>

              <p className="absolute bottom-2 text-sm text-gray-300 mb-3 italic place-self-center justify-self-end opacity-[0.7]">
                Click to flip to reveal the definition
              </p>
            </>
          )}
        </div>

        {/* BACK SIDE */}
        <div  
          className={`absolute w-full h-full [backface-visibility:hidden] rotate-y-180 rounded-2xl shadow-lg flex flex-col items-center justify-center p-4 md:p-4 text-center cursor-pointer ${isAcronymCard ? 'bg-[#5C5C76]' : 'bg-[#FFF8AA]'}`}
        >
          <div className="scroll-container text-white w-full h-full overflow-y-auto flex flex-col items-center justify-center text-center">
            {isAcronymCard ? <h1 className='text-white text-2xl md:text-3xl font-bold mt-6 mb-6 text-center'> Key Phrases</h1> : ""}
            {isAcronymCard ? (
              <div className="bg-[#2E2E40] p-2 h-[80%] min-w-[100%] rounded-2xl text-lg md:text-2xl font-semibold flex items-center justify-center text-center">
                <p className="text-white">
                  <b>{currentAcronym?.keyPhrase ?? ''}</b>
                </p>
              </div>
            ) : (
              <>  
                <p className="text-sm sm:text-2xl md:text-3xl lg:text-2xl font-semibold text-[#6A558D] text-center">
                  {correctChoice?.text ?? 'No definition available'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    <div>
      <p className='text-white'>
        {currentGroupIndex ? currentGroupIndex+1 : currentIndex+1}/{activeCards.length}
      </p> 
    </div>

    <div className="mt-6 flex gap-4">
      <button
        onClick={handlePrev}
        className="hover:scale-105 cursor-pointer flex px-4 py-2 bg-[#B5B5FF] text-white transition w-28 md:w-40 rounded-2xl justify-center items-center active:scale-90"
      >
        <IoArrowUndo color='black' size={25} />
      </button>
      <button
        onClick={handleNext}
        className="hover:scale-105 cursor-pointer flex px-4 py-2 bg-[#B5B5FF] text-white transition w-28 md:w-40 rounded-2xl justify-center items-center active:scale-90"
      >
        <IoArrowRedoSharp color='black' size={25} />
      </button>
    </div>

    {message && <p className="mt-4 text-yellow-300 font-semibold text-sm md:text-base">{message}</p>}

    {!displayMarked && 
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full md:w-auto'>
        <div className="flex flex-col md:flex-row gap-4 mt-8 w-full md:w-auto">
          <motion.button
            variants={contentVariants}
            onClick={() => navigate(`/Main/Library/${id}/${reviewerId}/edit`)}
            className="transition-all duration-100 cursor-pointer flex gap-2 items-center hover:bg-[#B5B5FF] hover:text-white justify-center w-full md:w-48 lg:w-56 px-6 py-3 border border-white text-[#B5B5FF] rounded-xl font-semibold text-sm md:text-base active:scale-95"
          >
            <FaEdit size={18} /> Edit
          </motion.button>

          <motion.button
            variants={contentVariants}
            onClick={() => navigate(`/Main/Library/${id}/${reviewerId}/gamified`)}
            className="transition-all duration-100 cursor-pointer flex gap-2 items-center justify-center w-full md:w-48 lg:w-56 px-6 py-3 border border-[#eb8614] rounded-xl font-semibold text-sm md:text-base active:scale-95 hover:bg-[#eb8614] hover:text-white text-[#eb8614]"
          >
            <IoGameController size={18} />
            <span className="font-bold">Game Mode</span>
          </motion.button>

          <motion.button
            variants={contentVariants}
            onClick={() => setIsDeleting(true)}
            className="transition-all duration-100 cursor-pointer flex gap-2 hover:bg-red-800 hover:text-white items-center justify-center w-full md:w-48 lg:w-56 px-6 py-3 border border-[#E93209] text-red-800 rounded-xl font-semibold text-sm md:text-base active:scale-95"
          >
            <FaTrashAlt size={18} />
            Delete Flashcard Set
          </motion.button>
        </div>
      </motion.div>
    }
  </>
)}


       {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 ">
          <div className="bg-[#1E1E2E] rounded-2xl p-6 text-center w-[90%] sm:w-[400px] border-1  border-[#B5B5FF]">
            <h2 className="text-white text-lg font-bold mb-3">
             Delete Flashcard Set
            </h2>
            <p className="text-gray-400 text-sm mb-6"> Are you sure you want to delete this reviewer? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(reviewerId)}
                className="px-4 py-2 rounded-xl bg-[#E93209] hover:bg-[#C22507] text-white font-semibold active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

        {isDeletingSum && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#1E1E2E] rounded-2xl p-6 text-center w-[90%] sm:w-[400px] border-1  border-[#B5B5FF]">
            <h2 className="text-white text-lg font-bold mb-3">
             Delete Summarized Reviewer
            </h2>
            <p className="text-gray-400 text-sm mb-6"> Are you sure you want to delete this reviewer? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsDeletingSum(false)}
                className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(reviewerId)}
                className="px-4 py-2 rounded-xl bg-[#E93209] hover:bg-[#C22507] text-white font-semibold active:scale-95"
              >
                 Delete
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Regular Reviewers */}
      {!isFlashcard && reviewer.sections && (
        <div className="text-white w-full max-w-3xl mt-10">
        <button
  onClick={() => setIsDeletingSum(true)}
  className="cursor-pointer ml-auto mb-5 text-red-800 hover:text-white hover:bg-red-800 flex gap-2 items-center justify-center p-3 border border-[#E93209] rounded-xl active:scale-95"
>
  <FaTrashAlt  size={18} />
</button>
          <h1 className='text-white font-black text-3xl mb-4'>{reviewer.title}</h1>
         
          {reviewer.sections.map((section, idx) => (
            <div key={idx} className="mb-6 ">
              <h2 className="text-xl font-black text-[#B5B5FF] mb-2">{section.title}</h2>
              <ul className="list-disc list-inside space-y-1 text-[#E2E8F0] bg-transparent rounded-xl p-2">
                {section.analogy ? (
                  <>
                    <p>{section.explanation ?? ""}</p> 
                    <p className='ml-2.5 italic '>
                      <b className='text-yellow-300 flex mt-3'><FaRegLightbulb />Analogy: </b>
                      {section.analogy ?? ""}
                    </p>

                    {section.steps?.length > 0 && (
                      <div className='text-[#d3d3d3] rounded-lg p-2'>
                        <b className='text-[#C7D2FE]'>Insights:</b><br />
                        <ol className=" list-inside space-y-1 font-semibold">
                          {section.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {section.keyPoints?.length > 0 && (
                      <>
                        <b className='text-[#FDE68A] font-black'>Key Points:</b><br />
                        <ul className="list-disc list-inside space-y-1 text-[#fbfbffff] border-2 border-[#ff5e00ff] p-2 rounded-lg bg-[#43437d39]">
                          {section.keyPoints.map((point, i) => (
                            <li key={i} className='list-none flex gap-1'>
                              <IoMdStarOutline size={20} color='yellow' />{point}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className='text-[#fcfcfcff] p-2 rounded-xl'>{section.summary}</h3>
                    <div className='flex flex-col gap-2 mb-5'>
                      {section.concepts.map((item,index)=>(
                        <div key={index} className='bg-[#43437d39] p-2 rounded-sm border-2 border-[#FFF2AF]'>
                          <h1 className='text-[#f48ab3ff] font-black'>{item.term}</h1>
                          <h3 className='text-[#fcfbfbff] font-bold'>{item.explanation}</h3>
                          {item.example ? (
                            <p className='text-[#FFA500] italic'>
                              <b>Example: </b>{item.example}
                            </p>
                          ) : ""}
                        </div>
                      ))}
                    </div>

                    <p><b className='text-[#fff]'>Key Takeaways</b></p>

                    <div className='pl-10'>
                      <ul className='flex flex-col list-disc'>
                        {section.keyTakeaways.map((item,index)=>(
                          <li key={index} className='text-[#fdf2b3ff] font-semibold'>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </ul>
              
            </div>
          ))}
            
        </div>
      )}
    </div>

    
  )
}

export default Review

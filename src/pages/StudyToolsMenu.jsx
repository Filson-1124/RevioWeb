import React from 'react'
import { Link } from 'react-router-dom'
import { TbListLetters } from "react-icons/tb";
import { PiCardsFill } from "react-icons/pi";
import { TbNotes } from "react-icons/tb";
import { HiSparkles } from "react-icons/hi";

const StudyToolsMenu = () => {
  return (

  <>
   <div className=' flex flex-col gap-7 p-20'>
      <h1 className='text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold'>STUDY TOOLS</h1>
      <hr className='text-white' />
    </div>
       <div className='px-20 grid grid-cols-2 justify-center gap-10'>

    

        <div className='text-white flex flex-col gap-10'>
        <h2 className='text-center font-poppinsbold text-3xl'>Flashcards Maker</h2>

          <div className='grid grid-rows-2 gap-10'>


       <Link to="/Main/Create/Submit?type=acronym" >
        <div className='p-10 border-1 border-[#565656] bg-[#2E2E40] font-poppins rounded text-center
        hover:border-[#B5B5FF] transition-all hover:scale-105 active:scale-100'>
            <TbListLetters size={100} className='place-self-center'/>
          <h3 className='font-bold text-xl'>Acronym Mnemonics</h3>
          <p className='font-light text-[.7rem]'>Using mnemonics helps you memorize faster</p>
        </div>
        </Link>
<Link to="/Main/Create/Submit?type=terms">
        <div className='p-10 border-1 border-[#565656] bg-[#2E2E40] font-poppins rounded text-center hover:border-[#B5B5FF] transition-all hover:scale-105 active:scale-100'>
          <PiCardsFill size={100} className='place-self-center'/>
          <h3 className='font-bold text-xl'>Terms and Definition</h3>
          <p className='font-light text-[.7rem]'>Utilize using Leitner technique in studying</p>
        </div>
        </Link>

        </div>
  

      </div>


         <div className='text-white flex flex-col gap-10'>
        <h2 className='text-center font-poppinsbold text-3xl'>Reviewer Generator</h2>


<div className='grid grid-rows-2 gap-10'>

    <Link to="/Main/Create/Submit?type=summarization">
        <div className='p-10 border-1 border-[#565656] bg-[#2E2E40] font-poppins rounded text-center hover:border-[#B5B5FF] transition-all hover:scale-105 active:scale-100'>
          <TbNotes size={100} className='place-self-center' />
          <h3 className='font-bold text-xl'>Standard Summarization</h3>
          <p className='font-light text-[.7rem]'>Study using a Pomodoro timer</p>
        </div>
        </Link>
    <Link to="/Main/Create/Submit?type=ai">
        <div className='p-10 border-1 border-[#565656] bg-[#2E2E40] font-poppins rounded text-center hover:border-[#B5B5FF] transition-all hover:scale-105 active:scale-100'>
      
          <HiSparkles size={100} className='place-self-center'/>
          <h3 className='font-bold text-xl'>Summarization <span>+</span> AI Explanation</h3>
          <p className='font-light text-[.7rem]'>Study using a Pomodoro timer with AI Explanation</p>
        </div>
        </Link>
  </div>

      </div>
      </div>
  </>

  )
}

export default StudyToolsMenu

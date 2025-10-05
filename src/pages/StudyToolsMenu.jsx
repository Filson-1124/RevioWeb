import React from 'react'
import { Link } from 'react-router-dom'
import { TbListLetters, TbNotes } from "react-icons/tb"
import { PiCardsFill } from "react-icons/pi"
import { HiSparkles } from "react-icons/hi"

const StudyToolsMenu = () => {
  return (
    <>
      <div className="flex flex-col gap-5 p-6 sm:p-10 md:p-20 text-center">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppinsbold">
          STUDY TOOLS
        </h1>
        <hr className="border-gray-600 w-full md:w-3/4 mx-auto" />
      </div>

      <div className="px-6 sm:px-10 md:px-20 grid grid-cols-1 sm:grid-cols-2 gap-10 pb-10">
        
        {/* Flashcards Maker Title */}
        <div className="sm:col-span-2 text-center">
          <h2 className="text-white text-2xl sm:text-3xl font-poppinsbold">
            Flashcards Maker
          </h2>
        </div>

        {/* Acronym Mnemonics */}
        <Link to="/Main/Create/Submit?type=acronym">
          <div className="p-8 sm:p-10 h-full border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105 flex flex-col justify-between">
            <TbListLetters size={70} className="mx-auto mb-4 text-white" />
            <h3 className="font-bold text-base sm:text-lg md:text-xl">Acronym Mnemonics</h3>
            <p className="font-light text-xs sm:text-sm md:text-[.9rem]">
              Using mnemonics helps you memorize faster
            </p>
          </div>
        </Link>

        {/* Terms and Definition */}
        <Link to="/Main/Create/Submit?type=terms">
          <div className="p-8 sm:p-10 h-full border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105 flex flex-col justify-between">
            <PiCardsFill size={70} className="mx-auto mb-4 text-white" />
            <h3 className="font-bold text-base sm:text-lg md:text-xl">Terms and Definition</h3>
            <p className="font-light text-xs sm:text-sm md:text-[.9rem]">
              Utilize Leitner technique in studying
            </p>
          </div>
        </Link>

        {/* Reviewer Generator Title */}
        <div className="sm:col-span-2 text-center">
          <h2 className="text-white text-2xl sm:text-3xl font-poppinsbold">
            Reviewer Generator
          </h2>
        </div>

        {/* Standard Summarization */}
        <Link to="/Main/Create/Submit?type=summarization">
          <div className="p-8 sm:p-10 h-full border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105 flex flex-col justify-between">
            <TbNotes size={70} className="mx-auto mb-4 text-white" />
            <h3 className="font-bold text-base sm:text-lg md:text-xl">Standard Summarization</h3>
            <p className="font-light text-xs sm:text-sm md:text-[.9rem]">
              Study using a Pomodoro timer
            </p>
          </div>
        </Link>

        {/* Summarization + AI Explanation */}
        <Link to="/Main/Create/Submit?type=ai">
          <div className="p-8 sm:p-10 h-full border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105 flex flex-col justify-between">
            <HiSparkles size={70} className="mx-auto mb-4 text-white" />
            <h3 className="font-bold text-base sm:text-lg md:text-xl">Summarization + AI Explanation</h3>
            <p className="font-light text-xs sm:text-sm md:text-[.9rem]">
              Study using a Pomodoro timer with AI Explanation
            </p>
          </div>
        </Link>

      </div>
    </>
  )
}

export default StudyToolsMenu

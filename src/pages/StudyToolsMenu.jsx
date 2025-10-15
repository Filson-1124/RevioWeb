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

      <div className="px-6 pb-40 sm:px-10 md:px-20 grid grid-cols-1 sm:grid-cols-2 gap-10 ">

        <div className="sm:col-span-2 text-center">
          <h2 className="text-white text-2xl sm:text-3xl font-poppinsbold">Flashcards Maker</h2>
        </div>

        <Link to="/Main/Create/Submit?type=acronym&folder=AcronymMnemonics">
          <div className="p-8 sm:p-10 border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105">
            <TbListLetters size={70} className="mx-auto mb-4 text-white" />
            <h3 className="font-bold text-lg">Acronym Mnemonics</h3>
            <p className="text-sm text-gray-300">Using mnemonics helps you memorize faster</p>
          </div>
        </Link>

        <Link to="/Main/Create/Submit?type=terms&folder=TermsAndDefinitions">
          <div className="p-8 sm:p-10 border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105">
            <PiCardsFill size={70} className="mx-auto mb-4 text-white" />
            <h3 className="font-bold text-lg">Terms and Definition</h3>
            <p className="text-sm text-gray-300">Utilize Leitner technique in studying</p>
          </div>
        </Link>

        <div className="sm:col-span-2 text-center">
          <h2 className="text-white text-2xl sm:text-3xl font-poppinsbold">Reviewer Generator</h2>
        </div>

        <Link to="/Main/Create/Submit?type=summarization&folder=SummarizedReviewers">
          <div className="p-8 sm:p-10 border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105">
            <TbNotes size={70} className="mx-auto mb-4 text-white" />
            <h3 className="font-bold text-lg">Standard Summarization</h3>
            <p className="text-sm text-gray-300">Summarize key ideas, terms, and takeaways for quick review.  </p>
          </div>
        </Link>

        <Link to="/Main/Create/Submit?type=ai&folder=SummarizedWithAI">
          <div className="p-8 sm:p-10 border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105">
            <HiSparkles size={70} className="mx-auto mb-4 text-white" />
            <h3 className="font-bold text-lg">Summarization + AI Explanation</h3>
            <p className="text-sm text-gray-300">Use AI to explain concepts with analogies and key insights. </p>
          </div>
        </Link>

      </div>
    </>
  )
}

export default StudyToolsMenu

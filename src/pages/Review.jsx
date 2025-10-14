import React, { useState, useEffect } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { LuArrowLeft } from "react-icons/lu"
import { IoArrowRedoSharp, IoArrowUndo, IoGameController } from "react-icons/io5"
import { IoMdStarOutline } from "react-icons/io";
import { FaRegLightbulb } from "react-icons/fa";
import { FaEdit } from "react-icons/fa"

const Review = () => {
  const reviewer = useLoaderData()

  // Sort only the questions (terms) numerically based on their IDs
  const sortedQuestions = reviewer.questions
    ? [...reviewer.questions].sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, ''), 10)
        const numB = parseInt(b.id.replace(/\D/g, ''), 10)
        return numA - numB
      })
    : []

  // Acronyms remain in their original order
  const sortedContent = reviewer.content ? [...reviewer.content] : []

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [message, setMessage] = useState('')
  const isFlashcard = reviewer.id.startsWith('td') || reviewer.id.startsWith('ac')
  const isAcronymCard = reviewer.id.startsWith('ac')

  const { id, reviewerId } = useParams()
  const navigate = useNavigate()

  const handleFlip = () => setFlipped(!flipped)

  const handleNext = () => {
    setFlipped(false)
    if (isAcronymCard) {
      if (currentGroupIndex < sortedContent.length - 1) setCurrentGroupIndex(currentGroupIndex + 1)
      else setMessage("You've reached the last card")
    } else {
      if (currentIndex < sortedQuestions.length - 1) setCurrentIndex(currentIndex + 1)
      else setMessage("You've reached the last card")
    }
  }

  const handlePrev = () => {
    setFlipped(false)
    if (isAcronymCard) {
      if (currentGroupIndex > 0) setCurrentGroupIndex(currentGroupIndex - 1)
      else setMessage('This is the first card')
    } else {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
      else setMessage('This is the first card')
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 2000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const current = isAcronymCard ? sortedContent?.[currentGroupIndex] : sortedQuestions?.[currentIndex]
  const correctChoice = !isAcronymCard && current?.definition?.find(c => c.type === "correct")
  const currentAcronym = isAcronymCard ? current : null
  const currentTitle = isAcronymCard ? currentAcronym?.title : reviewer.title

  return (
    <div className='flex flex-col items-center justify-start min-h-screen bg-[#121212] pt-6 pb-10 md:pb-0 px-4 gap-7 md:px-10'>
      <div className="w-full flex justify-between items-center relative mb-6">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-2 top-2 md:left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base"
        >
          <LuArrowLeft size={18} className='md:size-5' />
          Back
        </button>
      </div>
      
      {!isAcronymCard && (
  <h1 className="text-white text-2xl md:text-3xl font-bold mt-6 mb-6 text-center">
    {currentTitle}
  </h1>
)}

      {isFlashcard && (
        <>

        {isAcronymCard? <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row justify-end  md:justify-between items-center gap-10 ">
  <h1 className="text-white text-2xl md:text-3xl font-bold">
    {reviewer.title}
  </h1>
  <p className="text-sm text-gray-300 italic place-self-start">
    Click to flip to reveal the key phrase
  </p>
</div>:""}
      

      
          {/* Flashcard Section */}
          <div className="relative w-[90vw] sm:w-[35rem] md:w-[38rem] lg:w-[50rem] xl:w-[35rem] h-[18rem] sm:h-[35rem] md:h-[25rem] lg:h-[23rem] xl:h-[25rem] perspective transition-all duration-500">
            <div
              className={`transition-transform duration-500 [transform-style:preserve-3d] w-full h-full ${flipped ? 'rotate-y-180' : ''}`}
              onClick={handleFlip}
            >
              {/* FRONT SIDE */}
        <div  className={`absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-lg flex flex-col items-center justify-center p-4  text-center cursor-pointer ${isAcronymCard ? 'bg-[#2E2E40]' : 'bg-[#8267B1]'
  }`}
>
              {isAcronymCard?<h1 className="text-white text-md md:text-2xl font-bold mt-6 mb-6 text-center"> {currentTitle}</h1>:""}
                {isAcronymCard ? (
                <div className="scroll-container bg-[#5C5C76] p-3 md:px-6 rounded-lg shadow-inner w-full h-full overflow-y-auto flex">
  <div className="m-auto text-center text-lg md:text-lg font-extrabold tracking-widest leading-loose font-poppinsbold">
    {currentAcronym?.contents?.map((item, index) => (
      <p key={index} className="first-letter:text-[#E4FF35] text-white">
        {item?.word ?? ''}
      </p>
    ))}
  </div>
</div>

                ) : (
                  <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white place-self-center">
                    {current?.term ?? 'No term available'}
                  </p>
                )}
              </div>

    {/* BACK SIDE */}
   <div  className={`absolute w-full h-full [backface-visibility:hidden] rotate-y-180 rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 md:p-4 text-center cursor-pointer ${isAcronymCard ? 'bg-[#5C5C76]' : 'bg-[#FFF8AA]'
  }`}
>
  
  <div className="scroll-container text-white w-full h-full overflow-y-auto flex flex-col items-center justify-center text-center">
      {isAcronymCard?<h1 className='text-white text-2xl md:text-3xl font-bold mt-6 mb-6 text-center'> Key Phrases</h1>:""}
    {isAcronymCard ? (
      
      <div className="bg-[#2E2E40] h-[80%] min-w-[100%] rounded-2xl text-lg md:text-2xl font-semibold flex items-center justify-center text-center">
  <p className="text-white">
    <b>{currentAcronym?.keyPhrase ?? ''}</b>
  </p>
</div>

    ) : (
      <p className="text-sm md:text-3xl lg:text-2xl font-semibold text-[#6A558D] text-center">
        {correctChoice?.text ?? 'No definition available'}
      </p>
    )}
  </div>
</div>

    
  </div>
</div>




          <div className="mt-6 flex gap-4">
            <button
              onClick={handlePrev}
              className="flex px-4 py-2 bg-[#B5B5FF] text-white transition w-28 md:w-40 rounded-2xl justify-center items-center active:scale-90"
            >
              <IoArrowUndo color='black' size={25} />
            </button>
            <button
              onClick={handleNext}
              className="flex px-4 py-2 bg-[#B5B5FF] text-white transition w-28 md:w-40 rounded-2xl justify-center items-center active:scale-90"
            >
              <IoArrowRedoSharp color='black' size={25} />
            </button>
          </div>

          {message && <p className="mt-4 text-yellow-300 font-semibold text-sm md:text-base">{message}</p>}

          <div className="flex flex-col md:flex-row gap-4 mt-8 w-full md:w-auto">
            <button
              onClick={() => navigate(`/Main/Library/${id}/${reviewerId}/edit`)}
              className="flex gap-2 items-center justify-center w-full md:w-48 lg:w-56 px-6 py-3 border border-white text-[#B5B5FF] rounded-xl font-semibold text-sm md:text-base active:scale-95"
            >
              <FaEdit color="#B5B5FF" size={18} /> Edit
            </button>

            <button
              onClick={() => navigate(`/Main/Library/${id}/${reviewerId}/gamified`)}
              className="flex gap-2 items-center justify-center w-full md:w-48 lg:w-56 px-6 py-3 border border-[#E93209] text-[#B5B5FF] rounded-xl font-semibold text-sm md:text-base active:scale-95"
            >
              <IoGameController color="white" size={18} />
              <span className="font-bold bg-gradient-to-r from-[#F0EDB6] to-[#E93209] bg-clip-text text-transparent">
                Game Mode
              </span>
            </button>
          </div>
        </>
      )}

      {/* Regular Reviewers */}
      {!isFlashcard && reviewer.sections && (
        <div className="text-white w-full max-w-3xl mt-10">
          {reviewer.sections.map((section, idx) => (
            <div key={idx} className="mb-6 ">
              <h2 className="text-xl font-semibold text-[#B5B5FF] mb-2">📘 {section.title}</h2>
              <ul className="list-disc list-inside space-y-1 text-[#E2E8F0] border-2 border-[#FFF2AF] bg-[#43437d39] rounded-xl p-2">
                {section.analogy ? (
                  <>
                    <b>Explanation:</b><br />
                    <p>{section.explanation ?? ""}</p>
                    <b className='text-yellow-300 flex'><FaRegLightbulb />Analogy: </b>
                    <p className='ml-2.5'>{section.analogy ?? ""}</p>

                    {section.steps?.length > 0 && (
                      <div className='text-[#d3d3d3] bg-[#4B556380] border-2 border-[#FDE68A] rounded-lg p-2'>
                        <b className='text-[#C7D2FE]'>Steps:</b><br />
                        <ol className="list-decimal list-inside space-y-1">
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
                            <li key={i} className='list-none flex gap-1'><IoMdStarOutline size={20} color='yellow' />{point}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p><b>Summary:</b></p>
                    <h3 className='text-[#fcfcfcff] border-2 p-2 rounded-xl border-[#FFF2AF] bg-[#43437d]'>{section.summary}</h3>
                  
                    {section.concept && (
                      <>
                        <b>Concepts:</b><br />
                        <p><b>{section.concept?.term ?? ""}</b></p>
                        <p>{section.concept?.explanation ?? ""}</p>
                        <b>Examples:</b><br />
                        <p>{section.concept?.example ?? ""}</p>
                     </>
                    )}
                     
                    <p className='text-[#fdf2b3ff] font-bold'><b className='text-[#fff]'>Key Takeaways:</b> {section.keyTakeaways ?? ""}</p>
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

import React, { useState, useEffect } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { LuArrowLeft } from "react-icons/lu"
import { IoArrowRedoSharp, IoArrowUndo, IoGameController } from "react-icons/io5"
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
    <div className='flex flex-col items-center justify-start min-h-screen bg-[#121212] pt-6 px-4 md:px-10'>
      <div className="w-full flex justify-between items-center relative mb-6">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-2 md:left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base"
        >
          <LuArrowLeft size={18} className='md:size-5' />
          Back
        </button>
      </div>

      <h1 className='text-white text-2xl md:text-3xl font-bold mt-6 mb-6 text-center'>{currentTitle}</h1>

      {isFlashcard && (
        <>
          {/* Flashcard Section */}
          <div className="relative w-[90vw] sm:w-[35rem] md:w-[38rem] lg:w-[50rem] xl:w-[60rem] h-[18rem] sm:h-[20rem] md:h-[25rem] lg:h-[28rem] xl:h-[30rem] perspective transition-all duration-500">
            <div
              className={`transition-transform duration-500 [transform-style:preserve-3d] w-full h-full ${flipped ? 'rotate-y-180' : ''}`}
              onClick={handleFlip}
            >
              {/* FRONT SIDE */}
              <div className="absolute w-full h-full [backface-visibility:hidden] bg-[#8267B1] rounded-2xl shadow-lg flex flex-col items-center justify-center p-2 md:p-8 text-center cursor-pointer">
                {isAcronymCard ? (
                  <div className="scroll-container bg-[#5C5C76] p-2 md:px-6 rounded-lg shadow-inner w-full h-full overflow-y-auto">
                    <div className="text-center text-lg md:text-3xl font-extrabold tracking-widest leading-loose">
                      {currentAcronym?.contents?.map((item, index) => (
                        <p key={index} className="first-letter:text-[#E4FF35] text-white font-poppinsbold">
                          {item?.word ?? ''}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white">
                    {current?.term ?? 'No term available'}
                  </p>
                )}
              </div>

    {/* BACK SIDE */}
    <div className="absolute w-full h-full [backface-visibility:hidden] rotate-y-180 bg-[#FFF8AA] rounded-2xl shadow-lg flex items-center justify-center p-6 md:p-10 text-center cursor-pointer">
      <div className="scroll-container w-full h-full overflow-y-auto">
        {isAcronymCard ? (
          <div className="text-[#6A558D] text-lg md:text-2xl font-semibold space-y-2 text-left">
            <p>
              Key Phrase: <b>{currentAcronym?.keyPhrase ?? ''}</b>
            </p>
          </div>
        ) : (
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#6A558D]">
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
            <div key={idx} className="mb-6">
              <h2 className="text-xl font-semibold text-[#5EEAD4] mb-2">📘 {section.title}</h2>
              <ul className="list-disc list-inside space-y-1 text-[#E2E8F0]">
                {section.analogy ? (
                  <>
                    <b>Explanation:</b><br />
                    <p>{section.explanation ?? ""}</p>
                    <b>Analogy: </b><br />
                    <p className='ml-2.5'>{section.analogy ?? ""}</p>

                    {section.steps?.length > 0 && (
                      <>
                        <b>Steps:</b><br />
                        <ol className="list-decimal list-inside space-y-1">
                          {section.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </>
                    )}

                    {section.keyPoints?.length > 0 && (
                      <>
                        <b>Key Points:</b><br />
                        <ul className="list-disc list-inside space-y-1">
                          {section.keyPoints.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p><b>Summary:</b></p>
                    <h3>{section.summary}</h3>
                    {section.concept && (
                      <>
                        <b>Concepts:</b><br />
                        <p><b>{section.concept?.term ?? ""}</b></p>
                        <p>{section.concept?.explanation ?? ""}</p>
                        <b>Examples:</b><br />
                        <p>{section.concept?.example ?? ""}</p>
                      </>
                    )}
                    <p><b>Key Takeaways:</b> {section.keyTakeaways ?? ""}</p>
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

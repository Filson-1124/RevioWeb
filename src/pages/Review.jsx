import React, { useState, useEffect } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { LuArrowLeft } from "react-icons/lu"
import { IoArrowRedoSharp, IoArrowUndo, IoGameController } from "react-icons/io5"
import { FaEdit } from "react-icons/fa"

const Review = () => {
  const reviewer = useLoaderData()
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [message, setMessage] = useState('')
  const isFlashcard = reviewer.id.startsWith('td') || reviewer.id.startsWith('ac')
  const isAcronymCard = reviewer.id.startsWith('ac')

  const STUDY_DURATION = 25 * 60
  const BREAK_DURATION = 5 * 60
  const LONG_BREAK_DURATION = 15 * 60

  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [isLongBreak, setIsLongBreak] = useState(false)
  const [timeLeft, setTimeLeft] = useState(STUDY_DURATION)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    setShowNotification(true)
    const timer = setTimeout(() => setShowNotification(false), 4000)
    return () => clearTimeout(timer)
  }, [isBreak])

  useEffect(() => {
    let interval = null
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (!isBreak) {
              const nextCount = pomodoroCount + 1
              setPomodoroCount(nextCount)
              if (nextCount % 4 === 0) {
                setIsBreak(true)
                setIsLongBreak(true)
                return LONG_BREAK_DURATION
              } else {
                setIsBreak(true)
                setIsLongBreak(false)
                return BREAK_DURATION
              }
            } else {
              setIsBreak(false)
              setIsLongBreak(false)
              return STUDY_DURATION
            }
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, isBreak, pomodoroCount])

  const totalTime = isBreak ? (isLongBreak ? LONG_BREAK_DURATION : BREAK_DURATION) : STUDY_DURATION
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const { id, reviewerId } = useParams()
  const navigate = useNavigate()
  const handleFlip = () => setFlipped(!flipped)

  const handleNext = () => {
    setFlipped(false)
    if (isAcronymCard) {
      if (currentGroupIndex < reviewer.content.length - 1) setCurrentGroupIndex(currentGroupIndex + 1)
      else setMessage("You've reached the last card")
    } else {
      if (currentIndex < reviewer.questions.length - 1) setCurrentIndex(currentIndex + 1)
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

  const current = reviewer.questions?.[currentIndex]
  const correctChoice = !isAcronymCard && current?.definition?.find(c => c.type === "correct")
  const currentAcronym = isAcronymCard ? reviewer.content?.[currentGroupIndex] : null
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

      {!isFlashcard && (
        <div className='sticky top-0 z-50 w-full max-w-4xl bg-[#121212] pt-6 pb-2'>
          {showNotification && (
            <div className='mb-2 px-4 py-2 rounded-md text-white font-semibold text-sm bg-[#444] text-center shadow-md'>
              {isBreak
                ? isLongBreak
                  ? 'Take a longer rest this time, you’re doing great 💖'
                  : 'Have a break, your mental health is also important ✨'
                : 'Time to focus! You’ve got this 💪'}
            </div>
          )}
          <div className='h-3 w-full bg-gray-700 rounded-full overflow-hidden mb-4'>
            <div
              className={`h-full transition-all duration-500 ${isBreak ? 'bg-green-400' : 'bg-purple-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs md:text-sm text-[#A0AEC0] font-semibold">
              {isBreak ? (isLongBreak ? 'Long Break' : 'Break Time') : 'Study Time'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-3 py-1 bg-[#B5B5FF] text-black rounded text-xs md:text-sm font-bold"
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              {!isBreak && (
                <button
                  onClick={() => { setIsRunning(false); setTimeLeft(STUDY_DURATION) }}
                  className="px-3 py-1 bg-red-500 text-white rounded text-xs md:text-sm font-bold"
                >
                  Reset
                </button>
              )}
              {isBreak && (
                <button
                  onClick={() => { setIsBreak(false); setIsLongBreak(false); setTimeLeft(STUDY_DURATION) }}
                  className="px-3 py-1 bg-yellow-400 text-black rounded text-xs md:text-sm font-bold"
                >
                  Skip Break
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}

export default Review

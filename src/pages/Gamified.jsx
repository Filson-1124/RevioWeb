import React, { useEffect, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import gamifiedLogo from '../assets/gamifiedLogo.png'
import { auth, db } from '../components/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { LuArrowLeft } from "react-icons/lu"
import { useNavigate } from 'react-router-dom'

const Gamified = () => {
  const reviewer = useLoaderData()
  const isAcronym = reviewer.id.startsWith('ac')
  const questions = isAcronym ? reviewer.content : reviewer.questions
  const navigate = useNavigate()

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const tdTime = questions.length * 60
  const acTime = questions.length * 120
  const [wrongAnswers, setWrongAnswers] = useState([])
  const [startTime] = useState(Date.now())
  const [showResults, setShowResults] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [countdown, setCountdown] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isCorrectAnimation, setIsCorrectAnimation] = useState()
  const [shuffledChoices, setShuffledChoices] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentCorrectAnswers, setCurrentCorrectAnswers] = useState([])

  const current = index < questions.length ? questions[index] : null

  // shuffle choices
  const shuffle = (array) => {
    let arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  useEffect(() => {
    if (current && current.definition) setShuffledChoices(shuffle(current.definition))
    setIsPressed(false)
  }, [current?.definition])

  const findCorrectAnswer = (current) =>
    current.definition.find((c) => c.type === 'correct')?.text

  const checkAnswer = (isCorrectAnswer) => {
    if (isCorrectAnswer === 'correct') handleCheck()
    else handleWrong()
  }

  useEffect(() => {
    if (current?.content) setAnswers(Array(current.contents.length).fill(''))
    if (isAcronym) setCurrentCorrectAnswers(current.contents.map((c) => c.word))
  }, [current])

  const handleChange = (index, value) => {
    const updated = [...answers]
    updated[index] = value
    setAnswers(updated)
  }

  const checkAcro = (answers, correctAnswers) => {
    let perfect = true
    for (let i = 0; i < correctAnswers.length; i++) {
      console.log(answers[i].toUpperCase())
      console.log(correctAnswers[i].toUpperCase())
      if (answers[i].trim().toUpperCase() !== correctAnswers[i].trim().toUpperCase()) {
        perfect = false
        break
      }
    }
    setAnswers(Array(correctAnswers.length).fill(''))
    return perfect ? 'correct' : ''
  }

  // countdown + timer
  useEffect(() => {
    if (countdown === 0) setCountdown(null)
    else if (countdown > 0) {
      const t = setTimeout(() => setCountdown((p) => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  useEffect(() => {
    if (showResults || countdown !== null || showSplash) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? (handleNext(), 0) : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [index, showResults, countdown, showSplash])

  const handleStart = () => {
    setShowSplash(false)
    setCountdown(3)
    isAcronym ? setTimeLeft(acTime) : setTimeLeft(tdTime)
  }

  const handleNext = () => {
    if (index >= questions.length - 1) setShowResults(true)
    else setIndex((p) => Math.min(p + 1, questions.length - 1))
  }

  const triggerNextWithAnimation = (isCorrect) => {
    if (isAnimating || showResults) return
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      if (isCorrect) setScore((p) => p + 1)
      else if (current) setWrongAnswers((p) => [...p, current])
      handleNext()
    }, 500)
  }

  const handleCheck = () => {
    if (isAnimating || showResults || !current) return
    setIsCorrectAnimation(true)
    triggerNextWithAnimation(true)
  }

  const handleWrong = () => {
    if (isAnimating || showResults || !current) return
    setIsCorrectAnimation(false)
    triggerNextWithAnimation(false)
  }

  // Results screen
  const renderResults = () => {
    const timeSpent = Math.ceil((Date.now() - startTime) / 1000)
    return (
      <div className="text-center text-white w-full max-w-2xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Results</h2>
        <p className="text-base sm:text-lg mb-2">Score: {score} / {questions.length}</p>
        <p className="text-base sm:text-lg mb-6">Time spent: {timeSpent}s</p>
        {wrongAnswers.length > 0 ? (
          <div className="text-left bg-[#1f1f1f] p-4 rounded-lg space-y-3 overflow-y-auto max-h-[60vh]">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Wrong Answers:</h3>
            {wrongAnswers.map((item, i) => (
              <div key={i} className="p-3 border rounded-md text-sm sm:text-base">
                {isAcronym ? (
                  <>
                    <p><b>Letters:</b> {item.contents.map(c => c.word.charAt(0)).join('')}</p>
                    <p><b>Words:</b> {item.contents.map(c => c.word).join(', ')}</p>
                    <p><b>Key Phrase:</b> {item.keyPhrase}</p>
                  </>
                ) : (
                  <>
                    <p><b>Q:</b> {item.term}</p>
                    <p><b>A:</b> {findCorrectAnswer(item)}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : <p className="text-lg">No mistakes! 🎉</p>}
      </div>
    )
  }

  // Splash screen
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white px-6 text-center">
        <img src={gamifiedLogo} alt="Logo" className="w-65 sm:w-80 mb-6 animate-float-breathe" />
        <p className="max-w-md sm:max-w-lg text-[#9898D9] font-poppins text-sm sm:text-base mb-6">
          <b className="font-poppinsbold">Direction:</b><br />
          {isAcronym ? (
            <> Fill in the blanks using the first letters shown. Type the complete word and press 'Submit Answer.' <br /> You must <b>double check</b> your answers before submitting!</>
          ) : (
            "Choose the correct definition!"
          )}
        </p>
        <button
          onClick={handleStart}
          className="px-6 py-3 bg-[#6A558D] hover:bg-[#8267B1] text-white text-lg sm:text-xl rounded-full font-bold transition w-[80%] sm:w-auto"
        >
          Start Game
        </button>
        <button
          onClick={() => navigate(-1)}
          className=" md:absolute left-2 top-2 md:left-5 flex items-center gap-2 text-white  hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base font-black"
        >
          Back
        </button>
      </div>
    )
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-[#121212] text-white w-full p-4 sm:p-6 flex flex-col items-center relative overflow-x-hidden">
      <div className="w-full flex justify-between items-center relative mb-6">
        <button
          onClick={() => navigate(-1)}
          className=" md:absolute left-2 top-2 md:left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base"
        >
          <LuArrowLeft size={18} className='md:size-5' />
          Back
        </button>
      </div>

      {countdown !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center text-6xl sm:text-8xl font-bold text-white">
          {countdown}
        </div>
      )}

      {showResults ? (
        <div className="flex items-center justify-center w-full h-full">{renderResults()}</div>
      ) : (
        <div className={`w-full max-w-4xl transition-opacity ${countdown !== null ? 'opacity-30' : 'opacity-100'}`}>
          <div className="flex justify-between items-center mb-4 text-sm sm:text-base">
            <h1 className="font-bold">Gamified Mode</h1>
            <span>Score: {score}</span>
          </div>

          {/* Timer now shows minutes:seconds */}
          <div className="mb-4 text-right text-xs sm:text-sm text-gray-300">
            Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>

          {current && (
            <div
              className={`relative w-full mb-6 flex justify-center ${
                isAcronym ? 'h-[50vh] sm:h-[55vh] md:h-[60vh]' : 'h-64 sm:h-72'
              }`}
            >
              <div
                className={`transition-transform duration-500 w-full h-full flex justify-center items-center ${
                  isAnimating ? (isCorrectAnimation ? 'pop-up' : 'shake') : ''
                }`}
              >
                <div
                  className={`${
                    isAcronym ? 'mnemonics' : 'flashcard-front'
                  } w-[90%] sm:w-[80%] lg:w-[60%] p-4 sm:p-6 rounded-2xl bg-[#20202C] flex flex-col justify-center`}
                >
                  {isAcronym ? (
                    <div className="text-base sm:text-lg font-bold tracking-widest space-y-3 overflow-y-auto max-h-[45vh] sm:max-h-[50vh] w-full px-2">
                      <h1>{current.title}</h1>
                      {current.contents.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center justify-between">
                          <p className="text-md sm:text-lg text-[#c7c7ffff]">{item.word.charAt(0)}</p>
                          <textarea
                            className="resize-none p-2 border-2 bg-[#51516B] rounded-xl text-white w-[90%] focus:outline-none"
                            placeholder="Type the word"
                            value={answers[i] || ''}
                            onChange={(e) => handleChange(i, e.target.value)}
                            rows={1}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-2xl sm:text-3xl font-semibold text-center text-white">
                      {current.term}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Choices or submit button */}
          {isAcronym ? (
            <>
              <p className="text-center text-sm sm:text-base mb-4 bg-[#171720] p-5 text-[#9898D9] rounded-md">
                <b>Key Phrase:</b> {current.keyPhrase}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => checkAnswer(checkAcro(answers, currentCorrectAnswers))}
                  className="bg-[#9898D9] text-[#200448] px-6 py-3 rounded-3xl font-bold hover:text-[#9898D9] hover:bg-[#200448] active:scale-90 w-[80%] sm:w-auto"
                >
                  Submit Answer
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
              {shuffledChoices.map((choice, i) => (
                <div
                  key={i}
                  className={`min-h-[5rem] sm:min-h-[7rem] border border-[#2e2e42] p-4 sm:p-5 bg-[#20202C] rounded-2xl flex items-center justify-center text-center cursor-pointer text-sm sm:text-base 
                    ${isPressed ? (choice.type === 'correct' ? 'choiceCorrect' : 'choiceWrong') : ''}`}
                  onClick={() => { checkAnswer(choice.type); setIsPressed(true) }}
                >
                  {choice.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Gamified

export const gamifiedLoader = async ({ params }) => {
  const { id: folderId, reviewerId } = params

  const getUser = () =>
    new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        if (user && user.emailVerified) resolve(user)
        else reject("Unauthorized")
      })
    })

  try {
    const user = await getUser()

    if (folderId === "TermsAndCondition") {
      const reviewerRef = doc(db, "users", user.uid, "folders", folderId, "reviewers", reviewerId)
      const reviewerSnap = await getDoc(reviewerRef)
      if (!reviewerSnap.exists()) throw new Response("Reviewer not found", { status: 404 })
      const reviewerData = reviewerSnap.data()

      const questionsRef = collection(db, "users", user.uid, "folders", folderId, "reviewers", reviewerId, "questions")
      const questionsSnap = await getDocs(questionsRef)
      const questions = questionsSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const numA = parseInt(a.id.match(/\d+/)?.[0] || 0, 10)
          const numB = parseInt(b.id.match(/\d+/)?.[0] || 0, 10)
          return numA - numB
        })

      return { id: reviewerId, title: reviewerData.title, questions }
    }

    if (folderId === "AcronymMnemonics") {
      const reviewerRef = doc(db, "users", user.uid, "folders", folderId, "reviewers", reviewerId)
      const reviewerSnap = await getDoc(reviewerRef)
      if (!reviewerSnap.exists()) throw new Response("Reviewer not found", { status: 404 })
      const reviewerData = reviewerSnap.data()

      const contentCollectionRef = collection(db, "users", user.uid, "folders", folderId, "reviewers", reviewerId, "content")
      const contentSnap = await getDocs(contentCollectionRef)

      const content = await Promise.all(
        contentSnap.docs.map(async (contentDoc) => {
          const contentData = contentDoc.data()
          const numericId = parseInt(contentDoc.id.match(/\d+/)?.[0] || 0, 10)

          const contentsRef = collection(db, "users", user.uid, "folders", folderId, "reviewers", reviewerId, "content", contentDoc.id, "contents")
          const contentsSnap = await getDocs(contentsRef)
          const contents = contentsSnap.docs
            .map((d) => {
              const rawId = d.data().id ?? d.id
              const innerNumericId = parseInt(rawId.toString().match(/\d+/)?.[0] || 0, 10)
              return { id: innerNumericId, ...d.data() }
            })
            .sort((a, b) => a.id - b.id)

          return {
            id: numericId,
            title: contentData.title,
            keyPhrase: contentData.keyPhrase,
            contents,
          }
        })
      )

      const sortedContent = content.sort((a, b) => a.id - b.id)

      return { id: reviewerId, title: reviewerData.title, content: sortedContent }
    }

    throw new Response("Invalid folder", { status: 400 })
  } catch (error) {
    console.error("Loader error:", error)
    throw new Response("Failed to load reviewer", { status: 500 })
  }
}

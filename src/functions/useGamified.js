import React, { useEffect, useState } from 'react'
import correctSound from '../assets/quizSounds/correct.mp3'
import wrongSound from '../assets/quizSounds/wrong.mp3'
//eto na lord


export const useGamified = ({ questions = [], isAcronym = false }) => {
   const [length,setLength]=useState(questions.length)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const tdTime = length * 60
  const acTime = length * 120
  const [wrongAnswers, setWrongAnswers] = useState([])
  const [answeredQuestions, setAnsweredQuestions] = useState([]) // ✅ NEW
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
  const [timeUp, setTimeUp] = useState(false)
  const [trophyDone, setTrophyDone] = useState(true)
  const [isPlus, setIsPlus] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isPerfect,setIsPerfect]=useState(false)
  const[tropRet,setTropRet]=useState(false)
  const[isQuitting,setIsQuitting]=useState(false)
  const [active, setActive] = useState("term");
  const correctTunog = new Audio(correctSound)
  const wrongTunog = new Audio(wrongSound)
  const [isSettingsOpen,setIsSettingsOpen]=useState(false)
 

  const current = index < length? questions[index] : null

  const shuffle = (array) => {
    let arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
useEffect(() => {
  // Reset pressed state
  setIsPressed(false);

  if (!current) return;

  if (active === "term") {

    if (current.terms) setShuffledChoices(shuffle(current.terms));
  } else {
   
    const defs = Array.isArray(current.definition)
      ? current.definition
      : [current.definition]; 
    setShuffledChoices(shuffle(defs));
    console.log("Definitions shuffled:", defs);
  }
}, [current, active]); 


  const findCorrectAnswer = (current) =>{
    if(active=="term"){
    console.log("Abot po dito my misery"+current.terms.find((c) => c.type === 'correct')?.term)
    return current.terms.find((c) => c.type === 'correct')?.text
    }else{
    return current.definition.find((c) => c.type === 'correct')?.text}
  }

  const checkAnswer = (isCorrectAnswer) => {
    if (isCorrectAnswer === 'correct') handleCheck()
    else handleWrong()
  }

  useEffect(() => {
    if (current?.contents) setAnswers(Array(current.contents.length).fill(''))
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
      if (answers[i].trim().toUpperCase() !== correctAnswers[i].trim().toUpperCase()) {
        perfect = false
        break
      }
    }
    setAnswers(Array(correctAnswers.length).fill(''))
    return perfect ? 'correct' : ''
  }

  // Handle time up
  const handleTimeUp = () => {
    const unanswered = questions.slice(index) // all remaining questions
    setWrongAnswers((prev) => [...prev, ...unanswered])
    setTimeUp(true)
    setShowSplash(true)
    setTimeout(() => {
      setShowSplash(false)
      setShowResults(true)
    }, 2000)
  }

  // Countdown
  useEffect(() => {
    if (countdown === 0) setCountdown(null)
    else if (countdown > 0) {
      const t = setTimeout(() => setCountdown((p) => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  // Timer
  useEffect(() => {
    if (showResults || countdown !== null || showSplash) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [index, showResults, countdown, showSplash])

  const handleStart = () => {
    setShowSplash(false)
    setCountdown(3)
    isAcronym ? setTimeLeft(acTime) : setTimeLeft(tdTime)
  }

  const handleNext = () => {
    if (index >= length - 1) setShowResults(true)
    else setIndex((p) => Math.min(p + 1, length - 1))
  }

  // ✅ UPDATED — record user’s answers
  const triggerNextWithAnimation = (isCorrect) => {
    if (isAnimating || showResults) return
    setIsAnimating(true)

    // Record the result before moving on
    setAnsweredQuestions((prev) => 
      [
      ...prev,
      {
        question: current,
        isCorrect,
        userAnswers: isAcronym ? answers : [],
        correctAnswers: isAcronym ? currentCorrectAnswers : [findCorrectAnswer(current)],
      },
    ]
  )

    console.log("eto po mga ansred" + answeredQuestions)

    setTimeout(() => {
      setIsAnimating(false)
   if (current) setWrongAnswers((p) => [...p, current])
      handleNext()
    }, isAcronym ? 500 : 2000)
  }

  const playCorrectSound = () => {
    if (!isMuted) correctTunog.play()
  }

  const playWrongSound = () => {
    if (!isMuted) wrongTunog.play()
  }

  const toggleMute = () => setIsMuted((prev) => !prev)

  const handleCheck = () => {
    if (isAnimating || showResults || !current) return
    setIsCorrectAnimation(true)
    setScore(score +1)
    playCorrectSound()
    triggerNextWithAnimation(true)
    setIsPlus(true)

    setTimeout(() => {
      setIsPlus(false)
    }, 2000)
  }

  const handleWrong = () => {
    if (isAnimating || showResults || !current) return
    playWrongSound()
    setIsCorrectAnimation(false)
    triggerNextWithAnimation(false)
  }

  useEffect(() => {
 

  console.log("sa function: "+ isPerfect)
  console.log(score)
  console.log(length)
  if(score===length){
    setIsPerfect(true)
  }else{
    setIsPerfect(false)
  }
 
  if(isPerfect){
    setTrophyDone(false)
    setTropRet(false)
    
    setTimeout(()=>{
      setTrophyDone(true)
    },5000)
  }
}, [score, wrongAnswers, showResults, length])


const handleLengthChange = (e) => {
    const newLength = parseFloat(e.target.value);
    setLength(newLength);
  
  };

  return {
    state: {isQuitting,isSettingsOpen,
      index,
      score,
      timeLeft,
      wrongAnswers,
      answeredQuestions, // ✅ now available for UI
      startTime,
      showResults,
      isPressed,
      showSplash,
      countdown,
      isAnimating,
      isCorrectAnimation,
      shuffledChoices,
      answers,
      currentCorrectAnswers,
      timeUp,
      current,
      trophyDone,
      isPlus,
      isMuted,isPerfect,active,length
    },
    actions: {setIsQuitting,setIsSettingsOpen,
      setActive,
      setIndex,
      setScore,
      setTimeLeft,
      setWrongAnswers,
      setShowResults,
      setIsPressed,
      setShowSplash,
      setCountdown,
      setIsAnimating,
      setIsCorrectAnimation,
      setShuffledChoices,
      setAnswers,
      setIsPerfect  ,
      setCurrentCorrectAnswers,
      setTimeUp,
      handleStart,
      handleNext,
      handleCheck,
      handleWrong,
      handleChange,
      checkAcro,
      checkAnswer,
      triggerNextWithAnimation,
      shuffle,
      findCorrectAnswer,
      toggleMute,handleLengthChange,setLength
    },
  }
}

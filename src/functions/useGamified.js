import React, { useEffect, useState } from 'react'



export const useGamified = ({ questions = [], isAcronym = false }) =>{
    
    
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
      const [timeUp, setTimeUp] = useState(false)
      
    
      const current = index < questions.length ? questions[index] : null
    
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
        }, isAcronym ? 500:2000)
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
     
      return {
  state: {
    index,
    score,
    timeLeft,
    wrongAnswers,
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
  },
  actions: {
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
    findCorrectAnswer
  }
};

}
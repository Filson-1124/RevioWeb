import { createContext, useContext, useState, useEffect, useRef } from 'react'
import notif from '../assets/notification.mp3'

const PomodoroContext = createContext()

export const PomodoroProvider = ({ children }) => {
  const normalBreak = 5 * 60
  const longBreak = 15 * 60
  const focus = 25 * 60

  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(focus)
  const [mode, setMode] = useState('focus')
  const [initialTime, setInitialTime] = useState(focus)
  const [cycleCount, setCycleCount] = useState(0)

  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // Load notification sound
  useEffect(() => {
    audioRef.current = new Audio(notif) // place the file in /public folder
    audioRef.current.volume = 0.8
  }, [])

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => console.warn('Audio playback blocked:', err))
    }
  }

  const startTimer = () => {
    if (intervalRef.current) return
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsRunning(false)
          playNotification() // 🔊 Play sound here
          switchPhase()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const pauseTimer = () => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const setCustomTime = (minutes) => {
    pauseTimer()
    setInitialTime(minutes * 60)
    setTimeLeft(minutes * 60)
  }

  const skipPhase = () => {
    pauseTimer()
    playNotification() // optional: play sound when skipping
    switchPhase()
  }

  const switchPhase = () => {
    if (mode === 'focus') {
      const newCycle = cycleCount + 1
      setCycleCount(newCycle)

      if (newCycle === 4) {
        setMode('longBreak')
        setInitialTime(longBreak)
        setTimeLeft(longBreak)
        setCycleCount(0)

      } else {
        setMode('break')
        setInitialTime(normalBreak)
        setTimeLeft(normalBreak)
      }
    } else {
      setMode('focus')
      setInitialTime(focus)
      setTimeLeft(focus)
    }
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`

  return (
    <PomodoroContext.Provider
      value={{
        isRunning,
        startTimer,
        pauseTimer,
        skipPhase,
        setCustomTime,
        timeLeft,
        formattedTime,
        mode,
        cycleCount,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  )
}

export const usePomodoro = () => useContext(PomodoroContext)

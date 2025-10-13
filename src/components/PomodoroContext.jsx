import { createContext, useContext, useState, useEffect, useRef } from 'react'

const PomodoroContext = createContext()

export const PomodoroProvider = ({ children }) => {


  const normalBreak=(5*60)
  const longBreak=(15*60)
  const focus=(0.1*60)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(focus) // default: 25 mins
  const [mode, setMode] = useState('focus') // 'focus' | 'break' | 'longBreak'
  const [initialTime, setInitialTime] = useState(focus)
  const [cycleCount, setCycleCount] = useState(0) // 🆕 Track completed focus sessions

  const intervalRef = useRef(null)

  const startTimer = () => {
    if (intervalRef.current) return // prevent duplicates
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsRunning(false)
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

  const resetTimer = () => {
    pauseTimer()
    setTimeLeft(initialTime)
  }

  const setCustomTime = (minutes) => {
    pauseTimer()
    setInitialTime(minutes * 60)
    setTimeLeft(minutes * 60)
  }

  // 🆕 Skip to next phase manually
  const skipPhase = () => {
    pauseTimer()
    switchPhase()
  }

  // 🧠 Switch between focus / short break / long break
  const switchPhase = () => {
    if (mode === 'focus') {
      const newCycle = cycleCount + 1
      setCycleCount(newCycle)

      if (newCycle  === 4) {
        // 🕒 After 4th focus, long break
        setMode('longBreak')
        setInitialTime(longBreak)
        setTimeLeft(longBreak)
      } else {
        // 🕒 Normal short break
        setMode('break')
        setInitialTime(normalBreak)
        setTimeLeft(normalBreak)
      }
    } else {
      // 🧩 After a break or long break, go back to focus
      setMode('focus')
      setInitialTime(focus)
      setTimeLeft(focus)
    }
  }

  // Cleanup
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
        resetTimer,
        skipPhase, // 🆕 Skip feature exposed
        setCustomTime,
        timeLeft,
        formattedTime,
        mode,
        cycleCount, // 🆕 Optional display
      }}
    >
      {children}
    </PomodoroContext.Provider>
  )
}

export const usePomodoro = () => useContext(PomodoroContext)

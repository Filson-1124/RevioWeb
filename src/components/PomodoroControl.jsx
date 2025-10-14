import React, { useState, useEffect } from 'react'
import { usePomodoro } from './PomodoroContext'
import { FaPlay, FaPause, FaRedoAlt, FaClock, FaForward } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const PomodoroControls = () => {
  const { isRunning, startTimer, pauseTimer, skipPhase, formattedTime, mode } = usePomodoro()
  const [open, setOpen] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [lastMode, setLastMode] = useState(mode)

  // Trigger shake for 5 seconds when the mode (phase) changes
  useEffect(() => {
    if (mode !== lastMode) {
      setIsShaking(true)
      setLastMode(mode)

      const timer = setTimeout(() => {
        setIsShaking(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [mode, lastMode])



  const handleSkip = () => {
    skipPhase()
    setOpen(false)
  }

  const handleButtonClick = () => {
    // stop shaking if user presses it
    if (isShaking) setIsShaking(false)
    setOpen(!open)
  }

  return (
    <div className="fixed bottom-40 right-4 md:bottom-20 md:right-6 z-50">
      <div className="relative">
        {/* Floating Toggle Button (shakes when phase ends) */}
        <motion.button
          onClick={handleButtonClick}
          animate={
            isShaking
              ? {
                  scale: [1, 1.2, 0.9, 1.15, 1],
                  rotate: [0, -10, 10, -10, 0],
                  transition: {
                    duration: 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
              : { scale: 1, rotate: 0, transition: { duration: 0.3 } }
          }
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        >
          <FaClock className="text-base" />
        </motion.button>

        {/* Expandable Controls */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-14 right-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl p-4 w-56 sm:w-60"
            >
              {/* Timer Info */}
              <div className="text-center mb-3">
                <p className="font-bold text-base sm:text-lg">
                  {mode === 'focus'
                    ? 'Focus Time'
                    : mode === 'longBreak'
                    ? 'Long Break'
                    : 'Break Time'}
                </p>
                <p className="text-xl sm:text-2xl font-mono">{formattedTime}</p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {isRunning ? (
                  <button
                    onClick={pauseTimer}
                    className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white w-10 h-10 flex items-center justify-center"
                  >
                    <FaPause className="text-sm" />
                  </button>
                ) : (
                  <button
                    onClick={startTimer}
                    className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white w-10 h-10 flex items-center justify-center"
                  >
                    <FaPlay className="text-sm" />
                  </button>
                )}

              

                <button
                  onClick={handleSkip}
                  className="p-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white w-10 h-10 flex items-center justify-center"
                >
                  <FaForward className="text-sm" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PomodoroControls

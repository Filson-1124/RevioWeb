import React, { useRef, useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { useAudio } from './AudioContext'
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaMusic } from 'react-icons/fa'

const MusicPlayer = () => {
  const [open, setOpen] = useState(false)
  const lastTouchRef = useRef(0)
  const nodeRef = useRef(null)
  const panelRef = useRef(null)

  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    volume,
    audioRef,
  } = useAudio()

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef?.current) audioRef.current.volume = newVolume
  }

  useEffect(() => {
    const handleOutside = (ev) => {
      if (!open) return
      if (panelRef.current && !panelRef.current.contains(ev.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [open])

  const toggleHandlerFromClick = (e) => {
    if (Date.now() - lastTouchRef.current < 500) {
      e.stopPropagation()
      return
    }
    e.stopPropagation()
    setOpen((p) => !p)
  }

  const toggleHandlerFromTouch = (e) => {
    lastTouchRef.current = Date.now()
    e.stopPropagation()
    e.preventDefault?.()
    setOpen((p) => !p)
  }

  return (
    <Draggable nodeRef={nodeRef} bounds="body" cancel=".no-drag" enableUserSelectHack={false}>
      <div
        ref={nodeRef}
        className="fixed z-[9999] right-4 bottom-[5.5rem] md:right-6 md:bottom-6 w-max cursor-move pointer-events-auto"
      >
        {/* Floating Button */}
        <button
          className="no-drag bg-purple-700 text-white p-3 rounded-full shadow-lg hover:bg-purple-800 transition-all active:scale-95 focus:outline-none"
          onClick={toggleHandlerFromClick}
          onTouchEnd={toggleHandlerFromTouch}
        >
          <FaMusic />
        </button>

        {/* Expandable Panel */}
        {open && (
          <div
            ref={panelRef}
            className="no-drag mt-2 bg-gray-900 text-white p-4 rounded-lg shadow-lg w-60 flex flex-col gap-3 animate-[fadeIn_0.15s_ease-in-out]"
          >
            <p className="text-sm text-center font-semibold truncate">
              {currentTrack?.title || 'No track selected'}
            </p>

            <div className="flex justify-between items-center text-xl">
              <button className="no-drag hover:text-purple-400" onClick={prevTrack}>
                <FaStepBackward />
              </button>
              <button className="no-drag hover:text-purple-400" onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button className="no-drag hover:text-purple-400" onClick={nextTrack}>
                <FaStepForward />
              </button>
            </div>

            {/* Progress-style Volume Bar */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="no-drag w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8b5cf6 ${volume * 100}%, #3f3f46 ${volume * 100}%)`,
              }}
            />
          </div>
        )}
      </div>
    </Draggable>
  )
}

export default MusicPlayer

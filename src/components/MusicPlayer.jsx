import React, { useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { useAudio } from './AudioContext'
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaMusic } from 'react-icons/fa'

const MusicPlayer = () => {
  const [open, setOpen] = useState(false)
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, setVolume, volume, audioRef } = useAudio()

  const nodeRef = useRef(null) // 👈 Create a ref for the draggable node


  return (
    <Draggable nodeRef={nodeRef} bounds="body" cancel=".no-drag">
      <div ref={nodeRef} className="fixed bottom-4 right-4 z-50 w-max cursor-move">
        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="bg-purple-700 text-white p-3 rounded-full shadow-lg hover:bg-purple-800 transition-all"
        >
          <FaMusic />
        </button>

        {/* Expandable Panel */}
        {open && (
          <div className="no-drag mt-2 bg-gray-900 text-white p-4 rounded-lg shadow-lg w-60 flex flex-col gap-3">
            <p className="text-sm text-center font-semibold truncate">
              {currentTrack?.title || 'No track selected'}
            </p>
            <div className="flex justify-between items-center text-xl">
              <button onClick={prevTrack} className="hover:text-purple-400">
                <FaStepBackward />
              </button>
              <button onClick={togglePlay} className="hover:text-purple-400">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={nextTrack} className="hover:text-purple-400">
                <FaStepForward />
              </button>
              

            </div>
            <input type="range" min="0" max="1" step="0.01" value={volume} 
              onChange={(e) => { const newVolume = parseFloat(e.target.value); setVolume(newVolume)
    if (audioRef?.current) {
      audioRef.current.volume = newVolume
    }
  }}
  className="volume-slider w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer"
/>
          </div>
        )}
      </div>
    </Draggable>
  )
}

export default MusicPlayer

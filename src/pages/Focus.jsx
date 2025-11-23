import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAudio } from '../components/AudioContext'
import focusMusic from '../assets/focusMusic'
import { FaRegCirclePlay } from "react-icons/fa6"
import { FaPauseCircle } from "react-icons/fa"
import focusImage from '../assets/focusAssets/REVIO-MUSIC.png'

const Focus = () => {
  const {
    setCurrentTrack,
    currentTrack,
    isPlaying,
    audioRef,
    setTrackList,
    setCurrentIndex,
  } = useAudio()

  const [extended, setExtended] = useState(false)
  const [highlightedTrackId, setHighlightedTrackId] = useState(null)

  const text =
    "40Hz binaural beats, which generate gamma brainwave activity, are primarily associated with enhanced cognitive function, including improved focus, memory, and processing speed."

  const toggleExpand = () => setExtended(!extended)


  useEffect(() => {
    setTrackList(focusMusic)
  }, [])

  
  useEffect(() => {
    if (currentTrack) {
      const foundTrack = focusMusic.find(track => track.id === currentTrack.id)
      if (foundTrack) {
        setHighlightedTrackId(foundTrack.id)
      } else {
        setHighlightedTrackId(null)
      }
    } else {
      setHighlightedTrackId(null)
    }
  }, [currentTrack])


  const handleTrackClick = (track, index) => {
    if (currentTrack?.id === track.id) {
   
      if (audioRef.current.paused) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    } else {
    
      setCurrentTrack(track)
      setCurrentIndex(index)
      setTimeout(() => {
        audioRef.current.load()
        audioRef.current
          .play()
          .catch((err) => console.warn('Autoplay failed:', err))
      }, 0)
    }
  }

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    },
  }

  return (
    <div className="flex flex-col gap-7 pb-[55%] p-5 md:p-10 md:pb-40">
      <motion.h1 variants={itemVariants} initial="hidden" animate="visible" className="text-white text-2xl md:text-4xl lg:text-5xl font-bold font-poppinsbold">

          FOCUS
    
      </motion.h1>
      <hr className="border-[#797777]" />

      <div className="flex gap-5">
        <img src={focusImage} alt="" className="w-40 h-40 rounded-2xl" />
        <div className="flex flex-col place-self-end">
          <h1 className="text-white font-black">
            40Hz Focus Music (Binaural Beats)
          </h1>
          <p className="text-white">
            {!extended
              ? '40Hz binaural beats, which generate gamma brainwave activity,'
              : text}{' '}
            <a
              className="text-[#ae57ff] cursor-pointer"
              onClick={toggleExpand}
            >
              {!extended ? 'see more...' : 'see less...'}
            </a>
          </p>
        </div>
      </div>

      <motion.ol
        className="flex flex-col gap-2 list-decimal"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {focusMusic.map((track, index) => {
          const isHighlighted = track.id === highlightedTrackId
          const isCurrent = currentTrack?.id === track.id
          const playingNow = isCurrent && isPlaying

          return (
            <motion.li
              key={track.id}
              variants={itemVariants}
              onClick={() => handleTrackClick(track, index)}
              className={`group flex items-center gap-3 border-y border-[#797777] p-3 text-white cursor-pointer md:gap-4 md:p-4 transition-all duration-150 ${
                isHighlighted ? 'bg-[#2a1847]' : 'hover:bg-[#33205e]'
              }`}
            >
              {playingNow ? (
                <FaPauseCircle
                  size={40}
                  color="yellow"
                  className="pointer-events-none transition-transform duration-100 group-active:scale-90"
                />
              ) : (
                <FaRegCirclePlay
                  size={40}
                  color="yellow"
                  className="pointer-events-none transition-transform duration-100 group-active:scale-90"
                />
              )}

              <div className="group-active:scale-90">
                <h3 className="text-sm md:text-lg font-semibold">
                  {track.title}
                </h3>
                <p className="text-[#837f7f]">{track.artist}</p>
              </div>
            </motion.li>
          )
        })}
      </motion.ol>
    </div>
  )
}

export default Focus

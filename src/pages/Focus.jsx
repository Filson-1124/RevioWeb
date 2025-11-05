import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAudio } from '../components/AudioContext'
import focusMusic from '../assets/focusMusic'
import { FaRegCirclePlay } from "react-icons/fa6"
import focusImage from '../assets/focusAssets/focusimage.jpg'

const Focus = () => {
  const { setCurrentTrack, audioRef, setTrackList, setCurrentIndex } = useAudio()
  const [extended, setExtended] = useState(false)
  const text =
    "40Hz binaural beats, which generate gamma brainwave activity, are primarily associated with enhanced cognitive function, including improved focus, memory, and processing speed."

  const toggleExpand = () => setExtended(!extended)

  useEffect(() => {
    setTrackList(focusMusic)
    setCurrentIndex(0)
  }, [])

  // Animation variants for the ordered list
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // delay between each track
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
      },
    },
  }

  return (
    <div className="flex flex-col gap-7 pb-[55%] p-5 md:p-10">
      <motion.h1 variants={itemVariants}
      initial="hidden"
      animate="visible">
      <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold font-poppinsbold">
        FOCUS
      </h1>
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

      {/* Animated Ordered List */}
      <motion.ol
        className="flex flex-col gap-2 list-decimal"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {focusMusic.map((track) => (
          <motion.li
            key={track.id}
            variants={itemVariants}
            onClick={() => {
              setCurrentTrack(track)
              setTimeout(() => {
                audioRef.current.load()
                audioRef.current
                  .play()
                  .catch((err) => console.warn('Autoplay failed:', err))
              }, 0)
            }}
            className="group flex items-center gap-3 border-y border-[#797777] p-3 text-white cursor-pointer md:gap-4 md:p-4 transition-all duration-100 hover:bg-[#33205e]"
          >
            <FaRegCirclePlay
              size={40}
              color="yellow"
              className="pointer-events-none transition-transform duration-100 group-active:scale-90"
            />
            <div className="group-active:scale-90">
              <h3 className="text-sm md:text-lg font-semibold ">
                {track.title}
              </h3>
              <p className="text-[#837f7f]">{track.artist}</p>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  )
}

export default Focus


import React, { useEffect, useState } from 'react'
import { useAudio } from '../components/AudioContext'
import focusMusic from '../assets/focusMusic'
import { FaRegCirclePlay } from "react-icons/fa6";
import focusImage from '../assets/focusAssets/focusimage.jpg'

const Focus = () => {
  const { setCurrentTrack, audioRef, setTrackList, setCurrentIndex } = useAudio()
  const [extended,setExtended]=useState(false)
  const text="40Hz binaural beats, which generate gamma brainwave activity, are primarily associated with enhanced cognitive function, including improved focus, memory, and processing speed."


  const toggleExpand= ()=> setExtended(!extended)

  useEffect(() => {
    setTrackList(focusMusic)
    setCurrentIndex(0)
  }, [])

  return (
    <div className="flex flex-col gap-7 p-5 md:p-10">
      <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold font-poppinsbold">
        FOCUS
      </h1>
      <hr className="border-[#797777]" />
        <div className='flex gap-5'>

          <img src={focusImage} alt="" className='w-40 h-40 rounded-2xl' />
          <div className='flex flex-col place-self-end'>
          <h1 className='text-white font-black'>40hz Focus Music (Binarual Beats)</h1>
          <p className='text-white'>{!extended?"40Hz binaural beats, which generate gamma brainwave activity,":text} <a className='text-[#ae57ff] cursor-pointer' onClick={toggleExpand}>{!extended?"see more...":"see less..."}</a></p>
          </div>
        </div>


      <ol className="list-decimal">
        {focusMusic.map((track) => (
          <li
            key={track.id}
            onClick={() => {
              setCurrentTrack(track)
              setTimeout(() => {
                audioRef.current.load()
                audioRef.current
                  .play()
                  .catch((err) => console.warn('Autoplay failed:', err))
              }, 0)
            }}
            className="flex items-center gap-3 border-y border-[#797777] p-3 text-white active:scale-95 cursor-pointer md:gap-4 md:p-4"
          >
            {/* Smaller on mobile, bigger on PC */}
          <FaRegCirclePlay size={40} color='yellow' />
            <div>
             <h3 className="text-sm md:text-lg font-semibold">{track.title}</h3>
            <p className='text-[#837f7f]'>{track.artist}</p>
            </div>
           
          </li>
        ))}
      </ol>
    </div>
  )
}

export default Focus

import React, { useEffect } from 'react'
import { useAudio } from '../components/AudioContext'
import focusMusic from '../assets/focusMusic'

const Focus = () => {
  const { setCurrentTrack, audioRef, setTrackList, setCurrentIndex } = useAudio()

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
            <img
              src={track.image}
              alt={track.title}
              className="w-14 h-14 md:w-20 md:h-20 object-cover rounded-xl"
            />
            <h3 className="text-sm md:text-lg font-semibold">{track.title}</h3>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default Focus

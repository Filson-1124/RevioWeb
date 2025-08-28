import { createContext, useContext, useRef, useState, useEffect } from 'react'

const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackList, setTrackList] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(1) // 1 = 100%

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    isPlaying ? pause() : play()
  }

  const nextTrack = () => {
    if (currentIndex < trackList.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (currentIndex === trackList.length - 1) {
      setCurrentIndex(0)
    }
  }

  const prevTrack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Auto load (but NOT auto play) when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.load()

      // Only auto-play if user was already playing
      if (isPlaying) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      }
    }
  }, [currentTrack, currentIndex]) // Only update track, don't autoplay

  // Update current track when trackList or index changes
  useEffect(() => {
    if (trackList.length > 0) {
      setCurrentTrack(trackList[currentIndex])
    }
  }, [currentIndex, trackList])

  // Sync play/pause state with audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        currentTrack,
        setCurrentTrack,
        isPlaying,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        setTrackList,
        setCurrentIndex,
        setVolume,
        volume,
      }}
    >
      <audio ref={audioRef} className="hidden" controls={false}>
        {currentTrack?.audio && (
          <source src={currentTrack.audio} type="audio/mpeg" />
        )}
        Your browser does not support audio.
      </audio>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => useContext(AudioContext)

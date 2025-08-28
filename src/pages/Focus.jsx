import React, { useEffect } from 'react';
import { useAudio } from '../components/AudioContext'; // Make sure path is correct
import focusMusic from '../assets/focusMusic';

const Focus = () => {
  const { setCurrentTrack, audioRef, setTrackList, setCurrentIndex } = useAudio();


  useEffect(()=>{
    setTrackList(focusMusic)
    setCurrentIndex(0)
  },[])

  return (
    <div className="flex flex-col gap-7 p-20">
      <h1 className="text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold">FOCUS</h1>
      <hr className="text-white" />

      <ol className="list-decimal">
        {focusMusic.map((track) => (
        <li
  key={track.id}
  onClick={() => {
    setCurrentTrack(track);
    setTimeout(() => {
      audioRef.current.load();
      audioRef.current.play().catch((err) =>
        console.warn("Autoplay failed:", err)
      );
    }, 0);
  }}
  className="flex items-center gap-4 border-y border-[#797777] p-4 text-white active:scale-95 cursor-pointer"
>
  <img src={track.image} alt={track.title} className="w-20 h-20 object-cover rounded-xl" />
  <h3 className="text-lg font-semibold">{track.title}</h3>
</li>

        ))}
      </ol>
    </div>
  );
};

export default Focus;

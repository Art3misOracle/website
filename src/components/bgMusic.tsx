import React, { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

const MusicButton = ({ audioSource = "/softmusic.mp3" }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    const playAudio = async () => {
      try {
        audio.currentTime = 0;

        audio.volume = 1;
        audio.loop = true;

        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Playback failed:", error);
        setIsPlaying(false);

        const playOnInteraction = async () => {
          try {
            await audio.play();
            setIsPlaying(true);
            document.removeEventListener("click", playOnInteraction);
          } catch (err) {
            console.error("Playback failed after interaction:", err);
          }
        };

        document.addEventListener("click", playOnInteraction);
      }
    };

    playAudio();

    // Handle visibility changes for consistent playback
    const handleVisibilityChange = () => {
      if (!document.hidden && !audio.paused) {
        // When tab becomes visible, restart playback
        playAudio();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="">
      <audio ref={audioRef} src={audioSource} preload="auto" autoPlay />
      <button
        onClick={togglePlayPause}
        className="p-3 rounded-full bg-yellow-800 hover:bg-yellow-700 text-white transition-colors shadow-lg"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
    </div>
  );
};

export default MusicButton;

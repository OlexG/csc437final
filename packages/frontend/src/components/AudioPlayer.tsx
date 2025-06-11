import { useState, useRef, useEffect } from "react";
import { api } from "../utils/api";

interface AudioPlayerProps {
  duration: string;
  tweepId: string;
}

const AudioPlayer = ({ duration, tweepId }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioElementRef.current = new Audio();
    audioElementRef.current.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
    });

    audioElementRef.current.addEventListener("timeupdate", () => {
      if (audioElementRef.current) {
        const currentTime = audioElementRef.current.currentTime;
        const duration = audioElementRef.current.duration;
        if (duration > 0) {
          setProgress((currentTime / duration) * 100);
        }
      }
    });

    audioElementRef.current.addEventListener("loadstart", () => {
      setIsLoading(true);
    });

    audioElementRef.current.addEventListener("canplay", () => {
      setIsLoading(false);
    });

    // Set the audio source
    audioElementRef.current.src = api.getAudioUrl(tweepId);

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
    };
  }, [tweepId]);

  const togglePlay = async () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        await audioElementRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
        alert("Failed to play audio. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="tweep-content">
      <div className="audio-player">
        <button 
          className="play-button" 
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          aria-pressed={isPlaying}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          )}
          <span className="visually-hidden">
            {isLoading ? "Loading" : (isPlaying ? "Pause" : "Play")} audio recording ({duration})
          </span>
        </button>
        <div 
          className="audio-progress" 
          role="progressbar" 
          aria-valuenow={progress} 
          aria-valuemin={0} 
          aria-valuemax={100}
          aria-label="Audio playback progress"
        >
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="audio-duration" aria-hidden="true">
        <span className="duration-time">{duration}</span>
      </div>
    </div>
  );
};

export default AudioPlayer; 
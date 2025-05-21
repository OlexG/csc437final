import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  duration: string;
}

// Function to generate random noise
const generateRandomNoise = (audioContext: AudioContext) => {
  const bufferSize = audioContext.sampleRate * 1; // 1 second buffer
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    // Random noise between -0.15 and 0.15 (quieter than full volume)
    data[i] = (Math.random() * 0.3) - 0.15;
  }
  
  return buffer;
};

const AudioPlayer = ({ duration }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const resetProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(0);
  };

  const startProgressSimulation = () => {
    // Calculate interval based on the duration string (format: "m:ss min")
    const timeMatch = duration.match(/(\d+):(\d+)/);
    let totalSeconds = 0;
    
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      totalSeconds = (minutes * 60) + seconds;
    }
    
    // Update progress every 100ms
    const intervalTime = 100;
    const steps = (totalSeconds * 1000) / intervalTime;
    const incrementPerStep = 100 / steps;
    
    intervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + incrementPerStep;
        if (newProgress >= 100) {
          stopPlayback();
          return 0;
        }
        return newProgress;
      });
    }, intervalTime);
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsPlaying(false);
  };

  const startPlayback = () => {
    // Create AudioContext if it doesn't exist
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContext();
      } catch {
        // Fallback for older browsers
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const WebkitAudioContext = (window as any).webkitAudioContext;
        if (WebkitAudioContext) {
          audioContextRef.current = new WebkitAudioContext();
        } else {
          console.error("Web Audio API not supported in this browser");
          return;
        }
      }
    }
    
    // Create a source node for our random noise
    const audioContext = audioContextRef.current;
    // Safety check
    if (!audioContext) {
      console.error("Could not initialize audio context");
      return;
    }
    
    const noiseBuffer = generateRandomNoise(audioContext);
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = noiseBuffer;
    sourceNode.loop = true;
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
    
    sourceNodeRef.current = sourceNode;
    
    startProgressSimulation();
    
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
      resetProgress();
    } else {
      startPlayback();
    }
  };

  return (
    <div className="tweep-content">
      <div className="audio-player">
        <button 
          className="play-button" 
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          aria-pressed={isPlaying}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          <span className="visually-hidden">
            {isPlaying ? "Pause" : "Play"} audio recording ({duration})
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
      <div className="audio-duration" aria-hidden="true">{duration}</div>
    </div>
  );
};

export default AudioPlayer; 
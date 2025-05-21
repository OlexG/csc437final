import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTweeps } from "../context/TweepsContext";

type RecordingMode = "default" | "recording" | "playback";

const RecordingPanel = () => {
  const [mode, setMode] = useState<RecordingMode>("default");
  const [timer, setTimer] = useState("0:00");
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Use the tweeps context
  const { addTweep } = useTweeps();
  
  // Refs
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // Initialize audio element for playback
  useEffect(() => {
    audioElementRef.current = new Audio();
    audioElementRef.current.addEventListener("ended", () => {
      setIsPlaying(false);
    });
    
    // Clean up on unmount
    return () => {
      cleanupResources();
    };
  }, []);

  // Cleanup all resources
  const cleanupResources = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
      audioElementRef.current.load();
    }
  };

  // Request microphone access
  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      return true;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setPermissionDenied(true);
      return false;
    }
  };

  const startRecording = async () => {
    // Clean up any previous resources
    cleanupResources();
    
    // Reset state
    setTimer("0:00");
    audioChunksRef.current = [];
    
    const hasAccess = await requestMicrophoneAccess();
    if (!hasAccess) return;
    
    // Set up recording
    const mediaRecorder = new MediaRecorder(audioStreamRef.current!);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      if (audioElementRef.current) {
        const url = URL.createObjectURL(audioBlob);
        audioElementRef.current.src = url;
        
        window.addEventListener("unload", () => URL.revokeObjectURL(url), {
          once: true,
        });

        setMode("playback");
      }
    };

    mediaRecorder.start();

    let seconds = 0;
    timerIntervalRef.current = window.setInterval(() => {
      seconds++;
      const min = Math.floor(seconds / 60);
      const sec = seconds % 60;
      setTimer(`${min}:${sec.toString().padStart(2, "0")}`);
    }, 1000);
    
    setMode("recording");
  };
  
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    } else {
      setMode("default");
    }
  };
  
  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };
  
  const discardRecording = () => {
    if (audioElementRef.current && !audioElementRef.current.paused) {
      audioElementRef.current.pause();
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    cleanupResources();

    setTimer("0:00");
    audioChunksRef.current = [];
    setIsPlaying(false);
    setMode("default");
  };
  
  const postTweep = () => {
    // Add the tweep using our context
    addTweep("oleks", timer);
    
    // Alert the user and clean up
    alert("Tweep posted!");
    discardRecording();
    
    // Navigate back to the profile page
    navigate("/profile/oleks");
  };
  
  return (
    <>
      <div className="recording-panel">
        <div className="recording-status">
          <div
            className={`record-icon ${mode === "recording" ? "recording" : ""}`}
          >
            <i className="fas fa-microphone"></i>
          </div>
          <div className="record-timer">{timer}</div>
        </div>
        
        <div className="audio-visualizer">
          {mode === "playback" && (
            <button 
              className="play-button large-play" 
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause recording" : "Play recording"}
              aria-pressed={isPlaying}
            >
              <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
              <span className="visually-hidden">
                {isPlaying ? "Pause" : "Play"} current recording
              </span>
            </button>
          )}
          
          {permissionDenied && mode === "default" && (
            <div className="permission-error">
              <i className="fas fa-exclamation-triangle"></i>
              <p>
                Microphone access denied. Please allow access to record audio.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="action-buttons">
        {mode === "default" && (
          <button className="record-btn" onClick={startRecording}>
            <i className="fas fa-circle"></i>
            <span>Start Recording</span>
          </button>
        )}
        
        {mode === "recording" && (
          <button className="record-btn stop-recording" onClick={stopRecording}>
            <i className="fas fa-stop"></i>
            <span>Stop Recording</span>
          </button>
        )}
        
        {mode === "playback" && (
          <button
            className="discard-btn"
            onClick={discardRecording}
          >
            <i className="fas fa-times"></i>
            <span>Discard</span>
          </button>
        )}
        
        <button
          className="post-btn"
          onClick={postTweep}
          disabled={mode !== "playback" || isPlaying}
        >
          <i className="fas fa-paper-plane"></i>
          <span>Post Tweep</span>
        </button>
      </div>
    </>
  );
};

export default RecordingPanel;

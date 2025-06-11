import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTweeps } from "../context/TweepsContext";
import { useAuth } from "../context/AuthContext";

type RecordingMode = "default" | "recording" | "playback" | "posting";

const RecordingPanel = () => {
  const [mode, setMode] = useState<RecordingMode>("default");
  const [timer, setTimer] = useState("00:00:00");
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Use the tweeps context and auth context
  const { addTweep } = useTweeps();
  const { user } = useAuth();
  
  // Refs
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
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
    setTimer("00:00:00");
    audioChunksRef.current = [];
    audioBlobRef.current = null;
    
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
      audioBlobRef.current = audioBlob;
      
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

    // Start timer
    let seconds = 0;
    timerIntervalRef.current = window.setInterval(() => {
      seconds++;
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      setTimer(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
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

    setTimer("00:00:00");
    audioChunksRef.current = [];
    audioBlobRef.current = null;
    setIsPlaying(false);
    setMode("default");
  };
  
  const postTweep = async () => {
    if (!audioBlobRef.current || !user) {
      alert("Error: No audio recorded or user not logged in");
      return;
    }

    setMode("posting");

    try {
      // Upload tweep to backend
      const success = await addTweep(audioBlobRef.current, timer);
      
      if (success) {
        alert("Tweep posted successfully!");
        discardRecording();
        // Navigate back to current user's profile page
        navigate(`/profile/${user.username}`);
      } else {
        alert("Failed to post tweep. Please try again.");
        setMode("playback");
      }
    } catch (error) {
      console.error("Error posting tweep:", error);
      alert("Failed to post tweep. Please try again.");
      setMode("playback");
    }
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
          
          {mode === "posting" && (
            <div className="posting-status">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Posting tweep...</p>
            </div>
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
          <span>{mode === "posting" ? "Posting..." : "Post Tweep"}</span>
        </button>
      </div>
    </>
  );
};

export default RecordingPanel;

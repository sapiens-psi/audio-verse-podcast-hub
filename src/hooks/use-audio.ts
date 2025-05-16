
import { useState, useRef, useEffect } from "react";
import { useEpisodeViews } from "@/hooks/use-episode-views";

interface UseAudioProps {
  src: string;
  episodeId?: string;
}

export function useAudio({ src, episodeId }: UseAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const [viewCounted, setViewCounted] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { registerView } = useEpisodeViews();

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioRef.current) return;

    const initializeAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaElementSource(audioRef.current!);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      analyserRef.current.fftSize = 128;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Initialize with zero data
      setAudioData(Array(bufferLength).fill(0));
    };

    // Only initialize if not already done
    if (!audioContextRef.current) {
      try {
        initializeAudio();
      } catch (error) {
        console.error("Error initializing Web Audio API:", error);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Start audio visualizer
  const startVisualizer = () => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      analyser.getByteFrequencyData(dataArray);
      setAudioData([...dataArray]);
    };
    
    renderFrame();
  };
  
  // Handle playback toggle
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Resume audioContext if it was suspended (browser policy)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    if (isPlaying) {
      audio.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      audio.play().then(() => {
        startVisualizer();
      }).catch(error => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Update current time while playing
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setCurrentTime(audio.currentTime);
    
    // Register view after 5 seconds of playback if it's a valid episode
    if (episodeId && !viewCounted && audio.currentTime > 5) {
      registerView(episodeId);
      setViewCounted(true);
    }
  };

  // Handle metadata load to get duration
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setDuration(audio.duration);
  };

  // Handle time change via slider
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (volume > 0) {
      setPrevVolume(volume);
      audio.volume = 0;
      setVolume(0);
    } else {
      audio.volume = prevVolume;
      setVolume(prevVolume);
    }
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  };

  // Skip backward 10 seconds
  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  // Reset player when audio src changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setViewCounted(false);
    
    // Reset visualizer
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
  }, [src]);

  return {
    audioRef,
    isPlaying,
    duration,
    currentTime,
    volume,
    audioData,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    handleVolumeChange,
    togglePlayPause,
    toggleMute,
    skipForward,
    skipBackward
  };
}

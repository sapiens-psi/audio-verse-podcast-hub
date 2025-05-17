
import { useState, useEffect, useRef } from "react";

interface UseAudioProps {
  src: string;
  episodeId?: string;
}

export const useAudio = ({ src, episodeId }: UseAudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Log episodeId to check if it's being passed correctly
  useEffect(() => {
    if (episodeId) {
      console.log("useAudio hook received episodeId:", episodeId);
    }
  }, [episodeId]);

  useEffect(() => {
    const setupAudioContext = () => {
      if (!audioRef.current) return;

      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audioRef.current);

        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        setAudioData(dataArray);

        const updateAudioData = () => {
          if (analyserRef.current && audioData) {
            analyserRef.current.getByteFrequencyData(audioData);
            // Create a copy of the Uint8Array without converting to array
            setAudioData(new Uint8Array(audioData));
          }
          animationFrameRef.current = requestAnimationFrame(updateAudioData);
        };

        animationFrameRef.current = requestAnimationFrame(updateAudioData);
      } catch (error) {
        console.error("Error setting up audio context:", error);
      }
    };

    if (audioRef.current && !audioContextRef.current) {
      setupAudioContext();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
      }
    };
  }, [audioData]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        console.log("Audio paused at time:", audioRef.current.currentTime);
      } else {
        audioRef.current.play()
          .then(() => {
            console.log("Audio started playing at time:", audioRef.current.currentTime);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
          });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      console.log("Audio metadata loaded, duration:", audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = parseFloat(e.target.value);
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      console.log("Seek to time:", seekTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setVolume(audioRef.current.muted ? 0 : 1);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

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
};

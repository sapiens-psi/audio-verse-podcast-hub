
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEpisodeViews } from "@/hooks/use-episode-views";

interface AudioPlayerProps {
  src: string;
  episodeId?: string;
  className?: string;
}

interface TimeFormat {
  minutes: number;
  seconds: number;
}

// Helper function to format time
const formatTime = (time: number): TimeFormat => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return { minutes, seconds };
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, episodeId, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const [viewCounted, setViewCounted] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { registerView } = useEpisodeViews();
  
  // Format times for display
  const durationFormatted = formatTime(duration);
  const currentTimeFormatted = formatTime(currentTime);

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

  // Start audio visualizer
  const startVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const width = canvas.width;
    const height = canvas.height;
    
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      analyser.getByteFrequencyData(dataArray);
      setAudioData([...dataArray]);
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw visualizer
      const barWidth = width / bufferLength * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height / 1.5;
        
        // Color gradient based on Ampla logo colors
        const colors = ['#D1173D', '#F78C3B', '#FFC325', '#00A9B0'];
        const colorIndex = Math.floor((i / bufferLength) * colors.length);
        ctx.fillStyle = colors[colorIndex];
        
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    
    renderFrame();
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
    
    // Reset canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [src]);

  // Render volume icon based on current volume
  const renderVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <div className={cn("audio-player-container p-4 bg-gradient-to-r from-[#D1173D]/5 to-[#00A9B0]/5 rounded-lg shadow-md border border-[#FFC325]/20", className)}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Audio Visualizer */}
      <div className="h-16 mb-3 bg-black/5 rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef}
          width={500}
          height={64}
          className="w-full h-full"
        />
        
        {!isPlaying && (
          <div className="relative -mt-16 h-16 flex items-center justify-center bg-black/20">
            <span className="text-xs text-white font-medium">
              Clique em play para ouvir
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={skipBackward}
            className="p-2 rounded-full hover:bg-[#D1173D]/10 transition-colors"
            aria-label="Voltar 10 segundos"
          >
            <SkipBack className="text-[#D1173D] h-5 w-5" />
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="p-3 bg-gradient-to-r from-[#D1173D] to-[#F78C3B] text-white rounded-full hover:shadow-lg transition-all"
            aria-label={isPlaying ? "Pausar" : "Tocar"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          
          <button 
            onClick={skipForward}
            className="p-2 rounded-full hover:bg-[#00A9B0]/10 transition-colors"
            aria-label="Avançar 10 segundos"
          >
            <SkipForward className="text-[#00A9B0] h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleMute}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={volume === 0 ? "Ativar som" : "Mutar"}
          >
            {renderVolumeIcon()}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-[#FFC325]"
            aria-label="Volume"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="text-xs text-gray-600 w-12 text-right font-medium">
          {currentTimeFormatted.minutes}:{currentTimeFormatted.seconds.toString().padStart(2, '0')}
        </span>
        
        <div className="relative flex-grow h-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full accent-[#FFC325] z-10 opacity-0 cursor-pointer"
            aria-label="Posição do áudio"
          />
          <div className="absolute inset-0 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-[#D1173D] to-[#00A9B0] rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <span className="text-xs text-gray-600 w-12 font-medium">
          {durationFormatted.minutes}:{durationFormatted.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default AudioPlayer;

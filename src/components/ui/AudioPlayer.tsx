
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { registerView } = useEpisodeViews();
  
  // Format times for display
  const durationFormatted = formatTime(duration);
  const currentTimeFormatted = formatTime(currentTime);
  
  // Handle playback toggle
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
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
  }, [src]);

  // Render volume icon based on current volume
  const renderVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <div className={cn("audio-player-container p-4 bg-white rounded-lg shadow", className)}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={skipBackward}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SkipBack className="text-podcast h-4 w-4" />
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="p-2 bg-podcast text-white rounded-full hover:bg-podcast-dark transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <button 
            onClick={skipForward}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SkipForward className="text-podcast h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleMute}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
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
            className="w-20"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="text-xs text-gray-500 w-12 text-right">
          {currentTimeFormatted.minutes}:{currentTimeFormatted.seconds.toString().padStart(2, '0')}
        </span>
        
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="flex-grow"
        />
        
        <span className="text-xs text-gray-500 w-12">
          {durationFormatted.minutes}:{durationFormatted.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default AudioPlayer;

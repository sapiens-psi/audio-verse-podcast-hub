
import React, { useEffect, useRef } from "react";
import { formatTime, formatTimeString } from "./utils";
import { useEpisodeViews } from "@/hooks/use-episode-views";

interface AudioProgressBarProps {
  currentTime: number;
  duration: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  episodeId?: string;
}

const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  currentTime,
  duration,
  handleSeek,
  episodeId
}) => {
  const currentTimeFormatted = formatTime(currentTime);
  const durationFormatted = formatTime(duration);
  const { registerPlayback } = useEpisodeViews();
  const lastTimeRef = useRef<number>(0);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playStartTimeRef = useRef<number | null>(null);

  // Handle playback tracking
  useEffect(() => {
    if (episodeId && currentTime > 0) {
      // Track playback every 30 seconds
      if (!playTimerRef.current) {
        // Store starting time when playback begins
        if (playStartTimeRef.current === null) {
          playStartTimeRef.current = currentTime;
        }
        
        playTimerRef.current = setInterval(() => {
          if (playStartTimeRef.current !== null && currentTime > playStartTimeRef.current) {
            // Register the play segment
            registerPlayback(episodeId, playStartTimeRef.current, currentTime).catch(console.error);
            // Update start time to current time
            playStartTimeRef.current = currentTime;
          }
        }, 30000); // Every 30 seconds
      }

      // Save last time for cleanup
      lastTimeRef.current = currentTime;
    }

    return () => {
      // Clean up interval if component unmounts
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
        
        // Register final segment when unmounting if we were playing
        if (episodeId && playStartTimeRef.current !== null && lastTimeRef.current > playStartTimeRef.current) {
          registerPlayback(episodeId, playStartTimeRef.current, lastTimeRef.current).catch(console.error);
        }
      }
    };
  }, [episodeId, currentTime]);

  return (
    <div className="flex items-center space-x-3">
      <span className="text-xs text-gray-600 w-12 text-right font-medium">
        {formatTimeString(currentTimeFormatted)}
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
        {formatTimeString(durationFormatted)}
      </span>
    </div>
  );
};

export default AudioProgressBar;

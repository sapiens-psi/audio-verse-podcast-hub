
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
  const { registerView, registerPlayback } = useEpisodeViews();
  const lastTimeRef = useRef<number>(0);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playStartTimeRef = useRef<number | null>(null);
  const viewRegisteredRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);

  // Register a view when the episode starts playing
  useEffect(() => {
    if (!episodeId) {
      console.log("No episodeId provided to AudioProgressBar");
      return;
    }
    
    if (currentTime > 0 && !viewRegisteredRef.current) {
      console.log("Registering initial view for episode:", episodeId);
      registerView(episodeId)
        .then(result => {
          if (result.success) {
            console.log("View registered successfully");
            viewRegisteredRef.current = true;
          } else {
            console.error("Error registering view:", result.error);
          }
        })
        .catch(error => console.error("Unexpected error registering view:", error));
    }

    // Check if the player is actually playing based on time progression
    if (currentTime > lastTimeRef.current) {
      isPlayingRef.current = true;
      // If playback starts and we don't have a start time yet, set it
      if (playStartTimeRef.current === null) {
        playStartTimeRef.current = currentTime;
        console.log("Initial playback time set:", playStartTimeRef.current);
      }
    }
    
    lastTimeRef.current = currentTime;
  }, [episodeId, currentTime, registerView]);

  // Handle playback tracking
  useEffect(() => {
    if (!episodeId) return;
    
    if (currentTime > 0 && isPlayingRef.current) {
      // Track playback every 15 seconds
      if (!playTimerRef.current) {
        playTimerRef.current = setInterval(() => {
          if (playStartTimeRef.current !== null && currentTime > playStartTimeRef.current) {
            console.log(`Recording playback time: ${playStartTimeRef.current} to ${currentTime}`);
            registerPlayback(episodeId, playStartTimeRef.current, currentTime)
              .then(result => {
                if (result.success) {
                  console.log("Playback time recorded successfully");
                } else if (result.skipped) {
                  console.log("Playback recording skipped (no significant time elapsed)");
                } else {
                  console.error("Error recording playback time:", result.error);
                }
              })
              .catch(error => console.error("Unexpected error recording playback time:", error));
            
            // Update start time to current time
            playStartTimeRef.current = currentTime;
          }
        }, 15000); // Every 15 seconds
      }
    }

    return () => {
      // Clean up interval when component unmounts or episode changes
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
        
        // Register final segment when unmounting if we were playing
        if (episodeId && playStartTimeRef.current !== null && lastTimeRef.current > playStartTimeRef.current) {
          console.log(`Recording final playback time: ${playStartTimeRef.current} to ${lastTimeRef.current}`);
          registerPlayback(episodeId, playStartTimeRef.current, lastTimeRef.current)
            .catch(error => console.error("Error recording final playback time:", error));
        }
      }
    };
  }, [episodeId, currentTime, registerPlayback]);

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

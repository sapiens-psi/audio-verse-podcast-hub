
import React from "react";
import { formatTime, formatTimeString } from "./utils";

interface AudioProgressBarProps {
  currentTime: number;
  duration: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  currentTime,
  duration,
  handleSeek,
}) => {
  const currentTimeFormatted = formatTime(currentTime);
  const durationFormatted = formatTime(duration);

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

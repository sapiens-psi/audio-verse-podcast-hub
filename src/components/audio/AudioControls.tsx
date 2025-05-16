
import React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from "lucide-react";

interface AudioControlsProps {
  isPlaying: boolean;
  volume: number;
  togglePlayPause: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  volume,
  togglePlayPause,
  skipBackward,
  skipForward,
  handleVolumeChange,
  toggleMute,
}) => {
  // Render volume icon based on current volume
  const renderVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
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
  );
};

export default AudioControls;


import React from "react";
import { cn } from "@/lib/utils";
import AudioVisualizer from "../audio/AudioVisualizer";
import AudioControls from "../audio/AudioControls";
import AudioProgressBar from "../audio/AudioProgressBar";
import { useAudio } from "@/hooks/use-audio";

interface AudioPlayerProps {
  src: string;
  episodeId?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, episodeId, className }) => {
  const {
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
  } = useAudio({ src, episodeId });

  return (
    <div className={cn("audio-player-container p-4 bg-gradient-to-r from-[#D1173D]/5 to-[#00A9B0]/5 rounded-lg shadow-md border border-[#FFC325]/20", className)}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          // Reset the visualizer and playing state when audio ends
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }}
      />
      
      {/* Audio Visualizer */}
      <AudioVisualizer 
        audioData={audioData}
        isPlaying={isPlaying}
      />
      
      {/* Audio Controls */}
      <AudioControls
        isPlaying={isPlaying}
        volume={volume}
        togglePlayPause={togglePlayPause}
        skipBackward={skipBackward}
        skipForward={skipForward}
        handleVolumeChange={handleVolumeChange}
        toggleMute={toggleMute}
      />
      
      {/* Progress Bar */}
      <AudioProgressBar
        currentTime={currentTime}
        duration={duration}
        handleSeek={handleSeek}
      />
    </div>
  );
};

export default AudioPlayer;

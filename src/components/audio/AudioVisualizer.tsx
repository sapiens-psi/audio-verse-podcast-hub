
import React, { useRef, useEffect } from "react";

interface AudioVisualizerProps {
  audioData: Uint8Array | null;
  isPlaying: boolean;
  height?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  audioData, 
  isPlaying,
  height = 64
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Draw the visualizer when audio data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const canvasHeight = canvas.height;
    
    ctx.clearRect(0, 0, width, canvasHeight);
    
    // Only draw if there's actually data and we're playing
    if (audioData && audioData.length > 0 && isPlaying) {
      const bufferLength = audioData.length;
      const barWidth = width / bufferLength * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (audioData[i] / 255) * canvasHeight / 1.5;
        
        // Color gradient based on Ampla logo colors
        const colors = ['#D1173D', '#F78C3B', '#FFC325', '#00A9B0'];
        const colorIndex = Math.floor((i / bufferLength) * colors.length);
        ctx.fillStyle = colors[colorIndex];
        
        ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }
  }, [audioData, isPlaying]);

  return (
    <div className="h-16 mb-3 bg-black/5 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef}
        width={500}
        height={height}
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
  );
};

export default AudioVisualizer;

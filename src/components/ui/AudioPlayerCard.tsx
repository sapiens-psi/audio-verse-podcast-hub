
import React, { useState, useEffect } from "react";
import AudioPlayer from './AudioPlayer';
import { Headphones, Music, Clock } from "lucide-react";
import { Button } from './button';
import { motion, AnimatePresence } from "framer-motion";

interface AudioPlayerCardProps {
  title: string;
  description?: string;
  audioSrc: string;
  episodeId?: string;
  thumbnail?: string;
  duration?: string;
  author?: string;
  date?: string;
  onClose?: () => void;
  expanded?: boolean;
  className?: string;
}

const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({
  title,
  description,
  audioSrc,
  episodeId,
  thumbnail,
  duration,
  author,
  date,
  onClose,
  expanded = false,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  useEffect(() => {
    if (episodeId) {
      console.log("AudioPlayerCard received episodeId:", episodeId);
    }
  }, [episodeId]);

  return (
    <AnimatePresence>
      <motion.div 
        className={`fixed z-50 ${isExpanded ? "bottom-0 left-0 right-0" : "bottom-4 left-4 right-4 max-w-3xl mx-auto"} ${className}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className={`
          relative rounded-t-xl shadow-xl overflow-hidden
          bg-gradient-to-r from-white/90 to-white/95 backdrop-blur-md border border-white/20
          dark:from-gray-900/90 dark:to-gray-800/95 dark:border-gray-800
        `}>
          {/* Header - Always visible */}
          <div 
            className="flex items-center justify-between p-3 cursor-pointer"
            onClick={toggleExpand}
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-ampla-red to-ampla-orange rounded-lg flex items-center justify-center shadow-sm">
                {thumbnail ? (
                  <img 
                    src={thumbnail} 
                    alt={title} 
                    className="h-full w-full object-cover rounded-lg" 
                  />
                ) : (
                  <Music className="h-6 w-6 text-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">
                  {title}
                </h4>
                {!isExpanded && (
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="truncate max-w-[150px]">{description || "Ampla Podcast"}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isExpanded && duration && (
                <span className="text-xs flex items-center text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {duration}
                </span>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
              >
                <span className="sr-only">{isExpanded ? "Minimizar" : "Expandir"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isExpanded ? (
                    <polyline points="18 15 12 9 6 15"></polyline>
                  ) : (
                    <polyline points="6 9 12 15 18 9"></polyline>
                  )}
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Content - Expanded view */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {description && (
                  <div className="px-4 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{description}</p>
                  </div>
                )}
                
                <div className="p-4 pt-2">
                  <AudioPlayer 
                    src={audioSrc} 
                    episodeId={episodeId} 
                  />
                </div>
                
                {(author || date) && (
                  <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs text-gray-500">
                    {author && (
                      <div className="flex items-center">
                        <Headphones className="h-3 w-3 mr-1" />
                        <span>{author}</span>
                      </div>
                    )}
                    {date && <span>{date}</span>}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioPlayerCard;

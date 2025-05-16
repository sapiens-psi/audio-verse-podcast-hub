
// Helper function to format time
export interface TimeFormat {
  minutes: number;
  seconds: number;
}

export const formatTime = (time: number): TimeFormat => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return { minutes, seconds };
};

// Generate formatted time string (e.g. "3:45")
export const formatTimeString = (time: TimeFormat): string => {
  return `${time.minutes}:${time.seconds.toString().padStart(2, '0')}`;
};

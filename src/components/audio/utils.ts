
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

// Calculate minutes played from time ranges
export const calculateMinutesPlayed = (startTime: number, endTime: number): number => {
  return Math.max(0, (endTime - startTime) / 60);
};

// Format duration in minutes for display
export const formatMinutes = (minutes: number): string => {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} segundos`;
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}min`;
};


import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useEpisodeViews() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Register a new view for an episode using local storage
  const registerView = async (episodeId: string) => {
    try {
      setIsLoading(true);
      
      // Use localStorage as a fallback for view tracking
      const viewsKey = 'podcast_episode_views';
      const storedViews = localStorage.getItem(viewsKey);
      const views = storedViews ? JSON.parse(storedViews) : {};
      
      if (!views[episodeId]) {
        views[episodeId] = 0;
      }
      
      views[episodeId]++;
      localStorage.setItem(viewsKey, JSON.stringify(views));
      
      return { success: true, localStorageFallback: true };
    } catch (error: any) {
      console.error("Erro ao registrar visualização:", error);
      toast({
        title: "Erro ao registrar visualização",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerView,
    isLoading
  };
}

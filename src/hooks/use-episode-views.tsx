
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EpisodeViewCount } from "@/types/views";
import { calculateMinutesPlayed } from "@/components/audio/utils";

export function useEpisodeViews() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Register a new view for an episode
  const registerView = async (episodeId: string) => {
    try {
      setIsLoading(true);
      console.log("Registering view for episode:", episodeId);
      
      // Try to insert into episode_views table
      const { error, data } = await supabase
        .from('episode_views')
        .insert({ 
          episode_id: episodeId,
          viewed_at: new Date().toISOString(),
          minutes_played: 0 // Initialize with zero minutes
        });
      
      if (error) {
        console.error("Database error registering view:", error.message);
        // Fallback to localStorage if database error
        const viewsKey = 'podcast_episode_views';
        const storedViews = localStorage.getItem(viewsKey);
        const views = storedViews ? JSON.parse(storedViews) : {};
        
        if (!views[episodeId]) {
          views[episodeId] = 0;
        }
        
        views[episodeId]++;
        localStorage.setItem(viewsKey, JSON.stringify(views));
        console.log("View saved to localStorage as fallback");
        
        return { success: true, localStorageFallback: true, error: error.message };
      }
      
      console.log("View successfully registered in database:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("Error registering view:", error);
      toast({
        title: "Erro ao registrar visualização",
        description: error.message || "Não foi possível registrar a visualização do episódio",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Register played minutes
  const registerPlayback = async (episodeId: string, startTime: number, endTime: number) => {
    try {
      setIsLoading(true);
      
      const minutesPlayed = calculateMinutesPlayed(startTime, endTime);
      console.log(`Recording ${minutesPlayed} minutes of playback for episode ${episodeId}`);
      
      if (minutesPlayed <= 0) {
        console.log("No minutes played, skipping registration");
        return { success: true, skipped: true };
      }
      
      // Check if a view for this episode exists today
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data: existingViews, error: queryError } = await supabase
        .from('episode_views')
        .select('id, minutes_played')
        .eq('episode_id', episodeId)
        .gte('viewed_at', startOfDay.toISOString())
        .lte('viewed_at', endOfDay.toISOString())
        .order('viewed_at', { ascending: false })
        .limit(1);
      
      if (queryError) {
        console.error("Error querying existing views:", queryError.message);
        return { success: false, error: queryError };
      }
      
      if (existingViews && existingViews.length > 0) {
        // Update existing view
        const currentMinutesPlayed = existingViews[0].minutes_played || 0;
        const newMinutesPlayed = currentMinutesPlayed + minutesPlayed;
        
        console.log(`Updating existing view ${existingViews[0].id}: current minutes: ${currentMinutesPlayed}, adding: ${minutesPlayed}, new total: ${newMinutesPlayed}`);
        
        const { error } = await supabase
          .from('episode_views')
          .update({ 
            minutes_played: newMinutesPlayed
          })
          .eq('id', existingViews[0].id);
          
        if (error) {
          console.error("Error updating minutes played:", error.message);
          return { success: false, error };
        }
        
        console.log("Minutes played updated successfully");
        return { success: true };
      } else {
        // Create new view with minutes played
        console.log("No existing view found today, creating new one with minutes:", minutesPlayed);
        
        const { error } = await supabase
          .from('episode_views')
          .insert({ 
            episode_id: episodeId,
            viewed_at: new Date().toISOString(),
            minutes_played: minutesPlayed
          });
          
        if (error) {
          console.error("Error creating new view with minutes played:", error.message);
          return { success: false, error };
        }
        
        console.log("New view with minutes played created successfully");
        return { success: true };
      }
    } catch (error: any) {
      console.error("Error registering minutes played:", error.message);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Get views by episode
  const getViewsByEpisode = async (): Promise<EpisodeViewCount[]> => {
    setIsLoading(true);
    try {
      console.log("Fetching episode statistics from database");
      
      // Use the aggregate function to get statistics
      const { data: statistics, error } = await supabase
        .rpc('get_episode_statistics');

      if (error) {
        console.error("Error fetching statistics:", error.message);
        throw error;
      }
      
      console.log("Statistics retrieved:", statistics);
      
      // Format to EpisodeViewCount type
      const formattedData = statistics.map((item: any) => ({
        id: item.episode_id,
        title: item.title,
        views: parseInt(item.total_views || '0'),
        minutes_played: parseFloat(item.total_minutes_played || '0'),
        published_at: item.published_at
      }));
      
      return formattedData;
    } catch (error) {
      console.error("Error fetching view statistics:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerView,
    registerPlayback,
    getViewsByEpisode,
    isLoading
  };
}

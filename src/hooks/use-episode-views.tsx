
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EpisodeViewCount } from "@/types/views";
import { calculateMinutesPlayed } from "@/components/audio/utils";

export function useEpisodeViews() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Registrar uma nova visualização para um episódio
  const registerView = async (episodeId: string) => {
    try {
      setIsLoading(true);
      
      // Tenta registrar na tabela episode_views
      const { error } = await supabase
        .from('episode_views')
        .insert({ 
          episode_id: episodeId,
          viewed_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error("Erro ao registrar visualização no banco:", error);
        // Fallback para localStorage se ocorrer erro
        const viewsKey = 'podcast_episode_views';
        const storedViews = localStorage.getItem(viewsKey);
        const views = storedViews ? JSON.parse(storedViews) : {};
        
        if (!views[episodeId]) {
          views[episodeId] = 0;
        }
        
        views[episodeId]++;
        localStorage.setItem(viewsKey, JSON.stringify(views));
        
        return { success: true, localStorageFallback: true };
      }
      
      return { success: true };
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

  // Registrar play count e minutos reproduzidos
  const registerPlayback = async (episodeId: string, startTime: number, endTime: number) => {
    try {
      setIsLoading(true);
      
      const minutesPlayed = calculateMinutesPlayed(startTime, endTime);
      
      // Buscar se já existe uma visualização para esse episódio hoje
      const { data: existingViews } = await supabase
        .from('episode_views')
        .select('id')
        .eq('episode_id', episodeId)
        .gte('viewed_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte('viewed_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
        .order('viewed_at', { ascending: false })
        .limit(1);
      
      if (existingViews && existingViews.length > 0) {
        // Atualizar contagem existente
        const { error } = await supabase
          .from('episode_views')
          .update({ 
            play_count: supabase.rpc('increment', { inc: 1 }),
            minutes_played: supabase.rpc('increment_float', { inc: minutesPlayed })
          })
          .eq('id', existingViews[0].id);
          
        if (error) {
          console.error("Erro ao atualizar play count:", error);
          return { success: false, error };
        }
      } else {
        // Criar nova contagem
        const { error } = await supabase
          .from('episode_views')
          .insert({ 
            episode_id: episodeId,
            viewed_at: new Date().toISOString(),
            play_count: 1,
            minutes_played: minutesPlayed
          });
          
        if (error) {
          console.error("Erro ao registrar play count:", error);
          return { success: false, error };
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao registrar play count:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Obter visualizações por episódio
  const getViewsByEpisode = async (): Promise<EpisodeViewCount[]> => {
    setIsLoading(true);
    try {
      // Usar a função de agregação para obter estatísticas
      const { data: statistics, error } = await supabase
        .rpc('get_episode_statistics');

      if (error) {
        console.error("Erro ao buscar estatísticas:", error);
        throw error;
      }
      
      // Formatar para o tipo EpisodeViewCount
      const formattedData = statistics.map((item: any) => ({
        id: item.episode_id,
        title: item.title,
        views: parseInt(item.total_views || '0'),
        play_count: parseInt(item.total_play_count || '0'),
        minutes_played: parseFloat(item.total_minutes_played || '0'),
        published_at: item.published_at
      }));
      
      return formattedData;
    } catch (error) {
      console.error("Erro ao buscar visualizações:", error);
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

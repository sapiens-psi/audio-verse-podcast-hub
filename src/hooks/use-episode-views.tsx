
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
      console.log("Registrando visualização para episódio:", episodeId);
      
      // Tenta registrar na tabela episode_views
      const { error, data } = await supabase
        .from('episode_views')
        .insert({ 
          episode_id: episodeId,
          viewed_at: new Date().toISOString(),
        })
        .select();
      
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
      
      console.log("Visualização registrada com sucesso:", data);
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

  // Registrar minutos reproduzidos
  const registerPlayback = async (episodeId: string, startTime: number, endTime: number) => {
    try {
      setIsLoading(true);
      
      const minutesPlayed = calculateMinutesPlayed(startTime, endTime);
      console.log(`Registrando ${minutesPlayed} minutos de reprodução para episódio ${episodeId}`);
      
      // Buscar se já existe uma visualização para esse episódio hoje
      const { data: existingViews } = await supabase
        .from('episode_views')
        .select('id, minutes_played')
        .eq('episode_id', episodeId)
        .gte('viewed_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte('viewed_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
        .order('viewed_at', { ascending: false })
        .limit(1);
      
      if (existingViews && existingViews.length > 0) {
        // Calculando os novos valores para atualizar
        const currentMinutesPlayed = existingViews[0].minutes_played || 0;
        const newMinutesPlayed = currentMinutesPlayed + minutesPlayed;
        
        console.log(`Atualizando visualização existente: ${existingViews[0].id}, minutos atuais: ${currentMinutesPlayed}, novos minutos: ${newMinutesPlayed}`);
        
        // Atualizar minutos reproduzidos
        const { error } = await supabase
          .from('episode_views')
          .update({ 
            minutes_played: newMinutesPlayed
          })
          .eq('id', existingViews[0].id);
          
        if (error) {
          console.error("Erro ao atualizar minutos reproduzidos:", error);
          return { success: false, error };
        }
      } else {
        // Criar nova visualização com minutos reproduzidos
        console.log("Criando nova visualização com minutos reproduzidos:", minutesPlayed);
        const { error } = await supabase
          .from('episode_views')
          .insert({ 
            episode_id: episodeId,
            viewed_at: new Date().toISOString(),
            minutes_played: minutesPlayed
          });
          
        if (error) {
          console.error("Erro ao registrar minutos reproduzidos:", error);
          return { success: false, error };
        }
      }
      
      console.log("Minutos reproduzidos registrados com sucesso");
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao registrar minutos reproduzidos:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Obter visualizações por episódio
  const getViewsByEpisode = async (): Promise<EpisodeViewCount[]> => {
    setIsLoading(true);
    try {
      console.log("Buscando estatísticas de episódios");
      // Usar a função de agregação para obter estatísticas
      const { data: statistics, error } = await supabase
        .rpc('get_episode_statistics');

      if (error) {
        console.error("Erro ao buscar estatísticas:", error);
        throw error;
      }
      
      console.log("Estatísticas obtidas:", statistics);
      
      // Formatar para o tipo EpisodeViewCount
      const formattedData = statistics.map((item: any) => ({
        id: item.episode_id,
        title: item.title,
        views: parseInt(item.total_views || '0'),
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

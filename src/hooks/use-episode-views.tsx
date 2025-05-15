
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useEpisodeViews() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Registrar uma nova visualização para um episódio
  const registerView = async (episodeId: string) => {
    try {
      setIsLoading(true);
      
      // Verificamos se esta tabela existe primeiro
      const { error: tableCheckError } = await supabase
        .from('episode_views')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      
      // Se a tabela não existir, tentamos criá-la
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        console.log('Tabela de visualizações não existe, usando uma alternativa temporária');
        
        // Armazenamos em localStorage como fallback
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
      
      // Se a tabela existe, registramos a visualização
      const { error } = await supabase
        .from('episode_views')
        .insert([{ episode_id: episodeId }]);
      
      if (error) throw error;
      
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

  return {
    registerView,
    isLoading
  };
}

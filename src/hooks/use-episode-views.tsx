
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EpisodeViewCount } from "@/types/views";

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

  // Obter visualizações por episódio
  const getViewsByEpisode = async (): Promise<EpisodeViewCount[]> => {
    setIsLoading(true);
    try {
      // Buscar visualizações do banco de dados agrupadas por episódio
      const { data: dbViews, error } = await supabase
        .from('episode_views')
        .select('episode_id, episodes(id, titulo, publicado_em)')
        .order('episode_id');

      if (error) {
        console.error("Erro ao buscar visualizações:", error);
        throw error;
      }

      // Processar dados para contar visualizações por episódio
      const countMap: Record<string, {count: number; title: string; published_at: string}> = {};
      
      if (dbViews) {
        dbViews.forEach((view: any) => {
          const episodeId = view.episode_id;
          if (!countMap[episodeId]) {
            countMap[episodeId] = {
              count: 0,
              title: view.episodes?.titulo || `Episódio ${episodeId.slice(0, 8)}`,
              published_at: view.episodes?.publicado_em || new Date().toISOString()
            };
          }
          countMap[episodeId].count += 1;
        });
      }
      
      // Também carregar visualizações do localStorage como fallback
      const viewsKey = 'podcast_episode_views';
      const storedViews = localStorage.getItem(viewsKey);
      const localViews = storedViews ? JSON.parse(storedViews) : {};
      
      // Combinar dados do banco com dados do localStorage
      const { data: episodes } = await supabase
        .from('episodes')
        .select('id, titulo, publicado_em');
      
      const episodesMap: {[key: string]: {title: string, published_at: string}} = {};
      if (episodes) {
        episodes.forEach((ep: any) => {
          episodesMap[ep.id] = {
            title: ep.titulo,
            published_at: ep.publicado_em
          };
        });
      }
      
      // Adicionar visualizações do localStorage que não estejam no banco
      Object.keys(localViews).forEach(episodeId => {
        if (!countMap[episodeId] && episodesMap[episodeId]) {
          countMap[episodeId] = {
            count: localViews[episodeId],
            title: episodesMap[episodeId].title || `Episódio ${episodeId.slice(0, 8)}`,
            published_at: episodesMap[episodeId].published_at || new Date().toISOString()
          };
        } else if (countMap[episodeId]) {
          // Somar visualizações do localStorage às do banco
          countMap[episodeId].count += localViews[episodeId] || 0;
        }
      });
      
      // Formatar para o tipo EpisodeViewCount
      const formattedData = Object.keys(countMap).map(id => ({
        id,
        title: countMap[id].title,
        views: countMap[id].count,
        published_at: countMap[id].published_at
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
    getViewsByEpisode,
    isLoading
  };
}

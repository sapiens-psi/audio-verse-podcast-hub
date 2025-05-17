
import { useEffect, useState } from "react";
import { Loader2, Eye, Clock } from "lucide-react";
import { EpisodeViewCount } from "@/types/views";
import { useEpisodeViews } from "@/hooks/use-episode-views";
import { useToast } from "@/hooks/use-toast";
import { formatMinutes } from "@/components/audio/utils";
import { StatCard } from "@/components/stats/StatCard";
import { ViewsBarChart } from "@/components/stats/ViewsBarChart";
import { PlaytimePieChart } from "@/components/stats/PlaytimePieChart";
import { EpisodeStatsTable } from "@/components/stats/EpisodeStatsTable";

const ViewsPage = () => {
  const [viewsData, setViewsData] = useState<EpisodeViewCount[]>([]);
  const { getViewsByEpisode, isLoading } = useEpisodeViews();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getViewsByEpisode();
        console.log("View data retrieved:", data);
        setViewsData(data);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro ao buscar visualizações",
          description: error.message || "Não foi possível carregar os dados de visualizações",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, []);

  // Calculate total minutes played
  const totalMinutesPlayed = viewsData.reduce((total, item) => total + (item.minutes_played || 0), 0);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-podcast animate-spin mr-2" />
        <p className="text-gray-500">Carregando dados de visualizações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Estatísticas de Episódios</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Total de Visualizações" 
          value={viewsData.reduce((sum, item) => sum + item.views, 0)} 
          icon={Eye} 
        />
        
        <StatCard 
          title="Tempo Total Reproduzido" 
          value={formatMinutes(totalMinutesPlayed)} 
          icon={Clock} 
        />
      </div>

      {/* Views Chart */}
      <ViewsBarChart viewsData={viewsData} />

      {/* Minutes Played Chart */}
      <PlaytimePieChart viewsData={viewsData} />

      {/* Detailed Table */}
      <EpisodeStatsTable viewsData={viewsData} />
    </div>
  );
}

export default ViewsPage;

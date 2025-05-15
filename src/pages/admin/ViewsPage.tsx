
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { EpisodeViewCount } from "@/types/views";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useEpisodeViews } from "@/hooks/use-episode-views";
import { useToast } from "@/hooks/use-toast";

const ViewsPage = () => {
  const [viewsData, setViewsData] = useState<EpisodeViewCount[]>([]);
  const { getViewsByEpisode, isLoading } = useEpisodeViews();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getViewsByEpisode();
        setViewsData(data);
      } catch (error: any) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro ao buscar visualizações",
          description: error.message || "Não foi possível carregar os dados de visualizações",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, []);

  // Prepare chart data
  const chartData = viewsData
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  
  // Format episode name for chart
  const formatEpisodeName = (name: string) => {
    return name.length > 20 ? `${name.substring(0, 20)}...` : name;
  };

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
        <h1 className="text-3xl font-bold text-gray-800">Visualizações de Episódios</h1>
      </div>

      <Card className="overflow-hidden shadow-md">
        <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
          <CardTitle className="text-gray-800">Top 10 Episódios</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80">
            {viewsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={formatEpisodeName}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Visualizações']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Bar dataKey="views" name="Visualizações" fill="#9E07C0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Nenhum dado de visualização disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
          <CardTitle className="text-gray-800">Lista de Visualizações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Episódio</th>
                  <th className="px-6 py-3">Data de Publicação</th>
                  <th className="px-6 py-3">Visualizações</th>
                </tr>
              </thead>
              <tbody>
                {viewsData.length > 0 ? (
                  viewsData.map((item) => (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-xs">
                        {item.title}
                      </td>
                      <td className="px-6 py-4">
                        {item.published_at ? format(new Date(item.published_at), 'PPP', { locale: ptBR }) : 'Data desconhecida'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-podcast">{item.views}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white border-b">
                    <td colSpan={3} className="px-6 py-4 text-center">
                      Nenhum dado de visualização disponível
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ViewsPage;

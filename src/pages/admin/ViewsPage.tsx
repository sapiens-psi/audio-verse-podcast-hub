
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { EpisodeViewCount } from "@/types/views";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Eye, Clock } from "lucide-react";
import { useEpisodeViews } from "@/hooks/use-episode-views";
import { useToast } from "@/hooks/use-toast";
import { formatMinutes } from "@/components/audio/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  // Prepare chart data for views
  const viewsChartData = viewsData
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Prepare chart data for minutes played
  const minutesPlayedData = viewsData
    .sort((a, b) => (b.minutes_played || 0) - (a.minutes_played || 0))
    .slice(0, 5);

  // Calculate total minutes played
  const totalMinutesPlayed = viewsData.reduce((total, item) => total + (item.minutes_played || 0), 0);
  
  // Format episode name for chart
  const formatEpisodeName = (name: string) => {
    return name.length > 20 ? `${name.substring(0, 20)}...` : name;
  };

  // Color configuration for the charts
  const COLORS = ['#9E07C0', '#D1173D', '#FFC325', '#00A9B0', '#6b7280'];

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
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
            <CardTitle className="text-gray-800 flex items-center">
              <span className="w-8 h-8 rounded-full bg-podcast/10 flex items-center justify-center mr-2">
                <Eye className="h-4 w-4 text-podcast" />
              </span>
              Total de Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-podcast">
              {viewsData.reduce((sum, item) => sum + item.views, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
            <CardTitle className="text-gray-800 flex items-center">
              <span className="w-8 h-8 rounded-full bg-podcast/10 flex items-center justify-center mr-2">
                <Clock className="h-4 w-4 text-podcast" />
              </span>
              Tempo Total Reproduzido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-podcast">
              {formatMinutes(totalMinutesPlayed)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Views Chart */}
      <Card className="overflow-hidden shadow-md">
        <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
          <CardTitle className="text-gray-800">Top 10 Episódios por Visualizações</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80">
            {viewsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={viewsChartData}
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

      {/* Minutes Played Chart */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
          <CardTitle className="text-gray-800">Top 5 Episódios por Tempo Reproduzido</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80">
            {minutesPlayedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={minutesPlayedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ title, minutes_played }) => 
                      `${formatEpisodeName(title || '')}: ${formatMinutes(minutes_played || 0)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="minutes_played"
                  >
                    {minutesPlayedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatMinutes(value as number), 'Tempo']}
                    labelFormatter={(index) => {
                      const entry = minutesPlayedData[index as number];
                      return entry ? entry.title : '';
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Nenhum dado de tempo reproduzido disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
          <CardTitle className="text-gray-800">Estatísticas Detalhadas por Episódio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Episódio</TableHead>
                  <TableHead>Data de Publicação</TableHead>
                  <TableHead>Visualizações</TableHead>
                  <TableHead>Tempo Reproduzido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewsData.length > 0 ? (
                  viewsData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-gray-900 truncate max-w-xs">
                        {item.title}
                      </TableCell>
                      <TableCell>
                        {item.published_at ? format(new Date(item.published_at), 'PPP', { locale: ptBR }) : 'Data desconhecida'}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-podcast">{item.views}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-podcast">{formatMinutes(item.minutes_played || 0)}</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhum dado de visualização disponível
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ViewsPage;

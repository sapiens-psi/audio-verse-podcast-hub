
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { EpisodeViewCount } from "@/types/views";

interface ViewsBarChartProps {
  viewsData: EpisodeViewCount[];
}

export const ViewsBarChart = ({ viewsData }: ViewsBarChartProps) => {
  // Format episode name for chart
  const formatEpisodeName = (name: string) => {
    return name?.length > 20 ? `${name.substring(0, 20)}...` : name || '';
  };

  // Prepare chart data for views
  const chartData = viewsData
    ?.filter(item => item && typeof item.views === 'number')
    ?.sort((a, b) => b.views - a.views)
    ?.slice(0, 10) || [];

  return (
    <Card className="overflow-hidden shadow-md">
      <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
        <CardTitle className="text-gray-800">Top 10 Episódios por Visualizações</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80">
          {chartData.length > 0 ? (
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
                  formatter={(value: any) => [value, 'Visualizações']}
                  labelFormatter={(label: any) => `${label}`}
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
  );
};

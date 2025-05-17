
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";
import { EpisodeViewCount } from "@/types/views";
import { formatMinutes } from "@/components/audio/utils";

interface PlaytimePieChartProps {
  viewsData: EpisodeViewCount[];
}

export const PlaytimePieChart = ({ viewsData }: PlaytimePieChartProps) => {
  // Format episode name for chart
  const formatEpisodeName = (name: string) => {
    return name.length > 20 ? `${name.substring(0, 20)}...` : name;
  };

  // Prepare chart data for minutes played
  const chartData = viewsData
    .sort((a, b) => (b.minutes_played || 0) - (a.minutes_played || 0))
    .slice(0, 5);

  // Color configuration for the charts
  const COLORS = ['#9E07C0', '#D1173D', '#FFC325', '#00A9B0', '#6b7280'];

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
        <CardTitle className="text-gray-800">Top 5 Episódios por Tempo Reproduzido</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ title, minutes_played }: any) => 
                    `${formatEpisodeName(title || '')}: ${formatMinutes(minutes_played || 0)}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="minutes_played"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatMinutes(value as number), 'Tempo']}
                  labelFormatter={(index: any) => {
                    const entry = chartData[index as number];
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
  );
};

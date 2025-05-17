
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import { EpisodeViewCount } from "@/types/views";
import { formatMinutes } from "@/components/audio/utils";

interface PlaytimePieChartProps {
  viewsData: EpisodeViewCount[];
}

export const PlaytimePieChart = ({ viewsData }: PlaytimePieChartProps) => {
  // Format episode name for chart
  const formatEpisodeName = (name: string) => {
    return name?.length > 20 ? `${name.substring(0, 20)}...` : name || '';
  };

  // Filter out entries with no minutes played or undefined data
  const validData = viewsData?.filter(item => 
    item && 
    typeof item.minutes_played === 'number' && 
    item.minutes_played > 0
  ) || [];
  
  // Prepare chart data for minutes played
  const chartData = validData
    .sort((a, b) => (b.minutes_played || 0) - (a.minutes_played || 0))
    .slice(0, 5)
    .map(item => ({
      ...item,
      name: item.title || 'Sem título',
      value: item.minutes_played || 0
    }));

  // Color configuration for the charts
  const COLORS = ['#9E07C0', '#D1173D', '#FFC325', '#00A9B0', '#6b7280'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (!chartData[index]) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${formatEpisodeName(chartData[index].name)} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

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
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatMinutes(value as number), 'Tempo']}
                  labelFormatter={(name: any) => `${name}`}
                />
                <Legend 
                  formatter={(value, entry, index) => formatEpisodeName(value)}
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


import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EpisodeViewCount } from "@/types/views";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatMinutes } from "@/components/audio/utils";

interface EpisodeStatsTableProps {
  viewsData: EpisodeViewCount[];
}

export const EpisodeStatsTable = ({ viewsData }: EpisodeStatsTableProps) => {
  return (
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
  );
};


import { useState, useEffect } from "react";
import { getEpisodes, deleteEpisode } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { Episode } from "@/components/episodes/EpisodeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash, Search, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EpisodeList = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEpisodes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEpisodes(episodes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = episodes.filter(
      episode => 
        episode.titulo.toLowerCase().includes(query) || 
        episode.categoria.toLowerCase().includes(query)
    );
    setFilteredEpisodes(filtered);
  }, [searchQuery, episodes]);

  const loadEpisodes = () => {
    const allEpisodes = getEpisodes();
    setEpisodes(allEpisodes);
    setFilteredEpisodes(allEpisodes);
  };

  const confirmDelete = (episodeId: string) => {
    setEpisodeToDelete(episodeId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!episodeToDelete) return;
    
    try {
      const deletedEpisode = deleteEpisode(episodeToDelete);
      loadEpisodes();
      toast({
        title: "Episódio excluído com sucesso",
        description: `"${deletedEpisode?.titulo}" foi removido.`,
      });
    } catch (error) {
      console.error("Erro ao excluir episódio:", error);
      toast({
        title: "Erro ao excluir episódio",
        description: "Ocorreu um erro ao tentar excluir o episódio.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setEpisodeToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Gerenciar Episódios</h1>
        <Button asChild>
          <Link to="/admin/episodes/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Episódio
          </Link>
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por título ou categoria..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14"></TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="hidden lg:table-cell">Data de Publicação</TableHead>
              <TableHead className="w-[150px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEpisodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum episódio encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredEpisodes.map((episode) => (
                <TableRow key={episode.id}>
                  <TableCell>
                    <img 
                      src={episode.capa} 
                      alt={episode.titulo}
                      className="w-10 h-10 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{episode.titulo}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-podcast-light text-podcast">
                      {episode.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(episode.publicado_em).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/episodes/${episode.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/episodes/${episode.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => confirmDelete(episode.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este episódio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EpisodeList;

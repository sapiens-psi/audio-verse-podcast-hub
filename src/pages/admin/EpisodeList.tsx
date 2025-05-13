
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Episode } from "@/components/episodes/EpisodeCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EpisodeList = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .order("publicado_em", { ascending: false });
      
      if (error) throw error;
      setEpisodes(data || []);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os episódios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este episódio?")) {
      try {
        const { error } = await supabase
          .from("episodes")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Episódio excluído com sucesso",
        });
        
        // Refresh the episodes list
        fetchEpisodes();
      } catch (error) {
        console.error("Error deleting episode:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o episódio",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Episódios</CardTitle>
        <Button asChild>
          <Link to="/admin/episodes/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Episódio
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center p-8">Carregando episódios...</div>
        ) : episodes.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">Nenhum episódio encontrado</p>
            <Button asChild>
              <Link to="/admin/episodes/new">
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Episódio
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="flex items-center justify-between border rounded-md p-4"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={episode.capa} alt={episode.titulo} />
                    <AvatarFallback>{episode.titulo.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{episode.titulo}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(episode.publicado_em), "PPP", { locale: ptBR })} • {episode.categoria}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/episodes/${episode.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(episode.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EpisodeList;

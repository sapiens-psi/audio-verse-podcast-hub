
import { useState, useEffect } from "react";
import { getEpisodes, getCategories } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";

const Dashboard = () => {
  const [episodeCount, setEpisodeCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [recentEpisodes, setRecentEpisodes] = useState<any[]>([]);

  useEffect(() => {
    // Get data for dashboard
    const episodes = getEpisodes();
    const categories = getCategories();
    
    setEpisodeCount(episodes.length);
    setCategoryCount(categories.length);
    
    // Get 5 most recent episodes
    const sortedEpisodes = [...episodes].sort(
      (a, b) => new Date(b.publicado_em).getTime() - new Date(a.publicado_em).getTime()
    ).slice(0, 5);
    
    setRecentEpisodes(sortedEpisodes);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Total de Episódios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{episodeCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categoryCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link to="/admin/episodes/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Episódio
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/admin/episodes">
                <List className="mr-2 h-4 w-4" />
                Listar Todos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Episódios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEpisodes.length === 0 ? (
              <p className="text-gray-500">Nenhum episódio disponível</p>
            ) : (
              recentEpisodes.map((episode) => (
                <div key={episode.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <img 
                      src={episode.capa} 
                      alt={episode.titulo} 
                      className="w-12 h-12 object-cover rounded mr-4"
                    />
                    <div>
                      <h3 className="font-medium">{episode.titulo}</h3>
                      <p className="text-sm text-gray-500">{episode.categoria} • {new Date(episode.publicado_em).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/admin/episodes/${episode.id}`}>Editar</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/episodes/${episode.id}`} target="_blank">Visualizar</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

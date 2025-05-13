
import { useState, useEffect } from "react";
import EpisodeCard, { Episode } from "@/components/episodes/EpisodeCard";
import { getEpisodes, getCategories, searchEpisodes } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Index = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    // Get all episodes and categories on component mount
    const allEpisodes = getEpisodes();
    setEpisodes(allEpisodes);
    setFilteredEpisodes(allEpisodes);
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "" && !selectedCategory) {
      setFilteredEpisodes(episodes);
      return;
    }

    const results = searchEpisodes(searchQuery, selectedCategory || undefined);
    setFilteredEpisodes(results);
  }, [searchQuery, selectedCategory, episodes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(prevCategory => prevCategory === category ? "" : category);
  };

  return (
    <div className="container py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-podcast-background">PodcastApp</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Bem-vindo ao nosso podcast! Aqui você encontra os melhores episódios sobre os mais diversos assuntos.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar episódios..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button 
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(category)}
                className={selectedCategory === category ? "bg-podcast hover:bg-podcast-dark" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredEpisodes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">Nenhum episódio encontrado</h3>
          <p className="text-gray-500 mt-2">Tente modificar sua busca ou filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEpisodes.map(episode => (
            <div key={episode.id} className="h-full">
              <EpisodeCard episode={episode} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;

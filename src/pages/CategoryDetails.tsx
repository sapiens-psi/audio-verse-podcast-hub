
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Category } from "@/components/categories/CategoryCard";
import { Episode } from "@/components/episodes/EpisodeCard";
import EpisodeCard from "@/components/episodes/EpisodeCard";

const CategoryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID da categoria não encontrado");
      setLoading(false);
      return;
    }

    const fetchCategoryAndEpisodes = async () => {
      try {
        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("id", id)
          .single();

        if (categoryError) throw categoryError;
        if (!categoryData) {
          setError("Categoria não encontrada");
          setLoading(false);
          return;
        }

        setCategory(categoryData);

        // Fetch episodes for this category
        const { data: episodesData, error: episodesError } = await supabase
          .from("episodes")
          .select("*")
          .eq("category_id", id)
          .order("publicado_em", { ascending: false });

        if (episodesError) throw episodesError;
        setEpisodes(episodesData || []);
      } catch (err) {
        setError("Erro ao carregar os dados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndEpisodes();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1"></div>
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1" style={{ animationDelay: "300ms" }}></div>
        <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1" style={{ animationDelay: "600ms" }}></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-500">{error}</h2>
        <Button asChild>
          <Link to="/">Voltar para a página inicial</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        asChild 
        className="mb-4 pl-0 hover:bg-transparent hover:text-podcast"
      >
        <Link to="/" className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
      </Button>

      <div className="mb-8">
        <div className="relative h-64 rounded-xl overflow-hidden mb-6">
          <img 
            src={category.imagem} 
            alt={category.titulo} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-white">{category.titulo}</h1>
            </div>
          </div>
        </div>
        
        <div className="prose max-w-none mb-8">
          <p className="text-lg text-gray-700">{category.descricao}</p>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Episódios</h2>
        
        {episodes.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-gray-50">
            <p className="text-gray-500">Nenhum episódio encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {episodes.map(episode => (
              <div key={episode.id} className="h-full">
                <EpisodeCard episode={episode} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetails;

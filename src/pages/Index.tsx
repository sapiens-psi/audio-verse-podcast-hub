
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import CategoryCard, { Category } from "@/components/categories/CategoryCard";

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data) {
        setCategories(data);
        setFilteredCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
      return;
    }

    const results = categories.filter(category =>
      category.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(results);
  }, [searchQuery, categories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar categorias..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1"></div>
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1" style={{ animationDelay: "300ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-podcast animate-pulse-light mx-1" style={{ animationDelay: "600ms" }}></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">Nenhuma categoria encontrada</h3>
          <p className="text-gray-500 mt-2">Tente modificar sua busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <div key={category.id} className="h-full">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;

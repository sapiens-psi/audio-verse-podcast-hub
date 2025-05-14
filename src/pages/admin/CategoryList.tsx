
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/components/categories/CategoryCard";

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
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
        setCategories(data as Category[]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }
    
    try {
      // First check if there are episodes using this category
      const { data: episodes, error: checkError } = await supabase
        .from("episodes")
        .select("id")
        .eq("category_id", id);
        
      if (checkError) throw checkError;
      
      if (episodes && episodes.length > 0) {
        toast({
          title: "Operação não permitida",
          description: "Esta categoria possui episódios vinculados. Remova os episódios primeiro.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setCategories(categories.filter(category => category.id !== id));
      
      toast({
        title: "Sucesso!",
        description: "Categoria excluída com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categorias</CardTitle>
        <Button asChild>
          <Link to="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1"></div>
            <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "300ms" }}></div>
            <div className="w-3 h-3 rounded-full bg-podcast animate-pulse mx-1" style={{ animationDelay: "600ms" }}></div>
          </div>
        ) : (
          <>
            {categories.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Nenhuma categoria encontrada.</p>
                <Button className="mt-4" asChild>
                  <Link to="/admin/categories/new">
                    <Plus className="mr-2 h-4 w-4" /> Criar Categoria
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.titulo}</TableCell>
                      <TableCell className="max-w-sm">
                        <p className="truncate">{category.descricao}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/categories/${category.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryList;

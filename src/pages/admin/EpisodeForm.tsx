
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Category } from "@/components/categories/CategoryCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  audio: z.string().url("Forneça uma URL válida para o áudio"),
  capa: z.string().url("Forneça uma URL válida para a imagem de capa"),
  publicado_em: z.string().min(1, "A data de publicação é obrigatória"),
  categoria: z.string().min(1, "A categoria é obrigatória"),
  categoria_id: z.string().uuid("Selecione uma categoria válida"),
});

type FormValues = z.infer<typeof formSchema>;

const EpisodeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      audio: "",
      capa: "",
      publicado_em: new Date().toISOString().split("T")[0],
      categoria: "",
      categoria_id: "",
    },
  });

  useEffect(() => {
    // Fetch categories for dropdown
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("titulo", { ascending: true });
        
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
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch episode data if editing
    if (id) {
      const fetchEpisode = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("episodes")
            .select("*")
            .eq("id", id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            // Find the category details based on categoria_id
            const categoryDetails = categories.find(cat => cat.id === data.categoria_id);
            
            const formattedDate = new Date(data.publicado_em).toISOString().split("T")[0];
            form.reset({
              titulo: data.titulo,
              descricao: data.descricao,
              audio: data.audio,
              // If capa is stored in a separate metadata field or needs to be derived, adjust accordingly
              capa: data.capa || "", // This might need to be adjusted based on actual data structure
              publicado_em: formattedDate,
              categoria: categoryDetails?.titulo || "",
              categoria_id: data.categoria_id,
            });
          }
        } catch (error) {
          console.error("Error fetching episode:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do episódio",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEpisode();
    }
  }, [id, form, categories]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para realizar esta ação",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const episodeData = {
        titulo: values.titulo,
        descricao: values.descricao,
        audio: values.audio,
        capa: values.capa, // This might need to be handled differently if not in the database schema
        publicado_em: values.publicado_em,
        categoria_id: values.categoria_id,
        // Not saving categoria as it's derived from categoria_id
      };
      
      if (id) {
        // Update existing episode
        const { error } = await supabase
          .from("episodes")
          .update(episodeData)
          .eq("id", id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Episódio atualizado com sucesso!",
        });
      } else {
        // Create new episode
        const { error } = await supabase
          .from("episodes")
          .insert([{
            ...episodeData,
            user_id: user.id
          }]);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Novo episódio criado com sucesso!",
        });
      }
      
      navigate("/admin/episodes");
    } catch (error: any) {
      console.error("Error saving episode:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o episódio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{id ? "Editar Episódio" : "Novo Episódio"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do episódio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do episódio" rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="audio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Áudio</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="capa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Capa</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="publicado_em"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Publicação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag da Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Categoria" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Este campo é preenchido automaticamente quando você seleciona uma categoria abaixo.
                    </p>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Auto-set the categoria field based on the selected category
                      const selectedCategory = categories.find(cat => cat.id === value);
                      if (selectedCategory) {
                        form.setValue("categoria", selectedCategory.titulo);
                      }
                    }} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/episodes")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EpisodeForm;

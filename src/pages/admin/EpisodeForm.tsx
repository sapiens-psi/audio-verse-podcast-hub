
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEpisodeById, addEpisode, updateEpisode } from "@/lib/mockData";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Form schema for validation
const episodeFormSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  audio: z.string().url("URL inválida para o áudio"),
  capa: z.string().url("URL inválida para a imagem de capa"),
  publicado_em: z.string(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
});

type EpisodeFormValues = z.infer<typeof episodeFormSchema>;

const EpisodeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(id);

  // Form setup with default values
  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeFormSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      audio: "",
      capa: "",
      publicado_em: format(new Date(), "yyyy-MM-dd"),
      categoria: "",
    },
  });

  // Load episode data if we're in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      try {
        const episode = getEpisodeById(id);
        if (episode) {
          form.reset({
            titulo: episode.titulo,
            descricao: episode.descricao,
            audio: episode.audio,
            capa: episode.capa,
            publicado_em: episode.publicado_em,
            categoria: episode.categoria,
          });
        } else {
          toast({
            title: "Erro",
            description: "Episódio não encontrado",
            variant: "destructive",
          });
          navigate("/admin/episodes");
        }
      } catch (error) {
        console.error("Erro ao carregar episódio:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do episódio",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [id, isEditMode, navigate, toast, form]);

  const onSubmit = async (values: EpisodeFormValues) => {
    setIsLoading(true);
    
    try {
      if (isEditMode && id) {
        // Update existing episode
        updateEpisode(id, values);
        toast({
          title: "Sucesso!",
          description: "Episódio atualizado com sucesso!",
        });
      } else {
        // Create new episode
        addEpisode(values);
        toast({
          title: "Sucesso!",
          description: "Novo episódio criado com sucesso!",
        });
      }
      
      navigate("/admin/episodes");
    } catch (error) {
      console.error("Erro ao salvar episódio:", error);
      toast({
        title: "Erro",
        description: "Houve um erro ao salvar o episódio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? "Editar Episódio" : "Novo Episódio"}
      </h1>

      <div className="bg-white p-6 rounded-lg border">
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
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tecnologia, Saúde, Educação" {...field} />
                  </FormControl>
                  <FormDescription>
                    Categoria ou tema principal do episódio
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                name="capa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem de Capa</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="audio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Arquivo de Áudio</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/audio.mp3" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL do arquivo de áudio no formato MP3
                  </FormDescription>
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
                    <Textarea 
                      placeholder="Descrição detalhada do episódio..." 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.getValues("capa") && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Preview da capa:</h3>
                <img 
                  src={form.getValues("capa")} 
                  alt="Preview da capa" 
                  className="max-h-40 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Imagem+Inválida";
                  }}
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/episodes")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : isEditMode ? "Atualizar Episódio" : "Criar Episódio"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EpisodeForm;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Play, Pause, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AudioPlayerCard from "@/components/ui/AudioPlayerCard";

// Importar a fonte Montserrat do Google Fonts
const fontUrl = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap";

interface Category {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
}

interface Episode {
  id: string;
  titulo: string;
  descricao: string;
  audio: string;
  publicado_em: string;
  categoria_id: string;
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{id: string, url: string, title: string, description: string} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchEpisodes();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("titulo");
    if (!error && data) setCategories(data);
    setIsLoading(false);
  };

  const fetchEpisodes = async () => {
    const { data, error } = await supabase
      .from("episodes")
      .select("id, titulo, descricao, audio, publicado_em, categoria_id, created_at")
      .order("publicado_em", { ascending: false });
    if (!error && data) setEpisodes(data);
    setIsLoading(false);
  };

  const handlePlayPause = (episode: Episode) => {
    if (currentlyPlaying?.id === episode.id) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying({
        id: episode.id,
        url: episode.audio,
        title: episode.titulo,
        description: episode.descricao
      });
    }
  };

  const getEpisodesByCategory = (categoryId: string) => {
    return episodes.filter(episode => episode.categoria_id === categoryId);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden pb-20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Google Fonts */}
      <link href={fontUrl} rel="stylesheet" />
      
      {/* Background animado colorido inspirado em podcast/som */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D1173D" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#F78C3B" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#00A9B0" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="20" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Background base */}
          <rect width="100%" height="100%" fill="url(#bg-gradient)" />
          
          {/* Círculos animados representando ondas sonoras */}
          <g>
            {[...Array(5)].map((_, i) => (
              <motion.circle
                key={`circle-large-${i}`}
                cx="50%"
                cy="30%"
                r={100 + i * 50}
                fill="none"
                stroke="#D1173D"
                strokeWidth="1"
                strokeOpacity={0.2 - i * 0.03}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: 4 + i * 0.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.7
                }}
              />
            ))}
          </g>
          
          {/* Ondas sonoras laterais */}
          <g transform="translate(75%, 70%)">
            {[...Array(8)].map((_, i) => (
              <motion.rect
                key={`wave-right-${i}`}
                x={-5}
                y={-40 + i * 12}
                width="10"
                height="8"
                rx="4"
                fill="#FFC325"
                initial={{ scaleY: 0.2, opacity: 0.3 }}
                animate={{ 
                  scaleY: [0.2, 1, 0.2],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.07
                }}
              />
            ))}
          </g>
          
          <g transform="translate(25%, 40%)">
            {[...Array(8)].map((_, i) => (
              <motion.rect
                key={`wave-left-${i}`}
                x={-5}
                y={-40 + i * 12}
                width="10"
                height="8"
                rx="4"
                fill="#00A9B0"
                initial={{ scaleY: 0.2, opacity: 0.3 }}
                animate={{ 
                  scaleY: [0.2, 1, 0.2],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1
                }}
              />
            ))}
          </g>
          
          {/* Partículas flutuantes */}
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={`particle-${i}`}
              cx={`${Math.random() * 100}%`}
              cy={`${Math.random() * 100}%`}
              r={2 + Math.random() * 4}
              fill={['#D1173D', '#F78C3B', '#FFC325', '#00A9B0'][Math.floor(Math.random() * 4)]}
              opacity={0.2 + Math.random() * 0.3}
              initial={{ 
                x: -20 + Math.random() * 40, 
                y: -20 + Math.random() * 40,
                opacity: 0.1
              }}
              animate={{ 
                x: 20 + Math.random() * 40, 
                y: 20 + Math.random() * 40,
                opacity: 0.5
              }}
              transition={{ 
                duration: 5 + Math.random() * 10, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Ondas sonoras centrais */}
          <g transform="translate(50%, 85%)">
            {[...Array(12)].map((_, i) => (
              <motion.rect
                key={`wave-center-${i}`}
                x={-80 + i * 15}
                y={-10}
                width="10"
                height="20"
                rx="5"
                fill={['#D1173D', '#F78C3B', '#FFC325', '#00A9B0'][i % 4]}
                opacity={0.3}
                animate={{ 
                  height: [8, 30, 15, 40, 8],
                  y: [-4, -15, -7.5, -20, -4]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        </svg>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 pt-8"
      >
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-ampla-red via-ampla-orange to-ampla-teal ampla-gradient-text" style={{ letterSpacing: "-1px" }}>
          Ampla Podcast
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
          Descubra os melhores podcasts e episódios em um só lugar.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-3 h-3 rounded-full bg-ampla-red animate-pulse mx-1"></div>
          <div className="w-3 h-3 rounded-full bg-ampla-orange animate-pulse mx-1" style={{ animationDelay: "300ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-ampla-yellow animate-pulse mx-1" style={{ animationDelay: "600ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-ampla-teal animate-pulse mx-1" style={{ animationDelay: "900ms" }}></div>
        </div>
      ) : (
        <motion.div
          className="w-full flex justify-center px-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8 justify-items-center w-full max-w-7xl">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                  y: -5
                }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col w-full hover:border-ampla-orange transition-all duration-300 group relative"
                onClick={() => navigate(`/categoria/${category.id}`)}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ampla-red via-ampla-orange to-ampla-yellow"></div>
                <div className="relative w-full h-48 bg-gray-100">
                  {category.imagem ? (
                    <img
                      src={category.imagem}
                      alt={category.titulo}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                      <ImageIcon className="w-16 h-16 mb-2" />
                      <span>Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex-1 flex flex-col justify-between p-6 relative">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-ampla-red transition-colors">
                      {category.titulo}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {category.descricao}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center">
                      <Headphones className="w-4 h-4 text-ampla-orange mr-1" />
                      <span className="text-xs text-gray-500">
                        {getEpisodesByCategory(category.id).length} episódios
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="rounded-full p-2 h-8 w-8 hover:bg-ampla-red/10 hover:text-ampla-red"
                    >
                      <svg className="w-4 h-4 text-ampla-red group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedCategory?.titulo}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6">
              {selectedCategory.imagem && (
                <img
                  src={selectedCategory.imagem}
                  alt={selectedCategory.titulo}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <p className="text-gray-600">{selectedCategory.descricao}</p>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Episódios</h3>
                {getEpisodesByCategory(selectedCategory.id).map((episode) => (
                  <Card key={episode.id} className="hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{episode.titulo}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{episode.descricao}</p>
                          <span className="text-xs text-gray-500 mt-2 block">
                            {formatDate(episode.publicado_em)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 ml-4"
                          onClick={() => handlePlayPause(episode)}
                        >
                          {currentlyPlaying?.id === episode.id ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Ouvir
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {currentlyPlaying && (
        <AudioPlayerCard
          title={currentlyPlaying.title}
          description={currentlyPlaying.description}
          audioSrc={currentlyPlaying.url}
          episodeId={currentlyPlaying.id}
          onClose={() => setCurrentlyPlaying(null)}
          expanded={false}
        />
      )}
    </div>
  );
};

export default Index;

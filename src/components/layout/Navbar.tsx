
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith("/admin");
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full py-2 px-4 md:px-6 border-b flex items-center justify-between bg-gradient-to-r from-white to-[#FFC325]/5 shadow-sm">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center group">
          <div className="w-10 h-10 mr-2 transition-transform group-hover:scale-105 duration-200">
            <img 
              src="/lovable-uploads/b80fbf60-7df2-4524-8c97-60590217b190.png" 
              alt="Ampla Podcast Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#D1173D] via-[#F78C3B] to-[#00A9B0] bg-clip-text text-transparent">
            Ampla Podcast
          </span>
        </Link>
        
        {!isAdminSection && (
          <div className="hidden md:flex space-x-2">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md text-gray-600 hover:text-[#D1173D] hover:bg-[#D1173D]/10 transition-all ${
                location.pathname === '/' ? 'bg-[#D1173D]/10 text-[#D1173D] font-medium' : ''
              }`}
            >
              Início
            </Link>
            <Link 
              to="/search" 
              className={`px-4 py-2 rounded-md text-gray-600 hover:text-[#00A9B0] hover:bg-[#00A9B0]/10 transition-all ${
                location.pathname === '/search' ? 'bg-[#00A9B0]/10 text-[#00A9B0] font-medium' : ''
              }`}
            >
              Buscar
            </Link>
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center space-x-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-[#FFC325]/10 border-[#FFC325]/30 text-[#F78C3B]">
              {user.email?.split('@')[0]}
            </Badge>
            <Button 
              variant="outline" 
              className="border-[#00A9B0]/30 hover:border-[#00A9B0] hover:bg-[#00A9B0]/10 text-[#00A9B0] hover:text-[#00A9B0] shadow-sm transition-all"
              asChild
            >
              <Link to={isAdminSection ? "/" : "/admin"}>
                {isAdminSection ? "Ver Site" : "Área Administrativa"}
              </Link>
            </Button>
          </div>
        ) : (
          <Button 
            variant="default" 
            className="bg-gradient-to-r from-[#D1173D] to-[#F78C3B] hover:from-[#F78C3B] hover:to-[#D1173D] shadow-md hover:shadow-lg transition-all"
            asChild
          >
            <Link to="/login" className="flex items-center">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Link>
          </Button>
        )}
      </div>

      <div className="md:hidden relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-600"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg border border-gray-100 z-50">
            {!isAdminSection && (
              <>
                <Link 
                  to="/" 
                  className={`block px-4 py-2 text-gray-600 hover:text-[#D1173D] hover:bg-[#D1173D]/10 transition-all ${
                    location.pathname === '/' ? 'bg-[#D1173D]/10 text-[#D1173D] font-medium' : ''
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Início
                </Link>
                <Link 
                  to="/search" 
                  className={`block px-4 py-2 text-gray-600 hover:text-[#00A9B0] hover:bg-[#00A9B0]/10 transition-all ${
                    location.pathname === '/search' ? 'bg-[#00A9B0]/10 text-[#00A9B0] font-medium' : ''
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Buscar
                </Link>
              </>
            )}
            
            {user ? (
              <Link 
                to={isAdminSection ? "/" : "/admin"} 
                className="block px-4 py-2 text-gray-600 hover:text-[#00A9B0] hover:bg-[#00A9B0]/10 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                {isAdminSection ? "Ver Site" : "Área Administrativa"}
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="block px-4 py-2 text-gray-600 hover:text-[#D1173D] hover:bg-[#D1173D]/10 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Entrar
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

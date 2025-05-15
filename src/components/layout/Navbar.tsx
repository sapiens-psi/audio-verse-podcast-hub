
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, LogIn, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith("/admin");
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full py-3 px-4 md:px-6 border-b flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-podcast to-podcast-dark flex items-center justify-center mr-2 shadow-md transition-transform group-hover:scale-105 duration-200">
            <Home className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-podcast-background to-podcast bg-clip-text text-transparent">
            PodcastApp
          </span>
        </Link>
        
        {!isAdminSection && (
          <div className="hidden md:flex space-x-2">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md text-gray-600 hover:text-podcast hover:bg-podcast/10 transition-all ${
                location.pathname === '/' ? 'bg-podcast/10 text-podcast font-medium' : ''
              }`}
            >
              Início
            </Link>
            <Link 
              to="/search" 
              className={`px-4 py-2 rounded-md text-gray-600 hover:text-podcast hover:bg-podcast/10 transition-all ${
                location.pathname === '/search' ? 'bg-podcast/10 text-podcast font-medium' : ''
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
            <Badge variant="outline" className="bg-podcast/5 border-podcast/20 text-podcast">
              {user.email?.split('@')[0]}
            </Badge>
            <Button 
              variant="outline" 
              className="border-podcast/30 hover:border-podcast hover:bg-podcast/10 text-podcast-background hover:text-podcast shadow-sm transition-all"
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
            className="bg-gradient-to-r from-podcast to-podcast-dark hover:from-podcast-dark hover:to-podcast shadow-md hover:shadow-lg transition-all"
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
                  className={`block px-4 py-2 text-gray-600 hover:text-podcast hover:bg-podcast/10 transition-all ${
                    location.pathname === '/' ? 'bg-podcast/10 text-podcast font-medium' : ''
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Início
                </Link>
                <Link 
                  to="/search" 
                  className={`block px-4 py-2 text-gray-600 hover:text-podcast hover:bg-podcast/10 transition-all ${
                    location.pathname === '/search' ? 'bg-podcast/10 text-podcast font-medium' : ''
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
                className="block px-4 py-2 text-gray-600 hover:text-podcast hover:bg-podcast/10 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                {isAdminSection ? "Ver Site" : "Área Administrativa"}
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="block px-4 py-2 text-gray-600 hover:text-podcast hover:bg-podcast/10 transition-all"
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

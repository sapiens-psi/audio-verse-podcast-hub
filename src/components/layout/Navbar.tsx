
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith("/admin");

  return (
    <nav className="w-full py-4 px-6 border-b flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-podcast flex items-center justify-center mr-2">
            <Home className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-podcast-background">PodcastApp</span>
        </Link>
        
        {!isAdminSection && (
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-podcast transition-colors">
              Início
            </Link>
            <Link to="/search" className="text-gray-600 hover:text-podcast transition-colors">
              Buscar
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {!isAdminSection ? (
          <Button variant="outline" asChild>
            <Link to="/admin">
              Área Administrativa
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link to="/">
              Ver Site
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

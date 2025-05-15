
import { Outlet, NavLink } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Home, LogOut, FolderPlus, List, BarChart2, Headphones } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { signOut } = useAuth();

  const sidebarMenuItems = [
    { icon: Home, label: "Dashboard", path: "/admin" },
    { icon: FolderPlus, label: "Categorias", path: "/admin/categories" },
    { icon: List, label: "Episódios", path: "/admin/episodes" },
    { icon: BarChart2, label: "Visualizações", path: "/admin/views" }
  ];

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar 
          className={`${sidebarOpen ? "w-72" : "w-20"} transition-all duration-300 ease-in-out shadow-md border-r border-gray-200`}
          collapsible="icon"
        >
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {sidebarOpen && (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-ampla-red to-ampla-orange flex items-center justify-center mr-3">
                  <Headphones className="text-white h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-ampla-red to-ampla-orange">
                    Ampla
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">Podcast Admin</span>
                </div>
              </div>
            )}
            <SidebarTrigger className="text-gray-500 hover:text-ampla-red transition-colors p-2 rounded-full hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)} />
          </div>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs uppercase tracking-wider text-gray-500 font-medium px-4 py-2 ${!sidebarOpen && 'sr-only'}`}>
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.path} 
                          end={item.path === "/admin"}
                          className={({ isActive }) => 
                            `flex items-center py-3 px-4 rounded-lg transition-all duration-200 text-base ${
                              isActive 
                                ? "bg-gradient-to-r from-ampla-red/10 to-ampla-teal/5 text-ampla-red font-medium border-l-4 border-ampla-red" 
                                : "text-gray-600 hover:bg-gray-100 hover:text-ampla-red"
                            }`
                          }
                        >
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} />
                          {sidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="mt-auto p-4 border-t border-sidebar-border">
              <Button 
                variant="ghost" 
                className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-ampla-red transition-colors text-base py-3 rounded-lg ${
                  !sidebarOpen && 'justify-center p-2'
                }`}
                onClick={handleSignOut}
              >
                <LogOut className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} />
                {sidebarOpen && "Sair"}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <div className="p-6 overflow-auto h-[calc(100vh-64px)]">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

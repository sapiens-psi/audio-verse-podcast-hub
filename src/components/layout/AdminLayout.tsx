
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
import { Home, LogOut, FolderPlus, List, BarChart2 } from "lucide-react";
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
          className={`${sidebarOpen ? "w-64" : "w-14"} transition-all duration-300 ease-in-out`} 
          collapsible="icon"
        >
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {sidebarOpen && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-podcast flex items-center justify-center mr-2">
                  <Home className="text-white h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-podcast">Admin</span>
              </div>
            )}
            <SidebarTrigger className="text-gray-500 hover:text-podcast transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)} />
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-gray-500">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.path} 
                          end={item.path === "/admin"}
                          className={({ isActive }) => 
                            `flex items-center py-2 px-3 rounded-md transition-colors ${
                              isActive 
                                ? "bg-podcast/20 text-podcast font-medium" 
                                : "text-gray-600 hover:bg-gray-100"
                            }`
                          }
                        >
                          <item.icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
                          {sidebarOpen && item.label}
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
                className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-podcast transition-colors" 
                onClick={handleSignOut}
              >
                <LogOut className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
                {sidebarOpen && "Sair"}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

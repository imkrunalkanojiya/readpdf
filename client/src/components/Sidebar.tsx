import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useSidebar } from "../contexts/SidebarContext";
import { ChevronLeft, ChevronRight, Home, Star } from "lucide-react";

export function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const [location] = useLocation();

  return (
    <div className={`sidebar ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 h-screen bg-gray-100 border-r relative`}>
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 text-gray-600 z-20"
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      
      <nav className="p-4 overflow-y-auto h-full pt-12">
        {isOpen ? (
          <ul className="space-y-2">
            <li>
              <Link 
                href="/"
                className={`flex items-center px-3 py-2 rounded hover:bg-gray-200 text-gray-700 ${location === '/' ? 'bg-gray-200 font-medium' : ''}`}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/favorites"
                className={`flex items-center px-3 py-2 rounded hover:bg-gray-200 text-gray-700 ${location === '/favorites' ? 'bg-gray-200 font-medium' : ''}`}
              >
                <Star className="h-5 w-5 mr-3" />
                Favorites
              </Link>
            </li>
          </ul>
        ) : (
          <div className="flex flex-col items-center space-y-4 pt-4">
            <Link 
              href="/" 
              title="Home" 
              className={`p-2 rounded hover:bg-gray-200 ${location === '/' ? 'bg-gray-200' : ''}`}
            >
              <Home className="h-5 w-5 text-gray-700" />
            </Link>
            <Link 
              href="/favorites" 
              title="Favorites" 
              className={`p-2 rounded hover:bg-gray-200 ${location === '/favorites' ? 'bg-gray-200' : ''}`}
            >
              <Star className="h-5 w-5 text-gray-700" />
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}

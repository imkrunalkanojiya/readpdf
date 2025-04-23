import { useState } from "react";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Category } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Search, Home, History, Bookmark, Folder, File, Plus, Settings, ChevronRight, ChevronDown } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  currentCategoryId?: number;
  onSearchMobile: (query: string) => void;
}

export function Sidebar({ isOpen, currentCategoryId, onSearchMobile }: SidebarProps) {
  const [location] = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({
    2: true, // Business category expanded by default
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Subcategories for demonstration
  const subCategories = {
    1: ['Research Papers', 'Textbooks'], // Academic
    2: ['Reports', 'Presentations'],     // Business
    3: []                               // Personal
  };

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 h-full transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static z-20 top-0 pt-16 lg:pt-0`}>
      <div className="p-4 flex flex-col h-full">
        <div className="md:hidden mb-4">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search your PDFs..."
              className="w-full py-2 pl-10 pr-4"
              onChange={(e) => onSearchMobile(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      
        <nav className="space-y-1 overflow-y-auto flex-1 min-h-0">
          <Link href="/" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${location === '/' ? 'bg-indigo-50 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Home className="w-5 h-5 mr-2" />
            <span>Home</span>
          </Link>
          <Link href="/?recent=true" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${location.includes('recent') ? 'bg-indigo-50 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
            <History className="w-5 h-5 mr-2" />
            <span>Recent</span>
          </Link>
          <Link href="/?favorite=true" className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${location.includes('favorite') ? 'bg-indigo-50 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Bookmark className="w-5 h-5 mr-2" />
            <span>Bookmarked</span>
          </Link>

          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </h3>
            
            {categories.map((category) => (
              <div key={category.id} className="mt-1">
                <button 
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center">
                    <Folder className="w-5 h-5 mr-2 text-gray-400" />
                    <span>{category.name}</span>
                  </div>
                  {expandedCategories[category.id] ? 
                    <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  }
                </button>
                
                {expandedCategories[category.id] && (
                  <div className="ml-6 mt-1 space-y-1 pl-2 border-l border-gray-200">
                    {subCategories[category.id as keyof typeof subCategories]?.map((subCategory, index) => (
                      <Link 
                        key={index}
                        href={`/?category=${category.id}&subcategory=${index}`}
                        className="flex items-center px-3 py-1 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        <File className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{subCategory}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button className="mt-2 w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100">
              <Plus className="w-5 h-5 mr-2 text-gray-400" />
              <span>Add New Category</span>
            </button>
          </div>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="px-3 py-2">
            <div className="flex items-center">
              <Progress value={65} className="h-2.5 w-full bg-gray-200" />
              <span className="ml-2 text-xs font-medium text-gray-500">65%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">6.5 GB of 10 GB used</p>
          </div>
          <button className="mt-2 w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100">
            <Settings className="w-5 h-5 mr-2 text-gray-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { PDFCard } from "@/components/pdf-card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Document, Category } from "@shared/schema";
import { useLocation } from "wouter";
import { sortDocuments, filterDocuments } from "@/lib/pdf-utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Filter, 
  Clock, 
  Star, 
  LayoutGrid, 
  List,
} from "lucide-react";

export default function Home() {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"lastOpened" | "name" | "dateAdded" | "size">("lastOpened");
  const [currentFilter, setCurrentFilter] = useState<"all" | "recent" | "favorites">("all");
  
  // Parse the URL for filter parameters
  useEffect(() => {
    if (location.includes("favorite=true")) {
      setCurrentFilter("favorites");
    } else if (location.includes("recent=true")) {
      setCurrentFilter("recent");
    } else {
      setCurrentFilter("all");
    }
  }, [location]);

  // Fetch documents
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Fetch categories for the sidebar
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create a category map for easy lookups
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {} as Record<number, string>);

  // Filter and sort documents
  const filteredDocuments = filterDocuments(documents, {
    favorite: currentFilter === "favorites",
    searchQuery
  });

  const sortedDocuments = sortDocuments(filteredDocuments, sortBy);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
        onSidebarToggle={toggleSidebar} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onSearchMobile={handleSearchChange} 
        />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-6">
          <div className="container mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Your Library</h1>
              <p className="text-gray-600">All your PDF documents in one place</p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant={currentFilter === "all" ? "default" : "outline"}
                  className={currentFilter === "all" ? "bg-indigo-50 text-primary hover:bg-indigo-100 border border-indigo-100" : ""}
                  onClick={() => setCurrentFilter("all")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  All Documents
                </Button>
                <Button 
                  variant={currentFilter === "recent" ? "default" : "outline"}
                  className={currentFilter === "recent" ? "bg-indigo-50 text-primary hover:bg-indigo-100 border border-indigo-100" : ""}
                  onClick={() => setCurrentFilter("recent")}
                >
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  Recent
                </Button>
                <Button 
                  variant={currentFilter === "favorites" ? "default" : "outline"}
                  className={currentFilter === "favorites" ? "bg-indigo-50 text-primary hover:bg-indigo-100 border border-indigo-100" : ""}
                  onClick={() => setCurrentFilter("favorites")}
                >
                  <Star className="h-4 w-4 mr-2 text-gray-400" />
                  Favorites
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastOpened">Last opened</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="dateAdded">Date added</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant={currentView === "grid" ? "secondary" : "outline"}
                  size="icon"
                  onClick={() => setCurrentView("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={currentView === "list" ? "secondary" : "outline"}
                  size="icon"
                  onClick={() => setCurrentView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* PDF Grid/List */}
            {isLoadingDocuments ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your documents...</p>
              </div>
            ) : sortedDocuments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No results found for "${searchQuery}"`
                    : currentFilter === "favorites"
                    ? "You haven't favorited any documents yet."
                    : "Upload your first PDF to get started."}
                </p>
              </div>
            ) : (
              <div className={
                currentView === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "flex flex-col space-y-2"
              }>
                {sortedDocuments.map((document) => (
                  <PDFCard key={document.id} document={document} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

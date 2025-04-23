import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { UploadModal } from "./upload-modal";
import { Link } from "wouter";
import { BookOpen, Search, Upload, Bell, Menu } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSidebarToggle: () => void;
}

export function Header({ searchQuery, onSearchChange, onSidebarToggle }: HeaderProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onSidebarToggle} 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-gray-700 hover:text-primary"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900">ReadPDF</span>
          </Link>
        </div>
        
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search your PDFs..."
              className="w-full py-2 pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary hover:bg-indigo-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Upload PDF</span>
          </Button>
          <Button variant="ghost" size="icon" className="p-2 rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-gray-200">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </header>
  );
}

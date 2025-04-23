import { Card, CardContent } from "@/components/ui/card";
import { Document } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface PDFCardProps {
  document: Document;
  onDelete?: (id: number) => void;
}

export function PDFCard({ document, onDelete }: PDFCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleToggleFavorite = async () => {
    try {
      await apiRequest("PATCH", `/api/documents/${document.id}`, {
        favorite: !document.favorite
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: document.favorite ? "Removed from favorites" : "Added to favorites",
        description: document.title,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await apiRequest("DELETE", `/api/documents/${document.id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Document deleted",
        description: document.title,
      });
      if (onDelete) {
        onDelete(document.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return `Added ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Default placeholder thumbnail
  const thumbnailUrl = document.thumbnail || 
    "https://via.placeholder.com/300x400?text=PDF";

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow duration-200 group border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            {/* PDF thumbnail or placeholder */}
            <div className="text-gray-400 text-center p-4">
              <div className="text-6xl mb-2">📄</div>
              <div className="text-sm truncate">{document.title}</div>
            </div>
          </div>
        </div>
        
        <div className={`absolute top-2 right-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="h-8 w-8 bg-white hover:bg-gray-100 rounded-full shadow-sm">
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleFavorite}>
                {document.favorite ? "Remove from favorites" : "Add to favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Link href={`/reader/${document.id}`}>
          <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 cursor-pointer transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Button size="icon" className="bg-white text-primary rounded-full p-3 hover:bg-gray-100">
              <Eye className="h-5 w-5" />
            </Button>
          </div>
        </Link>
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-gray-800 truncate">{document.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{formatDate(document.uploadedAt)}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-primary rounded-full">
            {document.categoryId ? `Category ${document.categoryId}` : "Uncategorized"}
          </span>
          <span className="text-xs text-gray-500">{formatFileSize(document.size)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck,
  Download, 
  Share, 
  MoreVertical 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Reader() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/reader/:id');
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  // Fetch document
  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: [`/api/documents/${params?.id}`],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (document) {
      setIsFavorite(document.favorite || false);
    }
  }, [document]);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleToggleFavorite = async () => {
    if (!document) return;

    try {
      await apiRequest("PATCH", `/api/documents/${document.id}`, {
        favorite: !isFavorite
      });
      
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
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

  const handleDownload = () => {
    if (!document) return;
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = `/api/view/${document.filename}`;
    link.download = document.title + '.pdf';
    link.click();
  };

  const handleShare = () => {
    if (!document) return;
    
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          text: `Check out this PDF: ${document.title}`,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this document with others",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <Skeleton className="w-[595px] h-[842px]" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-6xl mb-4">📄❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-600 mb-6">
            The document you're looking for doesn't exist or might have been deleted.
          </p>
          <Button onClick={() => navigate('/')}>
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white p-4 border-b border-gray-200 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-gray-800 truncate">{document.title}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleFavorite}
            title={isFavorite ? "Remove from bookmarks" : "Bookmark"}
            className="text-gray-700 hover:text-primary"
          >
            {isFavorite ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDownload}
            title="Download"
            className="text-gray-700"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare}
            title="Share"
            className="text-gray-700"
          >
            <Share className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                title="More options"
                className="text-gray-700"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleFavorite}>
                {isFavorite ? "Remove from favorites" : "Add to favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        {document && (
          <PDFViewer url={`/api/view/${document.filename}`} />
        )}
      </div>
    </div>
  );
}

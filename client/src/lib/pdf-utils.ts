import { Document } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const formatDate = (date: Date | null) => {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getCategoryName = (document: Document, categoryMap: Record<number, string>) => {
  if (!document.categoryId) return "Uncategorized";
  return categoryMap[document.categoryId] || "Uncategorized";
};

export const filterDocuments = (
  documents: Document[],
  filters: {
    categoryId?: number;
    favorite?: boolean;
    searchQuery?: string;
  }
) => {
  let filteredDocs = [...documents];

  if (filters.categoryId) {
    filteredDocs = filteredDocs.filter(doc => doc.categoryId === filters.categoryId);
  }

  if (filters.favorite) {
    filteredDocs = filteredDocs.filter(doc => doc.favorite);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredDocs = filteredDocs.filter(doc => 
      doc.title.toLowerCase().includes(query)
    );
  }

  return filteredDocs;
};

export const sortDocuments = (
  documents: Document[],
  sortBy: 'lastOpened' | 'name' | 'dateAdded' | 'size' = 'lastOpened'
) => {
  const sortedDocs = [...documents];

  switch (sortBy) {
    case 'lastOpened':
      return sortedDocs.sort((a, b) => {
        const aTime = a.lastOpenedAt || a.uploadedAt;
        const bTime = b.lastOpenedAt || b.uploadedAt;
        
        // Handle null or undefined cases
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    case 'name':
      return sortedDocs.sort((a, b) => 
        a.title.localeCompare(b.title)
      );
    case 'dateAdded':
      return sortedDocs.sort((a, b) => {
        // Handle null cases
        if (!a.uploadedAt && !b.uploadedAt) return 0;
        if (!a.uploadedAt) return 1;
        if (!b.uploadedAt) return -1;
        
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });
    case 'size':
      return sortedDocs.sort((a, b) => 
        b.size - a.size
      );
    default:
      return sortedDocs;
  }
};

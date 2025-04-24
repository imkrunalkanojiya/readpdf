import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PDFCard } from "@/components/pdf-card";
import { Document } from "@shared/schema";

export default function Favorites() {
  // Fetch documents with favorite flag
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', { favorites: true }],
  });

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Favorite Documents</h1>
        <p className="text-gray-600">Your starred PDF documents</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your favorites...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-6">
            Star your important documents to access them quickly from here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((document) => (
            <PDFCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
}
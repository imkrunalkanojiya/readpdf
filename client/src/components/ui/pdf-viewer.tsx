import { useEffect, useRef, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Skeleton } from './skeleton';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Expand, 
  Printer,
  Loader
} from 'lucide-react';

// Set the worker to use our local copy that we copied to the public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

interface PDFViewerProps {
  url: string;
  onLoadSuccess?: (pdf: PDFDocumentProxy) => void;
}

export function PDFViewer({ url, onLoadSuccess }: PDFViewerProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInputValue, setPageInputValue] = useState('1');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        
        // Load the PDF document
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        
        setPdf(pdf);
        setTotalPages(pdf.numPages);
        
        if (onLoadSuccess) {
          onLoadSuccess(pdf);
        }
        
        // Render the first page
        setCurrentPage(1);
        setPageInputValue('1');
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPDF();
  }, [url, onLoadSuccess]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      try {
        setIsLoading(true);
        
        // Get the page
        const page = await pdf.getPage(currentPage);
        
        // Set canvas dimensions to match the page
        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render the page content
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        setIsLoading(false);
      } catch (error) {
        console.error('Error rendering PDF page:', error);
        setIsLoading(false);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, rotation]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInputValue((currentPage - 1).toString());
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInputValue((currentPage + 1).toString());
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInputValue);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      setPageInputValue(currentPage.toString());
    }
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  };

  const enterFullScreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const print = () => {
    if (pdf) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef}
        className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center relative"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
            <div className="flex flex-col items-center">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-gray-700">Loading page...</p>
            </div>
          </div>
        )}
        <div className="relative my-4">
          <canvas ref={canvasRef} className="bg-white shadow-md" />
        </div>
      </div>
      
      <div className="bg-white p-3 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <form onSubmit={handlePageInputSubmit} className="flex items-center">
            <span className="text-sm text-gray-700">Page</span>
            <Input
              type="text"
              value={pageInputValue}
              onChange={handlePageInputChange}
              className="w-12 mx-2 text-center h-8 px-1"
              onBlur={handlePageInputSubmit}
            />
            <span className="text-sm text-gray-700">of {totalPages}</span>
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={enterFullScreen}
            className="text-gray-700 hover:bg-gray-100"
            title="Full screen"
          >
            <Expand className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={print}
            className="text-gray-700 hover:bg-gray-100"
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

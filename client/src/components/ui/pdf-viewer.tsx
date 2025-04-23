import { useRef, useState } from 'react';
import { Button } from './button';
import { 
  ZoomIn, 
  ZoomOut, 
  Expand, 
  Printer,
  Download,
  Loader
} from 'lucide-react';

interface PDFViewerProps {
  url: string;
  onLoadSuccess?: () => void;
}

export function PDFViewer({ url, onLoadSuccess }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoadSuccess) {
      onLoadSuccess();
    }
  };

  const zoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 25, 200));
  };

  const zoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 25, 50));
  };

  const enterFullScreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const print = () => {
    window.open(url, '_blank');
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'document.pdf';
    link.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef}
        className="flex-1 bg-gray-100 relative overflow-hidden"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
            <div className="flex flex-col items-center">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-gray-700">Loading PDF...</p>
            </div>
          </div>
        )}
        <iframe 
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          onLoad={handleLoad}
          style={{ 
            border: 'none',
            display: 'block',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}
        />
      </div>
      
      <div className="bg-white p-3 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={zoom <= 50}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={zoom >= 200}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ZoomIn className="h-4 w-4" />
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
          <Button
            variant="ghost"
            size="icon"
            onClick={download}
            className="text-gray-700 hover:bg-gray-100"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

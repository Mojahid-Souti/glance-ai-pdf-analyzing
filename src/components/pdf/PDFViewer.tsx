'use client';

import { useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { searchPlugin } from '@react-pdf-viewer/search';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search } from 'lucide-react'; // Use ChevronLeft and ChevronRight

interface PDFViewerProps {
  url: string;
  onTextSelect?: (text: string) => void;
}

export default function PDFViewer({ url, onTextSelect }: PDFViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const searchPluginInstance = searchPlugin();
  const zoomPluginInstance = zoomPlugin();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleDocumentLoad = () => {
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString();
      if (selectedText && onTextSelect) {
        onTextSelect(selectedText);
      }
    });
  };

  return (
    <div className="h-full relative">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <div className="h-full flex flex-col">
          {/* PDF Viewer Toolbar */}
          <div className="bg-white border-b p-2 flex items-center space-x-2">
            <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
              <ChevronRight size={20} />
            </button>
            <div className="flex-1" />
            <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
              <ZoomIn size={20} />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
              <ZoomOut size={20} />
            </button>
            <button
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1">
            <Viewer
              fileUrl={url}
              plugins={[
                defaultLayoutPluginInstance,
                searchPluginInstance,
                zoomPluginInstance,
              ]}
              onDocumentLoad={handleDocumentLoad}
            />
          </div>
        </div>
      </Worker>
    </div>
  );
}

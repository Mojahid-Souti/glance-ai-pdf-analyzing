'use client';

import { useState, useEffect } from 'react';
import { FileText, MoreVertical, MessageSquare, Star, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  _id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
}

export default function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={fetchDocuments}
          className="text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">Upload your first PDF to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <div 
          key={doc._id}
          className="bg-white rounded-xl border border-gray-200 hover:border-[#FF6B6B]/30 transition-all shadow-sm hover:shadow-md"
        >
          <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center border-b">
            <FileText size={48} className="text-gray-300" />
            {doc.status === 'processing' && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-1 truncate" title={doc.title}>
              {doc.title}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{formatFileSize(doc.fileSize)}</span>
              <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <a 
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                View PDF
              </a>
              <div className="flex space-x-2">
                <button className="text-gray-500 hover:text-[#FF6B6B]">
                  <MessageSquare size={18} />
                </button>
                <button className="text-gray-500 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
// src/app/(dashboard)/dashboard/documents/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { DocumentCard } from '@/components/dashboard/documents/DocumentCard';
import { Search, Loader2, FileText } from 'lucide-react';
import UploadModal from '@/components/dashboard/upload/UploadModal';

interface Document {
  _id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleNewDocument = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const handleDelete = (deletedId: string) => {
    setDocuments(prev => prev.filter(doc => doc._id !== deletedId));
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">My Documents</h1>
        <div className="flex space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
              <div className="p-4">
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          {searchTerm ? (
            <>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </>
          ) : (
            <>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500">Upload your first PDF to get started!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <DocumentCard 
              key={doc._id} 
              document={doc}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleNewDocument}
      />
    </div>
  );
}
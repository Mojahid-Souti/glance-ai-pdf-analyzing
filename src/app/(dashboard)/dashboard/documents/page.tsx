'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load documents');
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

  const handleDelete = async (deletedId: string) => {
    setDocuments(prev => prev.filter(doc => doc._id !== deletedId));
  };

  const handleViewDocument = (documentId: string) => {
    router.push(`/dashboard/documents/${documentId}`);
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
            {searchTerm && filteredDocuments.length === 0 && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF8E53] transition-colors"
          >
            Try again
          </button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          {searchTerm ? (
            <>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">No documents match "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#FF6B6B] hover:text-[#FF8E53]"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-4">Upload your first PDF to get started!</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF8E53] transition-colors"
              >
                Upload PDF
              </button>
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
              onClick={() => handleViewDocument(doc._id)}
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
// src/app/(dashboard)/dashboard/documents/[documentId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';

interface Document {
  _id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export default function DocumentPage() {
  const router = useRouter();
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.documentId}`);
        if (!response.ok) throw new Error('Failed to fetch document');
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        console.error('Error:', error);
        router.push('/dashboard/documents');
      } finally {
        setLoading(false);
      }
    };

    if (params.documentId) {
      fetchDocument();
    }
  }, [params.documentId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Document not found</p>
        <button
          onClick={() => router.push('/dashboard/documents')}
          className="text-[#FF6B6B] hover:text-[#FF8E53] transition-colors"
        >
          Return to documents
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(97vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-[#FF6B6B] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium truncate">{document.title}</h1>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden bg-white">
        {/* PDF Viewer */}
        <div className="flex-1 p-6">
          <iframe
            src={document.fileUrl}
            className="w-full h-full rounded-lg border shadow-sm"
            title={document.title}
          />
        </div>

        {/* Chat Panel - Optional */}
        <div className="w-[400px] border-l bg-white">
          <ChatInterface documentId={document._id} />
        </div>
      </div>
    </div>
  );
}
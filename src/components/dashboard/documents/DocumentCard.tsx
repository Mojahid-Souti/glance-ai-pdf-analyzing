// src/components/dashboard/documents/DocumentCard.tsx
'use client';

import { FileText, Trash2, ExternalLink, Loader2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';

interface DocumentCardProps {
  document: {
    _id: string;
    title: string;
    fileUrl: string;
    fileSize: number;
    createdAt: string;
  };
  onDelete: (id: string) => void;
  onClick?: () => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/documents/${document._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      onDelete(document._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

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

  return (
    <>
      <div className={`bg-white rounded-lg border transition-all shadow-sm hover:shadow-md 
        ${isDeleting ? 'opacity-50' : ''}`}>
        {/* Preview Area */}
        <div 
          onClick={() => !isDeleting && router.push(`/dashboard/documents/${document._id}`)}
          className="aspect-[4/3] bg-white rounded-lg relative flex items-center justify-center border-b group cursor-pointer"
        >
          <div className="w-16 h-16 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center">
            {isDeleting ? (
              <Loader2 size={32} className="text-[#FF6B6B] animate-spin" />
            ) : (
              <FileText size={32} className="text-[#FF6B6B]" />
            )}
          </div>
          
          {!isDeleting && (
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                <Eye size={20} className="text-[#FF6B6B]" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 truncate" title={document.title}>
            {document.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</span>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => !isDeleting && router.push(`/dashboard/documents/${document._id}`)}
                className={`text-gray-500 hover:text-[#FF6B6B] transition-colors p-1 rounded-lg hover:bg-[#FF6B6B]/10
                  ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}
                title="View Document"
              >
                <Eye size={18} />
              </button>
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-500 hover:text-[#FF6B6B] transition-colors p-1 rounded-lg hover:bg-[#FF6B6B]/10
                  ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}
                title="Open in New Tab"
              >
                <ExternalLink size={18} />
              </a>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className={`text-gray-500 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50
                ${isDeleting ? 'cursor-not-allowed opacity-50' : ''}`}
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
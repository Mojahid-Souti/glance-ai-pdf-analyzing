'use client';

import { FileText, MoreVertical, MessageSquare, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Temporary mock data
const mockDocuments = [
  {
    id: 1,
    title: 'Research Paper.pdf',
    pages: 12,
    uploadDate: '2024-11-13',
    starred: false,
  },
  // Add more mock documents as needed
];

export default function DocumentsView() {
  const [documents, setDocuments] = useState(mockDocuments);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.length === 0 ? (
        <div className="col-span-full bg-white rounded-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText size={24} className="text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500">Upload your first PDF to get started!</p>
        </div>
      ) : (
        documents.map((doc) => (
          <div 
            key={doc.id}
            className="bg-white rounded-xl border border-gray-200 hover:border-[#FF6B6B]/30 transition-colors overflow-hidden group"
          >
            {/* Preview Area */}
            <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center border-b group-hover:border-[#FF6B6B]/30">
              <FileText size={48} className="text-gray-300" />
              <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={20} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{doc.pages} pages</span>
                <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between">
                <button className="text-gray-500 hover:text-[#FF6B6B] transition-colors">
                  <MessageSquare size={18} />
                </button>
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-[#FF6B6B] transition-colors">
                    <Star size={18} fill={doc.starred ? "#FF6B6B" : "none"} />
                  </button>
                  <button className="text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
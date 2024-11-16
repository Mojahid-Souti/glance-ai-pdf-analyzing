// src/components/dashboard/upload/UploadModal.tsx
'use client';

import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (document: any) => void; // Notify parent about successful upload
}

interface XHRResponse {
  status: number;
  response: string;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      if (!file.type.includes('pdf')) {
        setError('Please upload a PDF file');
        setIsUploading(false);
        return;
      }

      if (file.size > 30 * 1024 * 1024) {
        setError('File size must be less than 30MB');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response: XHRResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve({
              status: xhr.status,
              response: xhr.responseText,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      const newDocument = JSON.parse(response.response);
      onUploadSuccess(newDocument); // Notify the parent component of success

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onClose(); // Close the modal
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Upload PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!isUploading) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!isUploading) {
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) {
                handleFileUpload(files[0]);
              }
            }
          }}
          className={`
            border-2 border-dashed rounded-xl p-8
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${isDragging ? 'border-[#FF6B6B] bg-[#FF6B6B]/5' : 'border-gray-200 hover:border-[#FF6B6B]'}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 size={48} className="text-[#FF6B6B] animate-spin mb-4" />
              <p className="text-gray-600 mb-2">Uploading your PDF...</p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-[#31ba45] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-[#FF6B6B]" />
              </div>
              <p className="text-gray-600 mb-2 text-center">
                Drag & drop your PDF here or
              </p>
              <label className="cursor-pointer">
                <span className="text-[#FF6B6B] hover:text-[#FF8E53] transition-colors">
                  browse files
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileUpload(files[0]);
                    }
                  }}
                  disabled={isUploading}
                />
              </label>
              <p className="text-sm text-gray-400 mt-4 text-center">
                Maximum file size: 30MB
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <label className={`${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <span className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF8E53] transition-colors inline-block">
              Select File
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileUpload(files[0]);
                    }
                  }}
                  disabled={isUploading}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

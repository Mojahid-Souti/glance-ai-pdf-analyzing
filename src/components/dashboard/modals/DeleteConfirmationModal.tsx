// src/components/dashboard/modals/DeleteConfirmationModal.tsx
'use client';

import { Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">Delete File</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this file? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center"
          >
            {isDeleting ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
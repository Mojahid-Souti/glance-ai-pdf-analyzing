// src/models/Document.ts
import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IDocument extends MongoDocument {
  userId: string;
  title: string;
  fileName: string;
  fileKey: string;   // Add this field
  fileUrl: string;
  fileSize: number;
  status: 'processing' | 'ready' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileKey: {     // Add this field
    type: String,
    required: true,
    unique: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'ready'
  }
}, {
  timestamps: true
});

export const Document = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
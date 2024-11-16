export interface Document {
  _id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export type UploadedDocument = Document & {
  userId: string;
};
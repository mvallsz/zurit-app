import mongoose, { Schema } from 'mongoose';
import { IRAGDocument } from '../interfaces';

const ChunkSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    embedding: [Number],
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: true }
);

const RAGDocumentSchema = new Schema<IRAGDocument>(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Document content is required'],
    },
    source: String,
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    context: {
      type: Schema.Types.ObjectId,
      ref: 'AIContext',
    },
    chunks: [ChunkSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

RAGDocumentSchema.index({ title: 'text', content: 'text' });
RAGDocumentSchema.index({ restaurant: 1 });
RAGDocumentSchema.index({ context: 1 });

export const RAGDocument = mongoose.model<IRAGDocument>('RAGDocument', RAGDocumentSchema);
export default RAGDocument;

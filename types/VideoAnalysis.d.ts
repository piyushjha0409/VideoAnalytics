export interface VideoAnalysis {
  id: string; // MongoDB uses ObjectId, which is a string in TypeScript
  videoUrl: string;
  transcription?: string; // Optional field
  summary?: string; // Optional field
  detection?: string; // Optional field
  sentiment?: string; // Optional field
  createdAt: Date; // Automatically set by Prisma
}

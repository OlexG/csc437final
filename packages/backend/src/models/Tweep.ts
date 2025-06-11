import mongoose, { Document, Schema } from 'mongoose';

export interface ITweep extends Document {
  username: string;
  audioData: Buffer;
  duration: string;
  createdAt: Date;
}

const TweepSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  audioData: {
    type: Buffer,
    required: true
  },
  duration: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}:\d{2}$/ // Format: HH:MM:SS
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
TweepSchema.index({ username: 1, createdAt: -1 });
TweepSchema.index({ createdAt: -1 });

export default mongoose.model<ITweep>('Tweep', TweepSchema); 
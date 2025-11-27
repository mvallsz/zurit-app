import mongoose, { Schema } from 'mongoose';
import { IAIContext } from '../interfaces';

const AIContextSchema = new Schema<IAIContext>(
  {
    name: {
      type: String,
      required: [true, 'Context name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    systemPrompt: {
      type: String,
      required: [true, 'System prompt is required'],
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      temperature: {
        type: Number,
        min: 0,
        max: 2,
        default: 0.7,
      },
      maxTokens: {
        type: Number,
        min: 1,
        max: 4000,
        default: 2000,
      },
      topP: {
        type: Number,
        min: 0,
        max: 1,
        default: 1,
      },
      frequencyPenalty: {
        type: Number,
        min: 0,
        max: 2,
        default: 0,
      },
      presencePenalty: {
        type: Number,
        min: 0,
        max: 2,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

AIContextSchema.index({ name: 1 });
AIContextSchema.index({ restaurant: 1 });
AIContextSchema.index({ isGlobal: 1, isActive: 1 });

export const AIContext = mongoose.model<IAIContext>('AIContext', AIContextSchema);
export default AIContext;

import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Lowercase parsing ensures username login matches naturally
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    motivationText: {
      type: String,
      default: 'I will dedicate focused, deliberate effort toward my placement goals today. No excuses, no shortcuts, just relentless self-growth.',
    },
    targetRole: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate models in Mongoose during hot-reloads in Next.js development
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;

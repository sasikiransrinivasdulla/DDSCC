import mongoose, { Schema } from 'mongoose';

const DailyMissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateString: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    dsaTargets: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    development: {
      isBuilding: { type: Boolean, default: false },
      projectName: { type: String, default: '' },
      projectDesc: { type: String, default: '' },
      plannedHours: { type: Number, default: 0 },
      willPushGithub: { type: Boolean, default: false },
      exploreNew: { type: Boolean, default: false },
    },
    skills: {
      type: [String],
      default: [],
    },
    coreSubjects: [
      {
        subject: { type: String, required: true },
        plannedEffort: { type: Number, required: true }, // Slider values 0 - 100
      },
    ],
    communication: {
      options: {
        type: [String],
        default: [],
      },
      confidenceRating: { type: Number, default: 3 }, // Rating 1 to 5
    },
    aptitude: {
      topicName: { type: String, default: '' },
      plannedQuestions: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring only one mission exists per day per user
DailyMissionSchema.index({ userId: 1, dateString: 1 }, { unique: true });

const DailyMission = mongoose.models.DailyMission || mongoose.model('DailyMission', DailyMissionSchema);

export default DailyMission;

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
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isMissed: {
      type: Boolean,
      default: false,
    },
    ddsccScore: {
      type: Number,
      default: 0, // Out of 100
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
        plannedEffort: { type: Number, required: true }, // Slider planned effort 0 - 100
      },
    ],
    communication: {
      options: {
        type: [String],
        default: [],
      },
      confidenceRating: { type: Number, default: 3 }, // Planned confidence level (1-5)
    },
    aptitude: {
      topicName: { type: String, default: '' },
      plannedQuestions: { type: Number, default: 0 },
    },

    // EOD ACTUAL REFLECTION DATA
    eodActuals: {
      dsa: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
      development: {
        projectName: { type: String, default: '' },
        projectDesc: { type: String, default: '' },
        githubPushed: { type: Boolean, default: false },
        exploreNew: { type: Boolean, default: false },
        satisfactionRating: { type: Number, default: 3 }, // 1 to 5
      },
      skills: {
        type: [String], // Array of completed skills
        default: [],
      },
      coreSubjects: [
        {
          subject: { type: String, required: true },
          actualEffort: { type: Number, default: 0 }, // Slider actual effort 0 - 100
        },
      ],
      communication: {
        options: {
          type: [String], // Completed communication targets
          default: [],
        },
        confidenceRating: { type: Number, default: 3 }, // Actual confidence rating (1-5)
      },
      aptitude: {
        topicName: { type: String, default: '' },
        actualQuestions: { type: Number, default: 0 },
      },
      prideRating: {
        type: Number,
        default: 3, // Rating 1 to 5
      },
      reflectionNote: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Enforce single-mission constraints per day per user
DailyMissionSchema.index({ userId: 1, dateString: 1 }, { unique: true });

const DailyMission = mongoose.models.DailyMission || mongoose.model('DailyMission', DailyMissionSchema);

export default DailyMission;

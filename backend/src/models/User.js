const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  path: String,
  url: String,
  type: {
    type: String,
    enum: ['female', 'male', 'pets', 'random']
  },
  index: Number,
  isPost: {
    type: Boolean,
    default: false
  },
  prompt: String,
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

const JobSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days from now
  },
  numProfiles: Number,
  profilesWithPics: Number,
  profilesWithPosts: Number,
  postsPerProfile: Number,
  picTypeDistribution: Object,
  creditsBeforeJob: Number,
  creditsUsed: Number,
  creditsAfterJob: Number,
  startedAt: {
    type: Date,
    default: Date.now
  }
});

const ProfileSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Make jobId optional for backward compatibility
  },
  picType: {
    type: String,
    enum: ['female', 'male', 'pets', 'random'],
    required: true
  },
  images: [ImageSchema],
  posts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true 
  },
  password: String,
  role: { 
    type: String, 
    default: 'user' 
  },
  credits: {
    type: Number,
    default: 100 // Default starting credits
  },
  jobs: [JobSchema],
  profiles: [ProfileSchema]
});

// Add index on expiresAt for efficient cleanup queries
JobSchema.index({ expiresAt: 1 });

// Add index on expiresAt for efficient cleanup queries
ProfileSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('User', UserSchema);

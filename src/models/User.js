import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'coach', 'player'], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },
    dateOfBirth: { type: Date },
    avatar: { type: String },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

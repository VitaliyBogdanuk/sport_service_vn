import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String },
    url: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    uploadedBy: { type: String, enum: ['player', 'admin'], default: 'player' },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);

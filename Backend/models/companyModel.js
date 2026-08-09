import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    website: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);

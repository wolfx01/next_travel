import mongoose from "mongoose";

const placeDetailsSchema = new mongoose.Schema({
  placeName: { type: String, required: true, index: true },
  country: { type: String, required: true },
  description: { type: String },
  currency: { type: String },
  language: { type: String },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

// Compound index for unique place+country combination
placeDetailsSchema.index({ placeName: 1, country: 1 }, { unique: true });

export interface IPlaceDetails extends mongoose.Document {
  placeName: string;
  country: string;
  description?: string;
  currency?: string;
  language?: string;
  averageRating?: number;
  reviewCount?: number;
  lastUpdated: Date;
}

const PlaceDetails: mongoose.Model<IPlaceDetails> =
  mongoose.models.PlaceDetails || mongoose.model<IPlaceDetails>("PlaceDetails", placeDetailsSchema);

if (mongoose.models.PlaceDetails) {
  const paths = mongoose.models.PlaceDetails.schema.paths;
  if (!paths.averageRating || !paths.reviewCount) {
      delete mongoose.models.PlaceDetails;
  }
}

export default PlaceDetails;

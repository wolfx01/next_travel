import mongoose from "mongoose";

const placeDetailsSchema = new mongoose.Schema({
  placeName: { type: String, required: true, index: true },
  country: { type: String, required: true },
  description: { type: String },
  currency: { type: String },
  language: { type: String },
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
  lastUpdated: Date;
}

const PlaceDetails: mongoose.Model<IPlaceDetails> =
  mongoose.models.PlaceDetails || mongoose.model<IPlaceDetails>("PlaceDetails", placeDetailsSchema);

export default PlaceDetails;

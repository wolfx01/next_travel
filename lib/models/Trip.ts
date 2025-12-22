import mongoose, { Schema, Document } from 'mongoose';

const ItineraryItemSchema = new Schema({
    placeName: { type: String, required: true },
    placeLocation: { type: String }, // e.g. "Paris, France"
    dayIndex: { type: Number, required: true }, // 1-based index (Day 1, Day 2...)
    notes: { type: String },
    time: { type: String }, // "10:00 AM" or "Morning"
    status: { type: String, enum: ['planned', 'done'], default: 'planned' }
});

const TripSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coverImage: { type: String }, 
    budget: { type: Number },
    itinerary: [ItineraryItemSchema],
    createdAt: { type: Date, default: Date.now }
});

export interface ITrip extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    startDate: Date;
    endDate: Date;
    coverImage?: string;
    budget?: number;
    itinerary: {
        placeName: string;
        placeLocation?: string;
        dayIndex: number;
        notes?: string;
        time?: string;
        status: string;
    }[];
    createdAt: Date;
}

const Trip = mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);

export default Trip;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  coverUrl: { type: String },
  bio: { type: String, default: "Travel enthusiast exploring the world one city at a time." },
  currentLocation: { type: String, default: "" },
  savedPlaces: { type: [String], default: [] },
  visitedPlaces: { 
    type: [{
      placeId: String,
      placeName: String,
      countryName: String,
      dateVisited: { type: Date, default: Date.now }
    }], 
    default: [] 
  },
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  isAdmin: { type: Boolean, default: false }
});

// Force schema refresh in dev if simple refresh needed
if (mongoose.models.User) {
    // Ideally we shouldn't delete models in production, but for dev hot-reload usually fine
    // Or check if paths exist.
    const paths = mongoose.models.User.schema.paths;
    if (!paths.visitedPlaces || !paths.followers || !paths.currentLocation || !paths.visitedPlaces.schema.paths.countryName) {
        delete mongoose.models.User;
    }
}

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

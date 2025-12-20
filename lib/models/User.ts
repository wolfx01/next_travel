import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  coverUrl: { type: String },
  bio: { type: String, default: "Travel enthusiast exploring the world one city at a time." },
  savedPlaces: { type: [String], default: [] }
});

// Force schema refresh in dev if 'bio' or 'savedPlaces' is missing
if (mongoose.models.User && (!mongoose.models.User.schema.paths.bio || !mongoose.models.User.schema.paths.savedPlaces)) {
  delete mongoose.models.User;
}

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

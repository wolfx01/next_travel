import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  content: { type: String, required: true },
  mediaUrl: { type: String },
  location: { type: String },
  likes: { type: [String], default: [] },
  comments: { 
    type: [{
        userId: String,
        userName: String,
        userAvatar: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }], 
    default: [] 
  },
  createdAt: { type: Date, default: Date.now }
});

// Force schema refresh in dev if comments field is missing
if (mongoose.models.Post) {
    const paths = mongoose.models.Post.schema.paths;
    if (!paths.comments) {
        delete mongoose.models.Post;
    }
}

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;

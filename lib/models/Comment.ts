import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  placeId: { type: String, required: true }, // Can be the stable ID (number as string) or name
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 }, // 1-5 stars
  date: { type: Date, default: Date.now },
});

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

if (mongoose.models.Comment) {
  const paths = mongoose.models.Comment.schema.paths;
  if (!paths.userId || !paths.rating) {
      delete mongoose.models.Comment;
  }
}

export default Comment;

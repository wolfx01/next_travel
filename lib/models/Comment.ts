import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  placeId: { type: String, required: true }, // Can be the stable ID (number as string) or name
  userName: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;

import { Schema, model, models } from "mongoose";

const BlogSchema = new Schema(
  {
    title: { type: "string", required: true },
    description: { type: "string" },
    // 2 relationships below
    user: { type: Schema.Types.ObjectId, ref: "User" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  {
    timestamps: true,
  }
);

const Blog = models.Blog || model("Blog", BlogSchema);
// if already there, create else create new one

export default Blog;

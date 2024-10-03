import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    title: { type: "string", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    // ref is the model name we gave in user.ts
  },
  {
    timestamps: true,
  }
);

const Category = models.Category || model("Category", CategorySchema);
// if already there, create else create new one

export default Category;

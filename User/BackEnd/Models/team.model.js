import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, unique: true, trim: true }
  
}, { timestamps: true });

export const Team = mongoose.model("Team", teamSchema);

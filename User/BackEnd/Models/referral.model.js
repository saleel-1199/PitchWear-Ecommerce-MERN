import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({

 referrer:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 referredUser:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 reward:{
  type:Number,
  default:100
 },

 status:{
  type:String,
  enum:["Pending","Completed"],
  default:"Pending"
 }

})

export const Referral = mongoose.model("Referral",referralSchema)
import mongoose from "mongoose"

const offerSchema = new mongoose.Schema({

 name:String,

 discountPercent:Number,

 type:{
  type:String,
  enum:["Product","Team"]
 },

 product:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Product"
 },

 team:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"Team"
},
 expiryDate:Date,

 isActive:{
  type:Boolean,
  default:true
 }

})

export const Offer = mongoose.model("Offer",offerSchema)
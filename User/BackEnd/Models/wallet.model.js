import mongoose from "mongoose"

const walletSchema = new mongoose.Schema({

 user:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true,
  unique:true
 },

 balance:{
  type:Number,
  default:0
 },

 transactions:[
  {
   type:{
    type:String,
    enum:["Credit","Debit"]
   },

   amount:Number,

   description:String,

   orderId:String,

   createdAt:{
    type:Date,
    default:Date.now
   },
   status:{
  type:String,
  enum:["PENDING","SUCCESS","FAILED"],
  default:"SUCCESS"
},
referredUser:{
  type:String
}
  }
 ]

},{timestamps:true})

export const Wallet = mongoose.model("Wallet",walletSchema)
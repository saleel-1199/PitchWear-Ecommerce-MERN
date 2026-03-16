import { User } from "../Models/user.model.js";
import { Referral } from "../Models/referral.model.js";
import { creditWallet } from "./User/wallet.service.js";

export const handleReferral = async (referralCode, newUserId) => {

 if(!referralCode) return;

 const referrer = await User.findOne({referralCode});

 if(!referrer) return;

 await Referral.create({
  referrer: referrer._id,
  referredUser: newUserId,
  status:"Completed"
 });

 await creditWallet(
  referrer._id,
  100,
  null,
  "Referral Reward"
 );

};
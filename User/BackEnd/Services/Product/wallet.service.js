import { Wallet } from "../../Models/wallet.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});


export const createWalletTopupOrderService = async (userId, amount) => {

  if (!userId) throw new Error("Unauthorized");

  if (!amount || amount <= 0)
    throw new Error("Invalid amount");

  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `wallet_${Date.now()}`
  });

  return razorpayOrder;
};

export const getWalletService = async (userId) => {

  let wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      transactions: []
    });
  }

  return wallet;
};

export const creditWallet = async(userId,amount,orderId,reason,referredUser = null)=>{

 let wallet = await Wallet.findOne({user:userId})

 if(!wallet){
  wallet = await Wallet.create({user:userId})
 }

 wallet.balance += amount;

if (orderId) {
    const exists = wallet.transactions.find(
      t => t.orderId === orderId
    );

    if (exists) return;
  }



 wallet.transactions.push({
  type:"Credit",
  amount,
  orderId,
  description:reason,
  status:"SUCCESS",
  referredUser
 })

 await wallet.save()

}

export const debitWallet = async(userId,amount,orderId)=>{

 const wallet = await Wallet.findOne({user:userId})

 if(!wallet || wallet.balance < amount)
  throw new Error("Insufficient wallet balance")


 const exists = wallet.transactions.find(
  t => t.orderId === orderId
);

if (exists) return;

 wallet.balance -= amount
 

 wallet.transactions.push({
  type:"Debit",
  amount,
  orderId,
  description:"Wallet Payment",
  status:"SUCCESS"
 })

 await wallet.save()

}

export const verifyWalletPaymentService = async ({
  userId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  session
}) => {

  // ✅ 1. Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    throw new Error("Payment verification failed");
  }

const wallet = await Wallet.findOne({ user: userId });


if (!wallet) {
  wallet = await Wallet.create({
    user: userId,
    balance: 0,
    transactions: []
  });
}


const exists = wallet.transactions.find(
  t => t.orderId === razorpay_payment_id
);

if (exists) return;

    // 3. Get secure amount
  const amount = session.walletTopupAmount;

  if (!amount) throw new Error("Invalid amount");


  // ✅ 4. Credit wallet
  await creditWallet(
    userId,
    amount,
    razorpay_payment_id,
    "Wallet Top-up"
  );

  // 5. Clear session
  session.walletTopupAmount = null;
};
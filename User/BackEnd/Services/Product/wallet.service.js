import { Wallet } from "../../Models/wallet.model.js";

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

export const creditWallet = async(userId,amount,orderId,reason)=>{

 let wallet = await Wallet.findOne({user:userId})

 if(!wallet){
  wallet = await Wallet.create({user:userId})
 }

 wallet.balance += amount

 wallet.transactions.push({
  type:"Credit",
  amount,
  orderId,
  description:reason
 })

 await wallet.save()

}

export const debitWallet = async(userId,amount,orderId)=>{

 const wallet = await Wallet.findOne({user:userId})

 if(!wallet || wallet.balance < amount)
  throw new Error("Insufficient wallet balance")

 wallet.balance -= amount

 wallet.transactions.push({
  type:"Debit",
  amount,
  orderId,
  description:"Wallet Payment"
 })

 await wallet.save()

}
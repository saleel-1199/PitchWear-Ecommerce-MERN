import { Offer } from "../../Models/offer.model.js";

export const getOffersDataService = async () => {

 const offers = await Offer.find()
 .populate("product")
 .populate("team");

 return offers;

};


export const createOfferService = async(data)=>{

 const { name, discountPercent, type, product, team, expiryDate } = data;

 if(!name)
 throw new Error("Offer name required");

 if(!discountPercent || discountPercent <=0 || discountPercent > 90)
 throw new Error("Discount must be between 1 - 90");

 if(!expiryDate)
 throw new Error("Expiry date required");

 if(type === "Product" && !product)
 throw new Error("Please select product");

 if(type === "Team" && !team)
 throw new Error("Please select team");

 const offerData = {
  name,
  discountPercent,
  type,
  expiryDate
 };

 if(type === "Product")
 offerData.product = product;

 if(type === "Team")
 offerData.team = team;

 const offer = await Offer.create(offerData);

 return offer;

};


export const deleteOfferService = async(id)=>{

 const offer = await Offer.findById(id);

 if(!offer)
 throw new Error("Offer not found");

 await Offer.findByIdAndDelete(id);

};
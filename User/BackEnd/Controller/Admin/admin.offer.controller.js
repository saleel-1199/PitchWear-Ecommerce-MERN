import {
 getOffersDataService,
 createOfferService,
 deleteOfferService
} from "../../Services/Admin/admin.offer.service.js";

import { Product } from "../../Models/product.model.js";
import { Team } from "../../Models/team.model.js";


export const offersPage = async(req,res)=>{

 try{

 const offers = await getOffersDataService();

 const products = await Product.find();

 const teams = await Team.find();

 res.render("Admin/Offers",{
  offers,
  products,
  teams,
  error:null
 });

 }catch(err){

 res.render("Admin/Offers",{
  offers:[],
  products:[],
  teams:[],
  error:err.message
 });

 }

};



export const createOfferController = async(req,res)=>{

 try{

 await createOfferService(req.body);

 res.redirect("/admin/offers");

 }catch(err){

 const products = await Product.find();
 const teams = await Team.find();

 const offers = await getOffersDataService();

 res.render("Admin/Offers",{
  offers,
  products,
  teams,
  error:err.message
 });

 }

};



export const deleteOfferController = async(req,res)=>{

 try{

 await deleteOfferService(req.params.id);

 res.redirect("/admin/offers");

 }catch(err){

 res.send(err.message);

 }

};
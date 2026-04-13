import { Coupon } from "../../Models/coupon.model.js";

export const couponsPage = async (req,res)=>{

 const coupons = await Coupon.find().sort({createdAt:-1})

 res.render("admin/Coupons",{
  coupons
 })

}

export const createCouponController = async(req,res)=>{

 await Coupon.create(req.body)

 res.redirect("/admin/coupons")

}

export const deleteCouponController = async(req,res)=>{

 await Coupon.findByIdAndDelete(req.params.id)

 res.redirect("/admin/coupons")

}
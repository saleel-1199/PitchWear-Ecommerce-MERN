import {
  getAllCouponsService,
  createCouponService,
  updateCouponService,
  deleteCouponService,
} from "../../Services/Admin/admin.coupon.service.js";


export const couponsPage = async (req, res) => {
  const coupons = await getAllCouponsService();

  res.render("admin/Coupons", {
    coupons,
    error: req.query.error || null,
    editError: null,
    editData: null,
    openModal: false,

  });
};


export const createCouponController = async (req, res) => {
  try {
    await createCouponService(req.body);
    res.redirect("/admin/coupons");
  } catch (err) {
    res.redirect(`/admin/coupons?error=${encodeURIComponent(err.message)}`);
  }
};

export const updateCouponController = async (req, res) => {
  try {
    await updateCouponService(req.params.id, req.body);
    res.redirect("/admin/coupons");
  } catch (err) {
    const coupons = await getAllCouponsService();

    res.render("admin/Coupons", {
      coupons,
      error:null,
      editError: err.message,
      editData: {
        ...req.body,
        _id: req.params.id,
      },
      openModal: true,
    });
  }
};



export const deleteCouponController = async (req,res) => {
  await deleteCouponService(req.params.id);
  res.redirect("/admin/coupons");
};
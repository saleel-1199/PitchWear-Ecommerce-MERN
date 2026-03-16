import {
  getUserWishlistService,
  addToWishlistService,
  removeFromWishlistService,
} from "../../Services/Product/wishlist.service.js";


export const getWishlistPageController = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const wishlist = await getUserWishlistService(req.session.userId);

  res.render("products/Wishlist", { wishlist });
};


export const addToWishlistController = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  await addToWishlistService({
    userId: req.session.userId,
    productId: req.body.productId,
  });

  res.redirect("/shop");
};


export const removeFromWishlistController = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  await removeFromWishlistService({
    userId: req.session.userId,
    productId: req.params.productId,
  });

  res.redirect("/wishlist");
};
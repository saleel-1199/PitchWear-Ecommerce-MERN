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
  if (!req.session.userId){
    return res.redirect("/login")
  }

  try {
    await addToWishlistService({
      userId: req.session.userId,
      productId: req.body.productId,
    });

    req.session.message = "Added to wishlist ❤️";

  } catch (err) {
    req.session.message = err.message || "Something went wrong";
  }

  res.redirect("/Shop");
};


export const removeFromWishlistController = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  await removeFromWishlistService({
    userId: req.session.userId,
    productId: req.params.productId,
  });

  res.redirect("/wishlist");
};
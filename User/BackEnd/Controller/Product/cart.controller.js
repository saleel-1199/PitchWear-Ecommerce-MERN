import {
  getUserCartService,
  addToCartService,
  updateCartQuantityService,
  removeCartItemService,
} from "../../Services/Product/cart.service.js";


export const getCartPageController = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }
   
    const cart = await getUserCartService(req.session.userId);

    res.render("products/Cart", {
      cart,
      cartCount: cart.items.length,
    });

  } catch (error) {
    console.log("Cart Page Error:", error.message);
    res.redirect("/shop");
  }
};


export const addToCartController = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const { productId, size, quantity } = req.body;


    if (!size) throw new Error("Size not selected");



    await addToCartService({
      userId: req.session.userId,
      productId,
      size,
      quantity,
    });
    res.redirect("/cart");

  } 
  catch (error) {
    console.log("Add To Cart Error:", error.message);
    res.redirect(`/shop?error=${encodeURIComponent(error.message)}`);
  }
};



export const updateCartQuantityController = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const { productId } = req.params;
    const { size, action } = req.body;

    await updateCartQuantityService({
      userId: req.session.userId,
      productId,
      size,
      action,
    });

    res.redirect("/cart");

  } catch (error) {
    console.log("Qty Update Error:", error.message);
    res.redirect("/cart");
  }
};



export const removeCartItemController = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const { productId } = req.params;
    const { size } = req.body;

    await removeCartItemService({
      userId: req.session.userId,
      productId,
      size,
    });

    res.redirect("/cart");

  } catch (error) {
    console.log("Remove Error:", error.message);
    res.redirect("/cart");
  }
};
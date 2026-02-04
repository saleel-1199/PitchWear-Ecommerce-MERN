import {
  fetchProductDetailsService,
  fetchRelatedProductsService,
} from "../../Services/Product/product.service.js";

export const getProductDetailsController = async (req, res) => {
  try {
    const { slug } = req.params; 

    const product = await fetchProductDetailsService(slug); 

    if (
      !product ||
      product.isDeleted ||
      product.status !== "Active"
    ) {
      return res.redirect("/shop");
    }

    let relatedProducts = await fetchRelatedProductsService(product);

    relatedProducts = relatedProducts.filter(
      (p) => String(p._id) !== String(product._id)
    );

    res.render("products/productDetails", {
      title: product.name,
      product,
      relatedProducts,
      cartCount: req.session.cartCount || 0,
    });
  } catch (error) {
    console.log("getProductDetailsController error:", error);
    res.redirect("/shop");
  }
};

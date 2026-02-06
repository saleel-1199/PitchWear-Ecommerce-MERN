import { fetchShopProductsService } from "../../Services/Product/shop.service.js";
import { Product } from "../../Models/product.model.js";

export const shopPageController = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 8;

    const search = req.query.search || "";
    const sort = req.query.sort || "latest";

    const selectedTeams = [].concat(req.query.teams || []);
    const selectedTypes = [].concat(req.query.types || []);
    const selectedKits = [].concat(req.query.kits || []);
    
    const minPrice = req.query.minPrice || "";
    const maxPrice = req.query.maxPrice || "";


    const { products, totalPages } = await fetchShopProductsService({
      page,
      limit,
      search,
      sort,
      selectedTeams,
      selectedTypes,
      selectedKits,
       minPrice,
       maxPrice,
    });
   
    const teams = await Product.distinct("team", { 
      isDeleted: false,
      status: "Active",
    });

    res.render("products/shop", {
      title: "Shop",
      products,
      page,
      totalPages,
      search,
      sort,
      teams,
      types: ["Home", "Away"],
      kits: ["Half Sleeve", "Full Sleeve"],
      selectedTeams,
      selectedTypes,
      selectedKits,
       minPrice,
        maxPrice,
      cartCount: req.session.cartCount || 0,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

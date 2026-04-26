import { fetchShopProductsService } from "../../Services/Product/shop.service.js";
import { Team } from "../../Models/team.model.js";
import { STATES } from "mongoose";
import { STATUS_CODES } from "../../Utils/statusCodes.js";

export const shopPageController = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 8;

    const search = req.query.search || "";
    const sort = req.query.sort || "latest";

    const selectedTeams = [].concat(req.query.teams || []);

   const selectedKits = [].concat(req.query.kits || []).map(k =>
  decodeURIComponent(k)
    .replace(/\+/g, " ")
    .trim()              // ✅ ADD THIS
    .toLowerCase()
);

const selectedTypes = [].concat(req.query.types || []).map(t =>
  decodeURIComponent(t)
    .replace(/\+/g, " ")
    .trim()              // ✅ ADD THIS
    .toLowerCase()
);

console.log("RAW QUERY:", req.query.kits);
console.log("PROCESSED:", selectedKits);


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

    const teams = await Team.find({ isDeleted: false }).distinct("name");
    
    const message = req.session.message;
    const error = req.session.error;

    req.session.message = null;
    req.session.error = null;

    res.render("products/Shop", {
      title: "Shop",
      products,
      message,
      error,
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
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};
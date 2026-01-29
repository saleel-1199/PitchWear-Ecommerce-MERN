import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProductBasic,
  updateInventory,
  softDeleteProduct,
} from "../../Services/Admin/admin.product.service.js";


export const productsPage = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = 4;

    const { products, totalPages } = await getAllProducts(search, page, limit);

    res.render("Admin/Products", {
      title: "Products",
      products,
      search,
      page,
      totalPages,
    });
  } catch (error) {
    console.log("productsPage error:", error);
    res.status(500).send("Server Error");
  }
};


import { Team } from "../../Models/team.model.js";

export const addProductPage = async (req, res) => {
  const teams = await Team.find({ isDeleted: false }).lean();

  res.render("Admin/ProductAdd", {
    title: "Add Product",
    error: "",
    teams
  });
};

export const addProduct = async (req, res) => {
  try {
    await createProduct(req.body, req.files);
    return res.redirect("/admin/products");
  } catch (err) {
    console.error("Add product error:", err.message);

    let errorMessage = "Something went wrong. Please try again.";

    // 🔴 CUSTOM VALIDATION ERRORS
    if (err.message === "INVALID_NAME") {
      errorMessage = "Product name cannot be empty or spaces only.";
    } else if (err.message === "INVALID_TEAM") {
      errorMessage = "Please select a valid team.";
    } else if (err.message === "MIN_IMAGES") {
      errorMessage = "Please upload at least 3 product images.";
    }

    // 🔁 Re-render page with required data
    const teams = await Team.find({ isDeleted: false });

    return res.status(400).render("Admin/ProductAdd", {
      title: "Add Product",
      error: errorMessage,
      teams,
    });
  }
};


export const editProductPage = async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) return res.redirect("/admin/products");

  res.render("Admin/ProductEdit", {
    title: "Edit Product",
    product,
    error: "",
  });
};

export const editProduct = async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) return res.redirect("/admin/products");

  await updateProductBasic(product, req.body, req.files);
  res.redirect("/admin/products");
};


export const inventoryPage = async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) return res.redirect("/admin/products");

  res.render("Admin/ProductInventory", {
    title: "Add Stock",
    product,
  });
};

export const saveInventory = async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) return res.redirect("/admin/products");

  const incomingVariants = Object.values(req.body.variants || {});
  await updateInventory(product, incomingVariants);

  res.redirect("/admin/products");
};

export const deleteProduct = async (req, res) => {
  await softDeleteProduct(req.params.id);
  res.redirect("/admin/products");
};

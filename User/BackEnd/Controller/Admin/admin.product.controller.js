import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProductBasic,
  updateInventory,
  softDeleteProduct,
} from "../../Services/Admin/admin.product.service.js";

/* ================= LIST ================= */
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

/* ================= ADD ================= */
export const addProductPage = (req, res) => {
  res.render("Admin/ProductAdd", { title: "Add Product", error: "" });
};

export const addProduct = async (req, res) => {
  try {
    await createProduct(req.body, req.files);
    res.redirect("/admin/products");
  } catch (err) {
    if (err.message === "MIN_IMAGES") {
      return res.render("Admin/ProductAdd", {
        title: "Add Product",
        error: "Minimum 3 images required",
      });
    }
    res.status(500).send("Server Error");
  }
};

/* ================= EDIT ================= */
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

/* ================= INVENTORY ================= */
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

/* ================= DELETE ================= */
export const deleteProduct = async (req, res) => {
  await softDeleteProduct(req.params.id);
  res.redirect("/admin/products");
};

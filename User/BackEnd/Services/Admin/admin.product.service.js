import { Product } from "../../Models/product.model.js";
import { Team } from "../../Models/team.model.js";
import { saveProductImages } from "../../Utils/saveProductImages.js";

/* ================= LIST (PAGINATION + SEARCH) ================= */
export const getAllProducts = async (search = "", page = 1, limit = 4) => {
  const query = { isDeleted: false };

  if (search && search.trim() !== "") {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { team: { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
      { kitType: { $regex: search, $options: "i" } },
    ];
  }

  const totalProducts = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort({ createdAt: -1 }) // newest first
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // ✅ FIX: ALWAYS calculate full stock from variants
  const productsWithStock = products.map((p) => {
    const totalStock = (p.variants || []).reduce(
      (sum, v) => sum + Number(v.stock || 0),
      0
    );

    return {
      ...p,
      totalStock,
    };
  });

  return {
    products: productsWithStock,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
  };
};

/* ================= ADD PRODUCT ================= */
export const createProduct = async (data, files) => {
  if (!files || files.length < 3) {
    throw new Error("MIN_IMAGES");
  }

  const images = await saveProductImages(files);
  const teamName = data.team.trim();

  await Team.findOneAndUpdate(
    { name: teamName },
    { name: teamName },
    { upsert: true, new: true }
  );

  return Product.create({
    name: data.name,
    team: teamName,
    description: data.description || "",
    type: data.type,
    kitType: data.kitType,
    images,
    status: "Inactive",
    variants: [],
    totalStock: 0,
  });
};

/* ================= GET SINGLE ================= */
export const getProductById = async (id) => {
  return Product.findById(id);
};

/* ================= UPDATE BASIC INFO ================= */
export const updateProductBasic = async (product, data, files) => {
  let images = product.images || [];

  if (files && files.length > 0) {
    const newImgs = await saveProductImages(files);
    images = [...images, ...newImgs];
  }

  product.name = data.name;
  product.team = data.team;
  product.description = data.description;
  product.type = data.type;
  product.kitType = data.kitType;

  // ✅ THIS WAS MISSING
  if (data.status) {
    product.status = data.status;
  }

  product.images = images;

  return product.save();
};

/* ================= INVENTORY ================= */
export const updateInventory = async (product, incomingVariants) => {

  // Ensure array
  if (!Array.isArray(incomingVariants)) {
    incomingVariants = [];
  }

  // Map existing variants by size
  const existingMap = new Map();
  product.variants.forEach(v => {
    existingMap.set(v.size, v);
  });

  // Merge logic
  incomingVariants.forEach(v => {
    if (!v.size) return;

    const hasPrice = v.price !== undefined && v.price !== "";
    const hasStock = v.stock !== undefined && v.stock !== "";

    if (existingMap.has(v.size)) {
      const existing = existingMap.get(v.size);

      // ✅ ONLY update if value is provided
      if (hasPrice) existing.price = Number(v.price);
      if (hasStock) existing.stock = Number(v.stock);

    } else {
      // ✅ ADD new size only if stock or price exists
      product.variants.push({
        size: v.size,
        price: hasPrice ? Number(v.price) : 0,
        stock: hasStock ? Number(v.stock) : 0,
      });
    }
  });

  // Recalculate total stock
  product.totalStock = product.variants.reduce(
    (sum, v) => sum + Number(v.stock || 0),
    0
  );

  // Update status
  product.status = product.totalStock > 0 ? "Active" : "Inactive";

  return product.save();
};



/* ================= DELETE ================= */
export const softDeleteProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { isDeleted: true });
};

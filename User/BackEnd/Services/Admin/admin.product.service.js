import { Product } from "../../Models/product.model.js";
import { Team } from "../../Models/team.model.js";
import { saveProductImages } from "../../Utils/saveProductImages.js";
import slugify from "slugify";

export const getAllProducts = async (search = "", page = 1, limit = 4) => {
  const query = { isDeleted: false };

  if (search && search.trim() !== "") {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { team: { $regex: search, $options: "i" } },
      
    ];
  }

  const totalProducts = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort({ createdAt: -1 }) 
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();


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


export const createProduct = async (data, files) => {
  // 🔒 IMAGE VALIDATION
  if (!files || files.length < 3) {
    throw new Error("MIN_IMAGES");
  }

  // 🔒 NAME VALIDATION (FIX)
  if (!data.name || !data.name.trim()) {
    throw new Error("INVALID_NAME");
  }

  const productName = data.name.trim();
  const teamName = data.team?.trim();

  // 🔒 TEAM VALIDATION (OPTIONAL BUT GOOD)
  if (!teamName) {
    throw new Error("INVALID_TEAM");
  }

  // 📸 SAVE IMAGES
  const images = await saveProductImages(files);

  // ⚽ ENSURE TEAM EXISTS (UPSERT)
  await Team.findOneAndUpdate(
    { name: teamName },
    { name: teamName },
    { upsert: true }
  );

  // 📦 VARIANTS
  const incomingVariants = Object.values(data.variants || []);

  const variants = incomingVariants.map(v => ({
    size: v.size,
    price: Number(v.price || 0),
    stock: Number(v.stock || 0),
  }));

  const totalStock = variants.reduce(
    (sum, v) => sum + v.stock,
    0
  );

  // ✅ CREATE PRODUCT
  return Product.create({
    name: productName,
    slug: slugify(productName, { lower: true, strict: true }),
    team: teamName,
    description: data.description?.trim() || "",
    type: data.type,
    kitType: data.kitType,
    images,
    variants,
    totalStock,
    status: totalStock > 0 ? "Active" : "Inactive",
  });
};




export const getProductById = async (id) => {
  return Product.findById(id);
};
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


  if (data.status) {
    product.status = data.status;
  }

  product.images = images;

  return product.save();
};


export const updateInventory = async (product, incomingVariants) => {

  if (!Array.isArray(incomingVariants)) {
    incomingVariants = [];
  }


  const existingMap = new Map();
  product.variants.forEach(v => {
    existingMap.set(v.size, v);
  });


  incomingVariants.forEach(v => {
    if (!v.size) return;

    const hasPrice = v.price !== undefined && v.price !== "";
    const hasStock = v.stock !== undefined && v.stock !== "";

    if (existingMap.has(v.size)) {
      const existing = existingMap.get(v.size);

      
      if (hasPrice) existing.price = Number(v.price);
      if (hasStock) existing.stock = Number(v.stock);

    } else {
      
      product.variants.push({
        size: v.size,
        price: hasPrice ? Number(v.price) : 0,
        stock: hasStock ? Number(v.stock) : 0,
      });
    }
  });

  product.totalStock = product.variants.reduce(
    (sum, v) => sum + Number(v.stock || 0),
    0
  );


  product.status = product.totalStock > 0 ? "Active" : "Inactive";

  return product.save();
};




export const softDeleteProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { isDeleted: true });
};

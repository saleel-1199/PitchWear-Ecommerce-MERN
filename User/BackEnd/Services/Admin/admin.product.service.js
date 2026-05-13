import { Product } from "../../Models/product.model.js";
import { Team } from "../../Models/team.model.js";
import { saveProductImages } from "../../Utils/saveProductImages.js";
import slugify from "slugify";

export const getAllProducts = async (search = "", page = 1, limit = 4) => {

  const activeTeams = await Team.find({ isDeleted: false });
  const activeTeamIds = activeTeams.map(t => t._id);   

  const query = { 
    team: { $in: activeTeamIds }  
  };

  if (search && search.trim() !== "") {
    query.name = { $regex: search, $options: "i" };  
  }

  const totalProducts = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("team")   
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

  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "Product name is required";
  } else if (data.name.trim().length < 3) {
    errors.name = "Product name must be at least 3 characters";
  }

  if (!data.team) {
    errors.team = "Please select a team";
  } else {
    const teamExists = await Team.findById(data.team);
    if (!teamExists || teamExists.isDeleted) {
      errors.team = "Invalid team selected";
    }
  }

  if (!files || files.length < 3) {
    errors.images = "At least 3 images are required";
  }

  if (!data.type) {
    errors.type = "Please select product type";
  }

  if (!data.kitType) {
    errors.kitType = "Please select kit type";
  }

  const incomingVariants = Object.values(data.variants || []);

  if (!incomingVariants.length) {
    errors.variants = "At least one variant is required";
  }

  incomingVariants.forEach((v, i) => {
    if (!v.size) {
      errors[`size_${i}`] = "Size is required";
    }

   if (
  v.price !== "" &&
  Number(v.price) < 0
) {
  errors[`price_${i}`] =
    "Price cannot be negative";
}

if (
  v.stock !== "" &&
  Number(v.stock) < 0
) {
  errors[`stock_${i}`] =
    "Stock cannot be negative";
}
  });

  if (Object.keys(errors).length > 0) {
    throw { type: "VALIDATION", errors };
  }

  const productName = data.name.trim();

  const images = await saveProductImages(files);

  const variants = incomingVariants.map(v => ({
    size: v.size,
    price: Number(v.price),
    stock: Number(v.stock)
  }));

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return Product.create({
    name: productName,
    slug: slugify(productName, { lower: true, strict: true }),
    team: data.team,
    description: data.description?.trim() || "",
    type: data.type,
    kitType: data.kitType,
    images,
    variants,
    totalStock
  });
};


export const getProductById = async (id) => {
  return Product.findById(id).populate("team");   
};


export const updateProductBasic = async (product, data, files) => {

 let images = [...(product.images || [])];

if (files && files.length > 0) {

  for (const file of files) {

    const saved = await saveProductImages([file]);

    const match = file.originalname.match(/image-(\d+)/);

    const index = match ? parseInt(match[1]) : null;

    if (index !== null) {
      images[index] = saved[0];   
    }
  }
}

  const teamExists = await Team.findById(data.team);
  if (!teamExists) throw new Error("INVALID_TEAM");

  return Product.findByIdAndUpdate(
    product._id,
    {
      name: data.name,
      team: data.team,
      description: data.description,
      type: data.type,
      kitType: data.kitType,
      images,
      ...(data.status && { status: data.status })
    },
    { new: true }
  );
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


  product.status = "Active";

  return product.save();
};




export const softDeleteProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { isDeleted: true });
};

export const restoreProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { isDeleted: false });
};
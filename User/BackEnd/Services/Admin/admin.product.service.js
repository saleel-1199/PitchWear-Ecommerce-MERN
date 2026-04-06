import { Product } from "../../Models/product.model.js";
import { Team } from "../../Models/team.model.js";
import { saveProductImages } from "../../Utils/saveProductImages.js";
import slugify from "slugify";

export const getAllProducts = async (search = "", page = 1, limit = 4) => {

  const activeTeams = await Team.find({ isDeleted: false });
  const activeTeamIds = activeTeams.map(t => t._id);   

  const query = { 
    isDeleted: false,
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
 
  if (!files || files.length < 3) {
    throw new Error("MIN_IMAGES");
  }
  
  if (!data.name || !data.name.trim()) {
    throw new Error("INVALID_NAME");
  }

  const productName = data.name.trim();
  const teamId = data.team;   

  if (!teamId) {
    throw new Error("INVALID_TEAM");
  }

  const teamExists = await Team.findById(teamId);   
  if (!teamExists || teamExists.isDeleted) {
    throw new Error("INVALID_TEAM");
  }

  const images = await saveProductImages(files);

  const incomingVariants = Object.values(data.variants || []);

  

  const variants = incomingVariants.map(v => ({
    size: v.size,
    price: Number(v.price || 0),
    stock: Number(v.stock || 0)
  }));
  

  

  const totalStock = variants.reduce(
    (sum, v) => sum + v.stock,
    0
  );

  return Product.create({
    name: productName,
    slug: slugify(productName, { lower: true, strict: true }),
    team: teamId,   
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
  let images = product.images || [];

  if (files && files.length > 0) {
    const newImgs = await saveProductImages(files);
    images = [...images, ...newImgs];
  }

  const teamExists = await Team.findById(data.team);   
  if (!teamExists) throw new Error("INVALID_TEAM");

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


  product.status = "Active";

  return product.save();
};




export const softDeleteProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { isDeleted: true });
};

import { Product } from "../../Models/product.model.js";

export const fetchShopProductsService = async ({
  page = 1,
  limit = 9,
  search = "",
  sort = "latest",
  selectedTeams = [],
  selectedTypes = [],
  selectedKits = [],
  minPrice = "",
  maxPrice = "",
}) => {

  const match = {
    isDeleted: false,
    status: "Active",
  };

  // 🔍 SEARCH
  if (search && search.trim()) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { team: { $regex: search, $options: "i" } },
    ];
  }

  // 🎯 FILTERS
  if (selectedTeams.length) match.team = { $in: selectedTeams };
  if (selectedTypes.length) match.type = { $in: selectedTypes };
  if (selectedKits.length) match.kitType = { $in: selectedKits };

  // 🔃 SORT
  let sortStage = { createdAt: -1 };
  if (sort === "az") sortStage = { name: 1 };
  if (sort === "za") sortStage = { name: -1 };
  if (sort === "priceLow") sortStage = { displayPrice: 1 };
  if (sort === "priceHigh") sortStage = { displayPrice: -1 };

  // 🧠 PIPELINE START
  const pipeline = [
    { $match: match },

    // ✅ only variants with stock
    {
      $addFields: {
        availableVariants: {
          $filter: {
            input: "$variants",
            as: "v",
            cond: { $gt: ["$$v.stock", 0] },
          },
        },
      },
    },

    // ✅ calculate display price
    {
      $addFields: {
        displayPrice: {
          $cond: [
            { $gt: [{ $size: "$availableVariants" }, 0] },
            { $min: "$availableVariants.price" },
            0,
          ],
        },
      },
    },
  ];

  // 💰 PRICE RANGE FILTER (AFTER price exists)
  if (minPrice || maxPrice) {
    pipeline.push({
      $match: {
        displayPrice: {
          ...(minPrice && { $gte: Number(minPrice) }),
          ...(maxPrice && { $lte: Number(maxPrice) }),
        },
      },
    });
  }

  // 🔚 FINAL STEPS
  pipeline.push(
    { $sort: sortStage },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  const products = await Product.aggregate(pipeline);
  const total = await Product.countDocuments(match);

  return {
    products,
    totalPages: Math.ceil(total / limit),
  };
};

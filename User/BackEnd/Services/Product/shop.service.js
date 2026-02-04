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

  if (search && search.trim()) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { team: { $regex: search, $options: "i" } },
    ];
  }

  if (selectedTeams.length) match.team = { $in: selectedTeams };
  if (selectedTypes.length) match.type = { $in: selectedTypes };
  if (selectedKits.length) match.kitType = { $in: selectedKits };

  let sortStage = { createdAt: -1 };
  if (sort === "az") sortStage = { name: 1 };
  if (sort === "za") sortStage = { name: -1 };
  if (sort === "priceLow") sortStage = { displayPrice: 1 };
  if (sort === "priceHigh") sortStage = { displayPrice: -1 };

  const pipeline = [
    { $match: match },
    {
      $addFields: {
        validVariants: {
          $filter: {
            input: "$variants",
            as: "v",
            cond: {
              $and: [
                { $gt: ["$$v.stock", 0] },
                { $gt: ["$$v.price", 0] },
              ],
            },
          },
        },
      },
    },
    

    {
      $addFields: {
        displayPrice: {
          $cond: [
            { $gt: [{ $size: "$validVariants" }, 0] },
            { $min: "$validVariants.price" },
            0,
          ],
        },
      },
    },
  ];

  
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

  pipeline.push(
    { $sort: sortStage },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  const countPipeline = pipeline.filter(
  stage => !("$skip" in stage) && !("$limit" in stage)
);

countPipeline.push({ $count: "total" });

const [products, countResult] = await Promise.all([
  Product.aggregate(pipeline),
  Product.aggregate(countPipeline),
]);

const total = countResult[0]?.total || 0;

return {
  products,
  totalPages: Math.ceil(total / limit),
};
};

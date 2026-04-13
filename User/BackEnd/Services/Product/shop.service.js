import { Product } from "../../Models/product.model.js";
import { Team } from "../../Models/team.model.js";

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

  
  const activeTeamIds = await Team.find({ isDeleted: false }).distinct("_id");

  const match = {
    isDeleted: false,
    status: "Active",
    team: { $in: activeTeamIds },
  };

  
  if (selectedTeams.length) {
    const selectedTeamIds = await Team.find({
      name: { $in: selectedTeams }
    }).distinct("_id");

    match.team = { $in: selectedTeamIds };
  }

 if (selectedTypes.length) {
  match.type = {
    $in: selectedTypes.map(t => new RegExp(`^${t}$`, "i"))
  };
}

if (selectedKits.length) {
  match.kitType = {
    $in: selectedKits.map(k => new RegExp(`^${k}$`, "i"))
  };
}
  let sortStage = { createdAt: -1 };
  if (sort === "az") sortStage = { name: 1 };
  if (sort === "za") sortStage = { name: -1 };
  if (sort === "priceLow") sortStage = { displayPrice: 1 };
  if (sort === "priceHigh") sortStage = { displayPrice: -1 };

  const pipeline = [
    { $match: match },

    
    {
      $lookup: {
        from: "teams",
        localField: "team",
        foreignField: "_id",
        as: "teamData",
      },
    },
    { $unwind: "$teamData" },


    ...(search && search.trim()
      ? [{
          $match: {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { "teamData.name": { $regex: search, $options: "i" } },
            ],
          },
        }]
      : []),


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
        totalStock: { $sum: "$variants.stock" },
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
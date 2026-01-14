import { User } from "../../Models/user.model.js";

export const fetchUsersService = async ({
  page = 1,
  limit = 5,
  search = "",
  status = "",
  sort = "latest",
}) => {
  page = Number(page);
  limit = Number(limit);

  const query = {};


  if (search && search.trim() !== "") {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone_no: { $regex: search, $options: "i" } },
    ];
  }


  if (status === "blocked") query.isBlocked = true;
  if (status === "active") query.isBlocked = false;


  const sortQuery = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const totalUsers = await User.countDocuments(query);

  const users = await User.find(query)
    .sort(sortQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    page,
  };
};

export const toggleBlockUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.isBlocked = !user.isBlocked;
  await user.save();

  return user;
};


// import { User } from "../../Models/user.model.js";

// export const fetchUsersService = async ({ page, limit, search, status, sort }) => {
//   const skip = (page - 1) * limit;

//   // ✅ Always show only unblocked users
//  //    const filter = { isBlocked: false };

//   // ✅ search filter
//   if (search) {
//     filter.$or = [
//       { fullName: { $regex: search, $options: "i" } },
//       { email: { $regex: search, $options: "i" } },
//       { username: { $regex: search, $options: "i" } }
//     ];
//   }

//   // ✅ sorting
//   let sortQuery = { createdAt: -1 };
//   if (sort === "oldest") sortQuery = { createdAt: 1 };
//   if (sort === "az") sortQuery = { fullName: 1 };
//   if (sort === "za") sortQuery = { fullName: -1 };

//   const users = await User.find(filter)
//     .sort(sortQuery)
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   const totalUsers = await User.countDocuments(filter);
//   const totalPages = Math.ceil(totalUsers / limit);

//   return { users, totalPages };
// };

// // ✅ ADD THIS FUNCTION (missing export)
// export const toggleBlockUserService = async (id) => {
//   const user = await User.findById(id);
//   if (!user) return null;

//   user.isBlocked = !user.isBlocked;
//   await user.save();

//   return user;
// };

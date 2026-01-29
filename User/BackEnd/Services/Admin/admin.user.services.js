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
    ];
  }


  if (status === "blocked") query.isBlocked = true;
  if (status === "active") query.isBlocked = false;


  const sortQuery = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const totalUsers = await User.countDocuments(query);

  const users = await  User.find(query)
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




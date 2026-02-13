import { Team } from "../../Models/team.model.js";


export const getAllTeams = async (search = "", page = 1, limit = 4) => {
  const query = {
    isDeleted: false
  };

  
  if (search && search.trim() !== "") {
    query.name = { $regex: search, $options: "i" };
  }

  const totalTeams = await Team.countDocuments(query);

  const teams = await Team.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    teams,
    totalPages: Math.ceil(totalTeams / limit),
    currentPage: page
  };
};


export const createTeam = async (name) => {
  if (!name || !name.trim()) {
    throw new Error("Team name is required");
  }

  const teamName = name.trim().toUpperCase();

   const existing = await Team.findOne({name:teamName})

   if(existing){
      throw new Error ("Team already exists")
   }

   return await Team.create({
    name:teamName,
    isDeleted:false
  })
};


export const getTeamById = async (id) => {
  return Team.findById(id);
};


export const updateTeamNameService = async (teamId, newName) => {
  if (!newName) {
    throw new Error("Team name is required");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("TEAM_NOT_FOUND");
  }

  team.name = newName;
  await team.save();

  return team;
};


export const softDeleteTeam = async (id) => {
  return Team.findByIdAndUpdate(id, { isDeleted: true });
};

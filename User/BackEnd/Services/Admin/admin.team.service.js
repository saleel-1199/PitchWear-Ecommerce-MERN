import { Team } from "../../Models/team.model.js";


export const getAllTeams = async () => {
  return await Team.find({ isDeleted: false }).sort({ name: 1 });
};


export const createTeam = async (name) => {
  if (!name || !name.trim()) {
    throw new Error("Team name is required");
  }

  const teamName = name.trim();

  return await Team.findOneAndUpdate(
    { name: teamName },
    { name: teamName, isDeleted: false }, 
    { upsert: true, new: true }
  );
};


export const softDeleteTeam = async (id) => {
  return await Team.findByIdAndUpdate(id, { isDeleted: true });
};

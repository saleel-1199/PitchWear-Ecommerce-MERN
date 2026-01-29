import { Team } from "../../Models/team.model.js";

/* GET ALL TEAMS */
export const getAllTeams = async () => {
  return await Team.find({ isDeleted: false }).sort({ name: 1 });
};

/* ADD TEAM (UPSERT) */
export const createTeam = async (name) => {
  if (!name || !name.trim()) {
    throw new Error("Team name is required");
  }

  const teamName = name.trim();

  return await Team.findOneAndUpdate(
    { name: teamName },
    { name: teamName, isDeleted: false }, // 👈 revive if soft-deleted
    { upsert: true, new: true }
  );
};

/* SOFT DELETE TEAM */
export const softDeleteTeam = async (id) => {
  return await Team.findByIdAndUpdate(id, { isDeleted: true });
};

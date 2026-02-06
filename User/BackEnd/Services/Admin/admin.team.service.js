import { Team } from "../../Models/team.model.js";


export const getAllTeams = async () => {
  return await Team.find().sort({"name":1})
 
};


export const createTeam = async (name) => {
  if (!name || !name.trim()) {
    throw new Error("Team name is required");
  }

  const teamName = name.trim();

   const existing = await Team.findOne({name:teamName})

   if(existing){
      throw new Error ("Team already exists")
   }

   return await Team.create({name:teamName})
};

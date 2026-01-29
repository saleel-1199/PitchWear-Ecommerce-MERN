import {
  getAllTeams,
  createTeam,
  softDeleteTeam
} from "../../Services/Admin/admin.team.service.js";

/* GET TEAMS PAGE */
export const teamsPage = async (req, res) => {
  try {
    const teams = await getAllTeams();
    res.render("Admin/Teams", { teams });
  } catch (error) {
    console.error("teamsPage error:", error);
    res.status(500).send("Server Error");
  }
};

/* ADD TEAM */
export const addTeam = async (req, res) => {
  try {
    await createTeam(req.body.name);
    res.redirect("/admin/teams");
  } catch (error) {
    console.error("addTeam error:", error);
    res.redirect("/admin/teams");
  }
};

/* SOFT DELETE TEAM */
export const deleteTeam = async (req, res) => {
  try {
    await softDeleteTeam(req.params.id);
    res.redirect("/admin/teams");
  } catch (error) {
    console.error("deleteTeam error:", error);
    res.redirect("/admin/teams");
  }
};

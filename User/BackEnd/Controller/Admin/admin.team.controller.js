import {
  getAllTeams,
  createTeam
} from "../../Services/Admin/admin.team.service.js";


export const teamsPage = async (req, res) => {
  
  try {
    const teams = await getAllTeams();
    res.render("Admin/Teams", { 
      teams,
      error:req.query.error || null,
      showModal:!!req.query.error
     });
  } catch (error) {
    console.error("teamsPage error:", error);
    res.status(500).send("Server Error");
  }
};


export const addTeam = async (req, res) => {
  try {
    await createTeam(req.body.name);
    res.redirect("/admin/teams");
  } catch (error) {
    res.redirect(
      `/admin/teams?error=${encodeURIComponent(error.message)}`
    );
  }
};


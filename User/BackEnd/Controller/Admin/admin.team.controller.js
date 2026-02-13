import {
  getAllTeams,
  createTeam,
  getTeamById,
  updateTeamNameService,
  softDeleteTeam
} from "../../Services/Admin/admin.team.service.js";


export const teamsPage = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 4 ,error: errorMessage=null} = req.query;

    const data = await getAllTeams(
      search,
      Number(page),
      Number(limit)
    );

    res.render("Admin/Teams", {
      teams: data.teams,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      search,
      showModal: false ,
      error:errorMessage
    });
  } catch (error) {
    console.error("Teams Page Error:", error);
    res.status(500).send("Internal Server Error");
  }
};




export const addTeam = async (req, res) => {
  try {
    await createTeam(req.body.name);
    res.redirect("/admin/teams");
  } catch (error) {

    const { search = "", page = 1, limit = 4 } = req.query;

    const data = await getAllTeams(
      search,
      Number(page),
      Number(limit)
    );

    res.render("Admin/Teams", {
      teams: data.teams,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      search,
      showModal: true,              
      error: error.message,    
    });
  }
};

export const editTeamPage = async (req, res) => {
  const team = await getTeamById(req.params.id);
  if (!team) return res.redirect("/admin/teams");

  res.render("Admin/TeamsEdit", {
    team,
    page: req.query.page || 1,
    search: req.query.search || ""
  });
};


export const updateTeamName = async (req, res) => {
  try {
    const teamId = req.params.id;
    const newName = req.body.name?.trim();

    if (!newName) {
      return res.status(400).send("Team name is required");
    }

    await updateTeamNameService(teamId, newName);
    res.redirect("/admin/teams");

  } catch (error) {
    console.error("Edit Team Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const deleteTeam = async (req, res) => {
  const { page = 1, search = "" } = req.query;

  await softDeleteTeam(req.params.id);

  res.redirect(`/admin/teams?page=${page}&search=${search}`);
};


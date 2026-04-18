import {
  getAllTeams,
  createTeam,
  getTeamById,
  updateTeamNameService,
  softDeleteTeam
} from "../../Services/Admin/admin.team.service.js";


export const teamsPage = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 4 ,error: errorMessage=null,  showModal = false } = req.query;

    const data = await getAllTeams(
      search,
      Number(page),
      Number(limit)
    );

      if (page > data.totalPages && data.totalPages > 0) {
      return res.redirect(`/admin/teams?page=${data.totalPages}&search=${search}`);
    }

    res.render("admin/Teams", {
      teams: data.teams,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      search,
     showModal: showModal === "true",  
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
      error: error.message    
    });
  }
};

export const editTeamPage = async (req, res) => {
  const team = await getTeamById(req.params.id);
  if (!team) return res.redirect("/admin/teams");

  res.render("admin/TeamsEdit", {
    team,
    page: req.query.page || 1,
    search: req.query.search || "",
    error:null
  });
};


export const updateTeamName = async (req, res) => {
  try {
    const teamId = req.params.id;
    const newName = req.body.name?.trim();

    const { page = 1, search = "" } = req.query;

    if (!newName) {
      throw new Error("Team name is required");
    }

    await updateTeamNameService(teamId, newName);

    res.redirect(`/admin/teams?page=${page}&search=${search}`);

  } catch (error) {

    console.log("Update Team Error:", error.message);

    const { page = 1, search = "" } = req.query;

    const team = await getTeamById(req.params.id);

    res.render("admin/TeamsEdit", {
      team: {
        ...team.toObject(),
        name: req.body.name 
      },
      error: error.message,
      page,
      search
    });
  }
};

export const deleteTeam = async (req, res) => {
 try {
  
   const { page = 1, search = "" } = req.query;

  await softDeleteTeam(req.params.id);

  res.redirect(`/admin/teams?page=${page}&search=${search}`);
 } catch (error) {
const { page = 1, search = "" } = req.query;

   return res.redirect(
    `/admin/teams?page=${page}&search=${search}&error=${encodeURIComponent(error.message)}`
    );
}
};


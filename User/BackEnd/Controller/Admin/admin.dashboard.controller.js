import * as dashboardService from "../../Services/Admin/admin.dashboard.service.js";

export const getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    
    console.log("DATA:", data);

    res.render("admin/dashboard", data);

  } catch (error) {
    console.log(error);
    res.status(500).send("Dashboard Error");
  }  
};
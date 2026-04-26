import * as dashboardService from "../../Services/Admin/admin.dashboard.service.js";
import { STATUS_CODES } from "../../Utils/statusCodes.js";

export const getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    
    console.log("DATA:", data);

    res.render("admin/Dashboard", data);

  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Dashboard Error");
  }  
};
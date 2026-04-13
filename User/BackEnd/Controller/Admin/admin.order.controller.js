import {
     getAdminOrdersService,
     getOrderDetailService,
     updateOrderStatusService,
     updateItemStatusService,
     approveReturnService

    } from "../../Services/Admin/admin.order.service.js";

export const adminOrdersPage = async (req, res) => {
  try {
    const { search = "", status = "", page = 1 } = req.query;

    const data = await getAdminOrdersService({
      search,
      status,
      page: Number(page),
      limit: 8,
    });

    res.render("admin/Orders", {
      ...data,
      search,
      status,
    });

  } catch (error) {
    console.log("Admin Orders Error:", error.message);
    res.redirect("/admin");
  }
};

export const adminOrderDetailPage = async (req, res) => {
  try {

    const order = await getOrderDetailService(req.params.id);

    res.render("admin/OrderDetail", { order });

  } catch (error) {
    console.log("Order Detail Error:", error.message);
    res.redirect("/admin/Orders");
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {

    await updateOrderStatusService(req.params.id, req.body.status);

    res.redirect(`/admin/Orders/${req.params.id}`);

  } catch (error) {
    console.log("Status Update Error:", error.message);
    res.redirect("back");
  }
};

export const updateItemStatusController = async (req, res) => {
  try {
    await updateItemStatusService(
      req.params.orderId,
      req.params.itemId,
      req.body.status
    );

    res.redirect(`/admin/Orders/${req.params.orderId}`);

  } catch (error) {
    console.log(error.message);
    res.redirect("back");
  }
};

export const approveReturnController = async (req, res) => {
  try {

    await approveReturnService(
      req.params.orderId,
      req.params.itemId
    );

    res.redirect(`/admin/Orders/${req.params.orderId}`);

  } catch (error) {
    console.log(error.message);
    res.redirect(`/admin/Orders/${req.params.orderId}`);
  }
};
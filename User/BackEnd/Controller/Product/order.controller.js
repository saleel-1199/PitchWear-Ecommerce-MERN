import {
  getUserOrdersService,
  getOrderDetailService,
  cancelOrderService,
  returnOrderService
} from "../../Services/Product/order.service.js";

import { generateInvoiceService } from "../../Services/Product/order.service.js";

export const getUserOrdersController = async (req, res) => {
  try {

    if (!req.session.userId)
      return res.redirect("/login");

    const { search = "" } = req.query;

    const orders = await getUserOrdersService(
      req.session.userId,
      search
    );

    res.render("products/OrderDetails", {
      orders,
      search,
      cartCount: 0
    });

  } catch (error) {
    res.redirect("/profile");
  }
};

export const getOrderDetailController = async (req, res) => {
  try {

    if (!req.session.userId)
      return res.redirect("/login");

    const order = await getOrderDetailService(
      req.params.orderId,
      req.session.userId
    );

    return res.render("products/OrderItemDetail", {
      order,
      cartCount: 0,
      returnError: req.query.returnError || null,
     errorItemId: req.query.itemId || null
    });

  } catch (error) {
    console.log(error);
    res.redirect("/orders");
  }
};

export const cancelOrderController = async (req, res) => {

  cancelOrderService(
  req.params.orderId,
  req.session.userId,
  req.params.itemId
);

  res.redirect(`/orders/${req.params.orderId}`);
};

export const returnOrderController = async (req, res) => {

  await returnOrderService(
    req.params.orderId,
    req.session.userId,
    req.params.itemId,
    req.body.reason
  );

  res.redirect(`/orders/${req.params.orderId}`);
};





export const downloadInvoiceController = async (req, res) => {
  try {

    const order = await generateInvoiceService(
      req.params.orderId,
      req.session.userId
    );

    if (!order) return res.redirect("/orders");

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${order.orderId}.pdf`
    );

    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("PitchWear Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order.orderId}`);
    doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);
    doc.text(`Payment: ${order.paymentMethod}`);
    doc.moveDown();

    doc.text("Customer Details:");
    console.log("Full name value:", order.addressSnapshot.fullName);
    doc.text(order.addressSnapshot.fullName);
    doc.text(order.addressSnapshot.addressLine);
    doc.text(
      `${order.addressSnapshot.city}, ${order.addressSnapshot.state} `
    );

    doc.moveDown();

    doc.text("Items:");
    doc.moveDown(0.5);

    order.items.forEach(item => {
      doc.text(
        `${item.product.name} | Size: ${item.size} | Qty: ${item.quantity} | ₹${item.price * item.quantity}`
      );
    });

    doc.moveDown();

    doc.text(`Subtotal: ₹${order.subtotal}`);
    doc.text(`Shipping: ₹${order.deliveryFee}`);
    doc.text(`Tax: ₹${order.tax}`);
    doc.text(`Total: ₹${order.finalTotal}`);

    doc.end();

  } catch (error) {
    console.log(error);
    res.redirect("/orders");
  }
};
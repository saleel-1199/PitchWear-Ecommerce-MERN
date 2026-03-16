import {
  getUserOrdersService,
  getOrderDetailService,
  cancelOrderService,
  returnOrderService
} from "../../Services/Product/order.service.js";

import path from "path";

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
  try {
    await returnOrderService(
      req.params.orderId,
      req.session.userId,
      req.params.itemId,
      req.body.reason
    );

    res.redirect(`/orders/${req.params.orderId}`);

  } catch (error) {
    console.error("Return Order Error:", error.message);
    res.status(400).render("errorPage", { message: error.message });
  }
};




export const downloadInvoiceController = async (req, res) => {
try {

const order = await generateInvoiceService(
  req.params.orderId,
  req.session.userId
);

if (!order) return res.redirect("/orders");

const PDFDocument = (await import("pdfkit")).default;

const doc = new PDFDocument({ margin: 40 });



res.setHeader(
  "Content-Disposition",
  `attachment; filename=${order.orderId}.pdf`
);

res.setHeader("Content-Type", "application/pdf");



doc.pipe(res);



/* ===== LOAD FONTS ===== */

doc.registerFont(
  "regular",
  path.join("User", "BackEnd", "Fonts", "NotoSans-Regular.ttf")
);

doc.registerFont(
  "bold",
  path.join("User", "BackEnd", "Fonts", "NotoSans-Bold.ttf")
);

/* ===== HEADER ===== */

doc
  .rect(0, 0, doc.page.width, 80)
  .fill("#5f7550");

doc
  .fillColor("white")
  .font("bold")
  .fontSize(26)
  .text("PitchWear", 40, 30);

doc
  .fontSize(18)
  .text("INVOICE", 450, 35);



doc.fillColor("black");



/* ===== ORDER INFO ===== */

doc
  .font("regular")
  .fontSize(11)
  .text(`Order ID: ${order.orderId}`, 400, 110)
  .text(`Date: ${new Date(order.createdAt).toDateString()}`, 400, 125)
  .text(`Payment: ${order.paymentMethod}`, 400, 140);



/* ===== BILLING ADDRESS ===== */

const address = order.addressSnapshot;

doc
  .font("bold")
  .fontSize(13)
  .text("Billing Details", 40, 110);

doc
  .font("regular")
  .fontSize(11)
  .text(address?.fullName || "", 40, 130)
  .text(address?.addressLine || "", 40, 145)
  .text(`${address?.city || ""}, ${address?.state || ""} ${address?.pincode || ""}`, 40, 160)
  .text(`Phone: ${address?.phone || ""}`, 40, 175);



/* ===== TABLE HEADER ===== */

let tableTop = 230;

doc
  .rect(40, tableTop - 10, 520, 25)
  .fill("#f2f2f2");

doc
  .fillColor("black")
  .font("bold")
  .fontSize(11)
  .text("Product", 50, tableTop)
  .text("Size", 310, tableTop)
  .text("Qty", 360, tableTop)
  .text("Price", 410, tableTop)
  .text("Total", 470, tableTop);



/* ===== ITEMS ===== */

let y = tableTop + 30;

order.items.forEach(item => {

  const total = item.price * item.quantity;

  doc
    .font("regular")
    .fontSize(11)
    .text(item.product?.name || "Product", 50, y)
    .text(item.size, 310, y)
    .text(item.quantity, 360, y)
    .text(`₹ ${item.price}`, 410, y)
    .text(`₹ ${total}`, 470, y);

  y += 25;

  doc
    .moveTo(40, y - 10)
    .lineTo(560, y - 10)
    .strokeColor("#dddddd")
    .stroke();
});



/* ===== TOTAL SECTION ===== */

y += 20;

doc
  .font("regular")
  .fontSize(11)
  .text(`Subtotal: ₹ ${order.subtotal}`, 400, y);

y += 18;

doc
  .text(`Shipping: ₹ ${order.deliveryFee}`, 400, y);

y += 18;

doc
  .text(`Tax: ₹ ${order.tax}`, 400, y);

y += 22;

doc
  .font("bold")
  .fontSize(14)
  .text(`Total: ₹ ${order.finalTotal}`, 400, y);



/* ===== FOOTER ===== */

doc
  .font("regular")
  .fontSize(10)
  .fillColor("gray")
  .text(
    "Thank you for shopping with PitchWear",
    40,
    doc.page.height - 50,
    { align: "center" }
  );



doc.end();

} catch (error) {

console.log(error);
res.redirect("/orders");

}
};



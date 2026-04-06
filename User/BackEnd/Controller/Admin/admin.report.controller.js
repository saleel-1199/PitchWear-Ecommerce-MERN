import ExcelJS from "exceljs"
import { Order } from "../../Models/order.model.js"
import PDFDocument from "pdfkit"

export const salesReportPage = async (req,res)=>{

 const { filter, startDate, endDate } = req.query

 let query = {
  status:"Delivered"
 }

 const now = new Date()

 if(filter === "daily"){

  const start = new Date()
  start.setHours(0,0,0,0)

  const end = new Date()
  end.setHours(23,59,59,999)

  query.createdAt = { $gte:start, $lte:end }

 }

 if(filter === "weekly"){

  const start = new Date()
  start.setDate(now.getDate()-7)

  query.createdAt = { $gte:start }

 }

 if(filter === "yearly"){

  const start = new Date()
  start.setFullYear(now.getFullYear()-1)

  query.createdAt = { $gte:start }

 }

 if(startDate && endDate){

  query.createdAt = {
   $gte:new Date(startDate),
   $lte:new Date(endDate)
  }

 }

 const reports = await Order.find(query)
 .sort({createdAt:-1})

 res.render("Admin/SalesReport",{
  reports,
  filter,
  startDate,
  endDate
 })

}


export const downloadExcelReportController = async (req,res)=>{

const { filter, startDate, endDate } = req.query;

let query = { status: "Delivered" };
const now = new Date();

if (filter === "daily") {
  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  query.createdAt = { $gte: start, $lte: end };
}

if (filter === "weekly") {
  const start = new Date();
  start.setDate(now.getDate() - 7);

  query.createdAt = { $gte: start };
}

if (filter === "yearly") {
  const start = new Date();
  start.setFullYear(now.getFullYear() - 1);

  query.createdAt = { $gte: start };
}

if (startDate && endDate) {
  query.createdAt = {
    $gte: new Date(startDate),
    $lte: new Date(endDate)
  };
}

const orders = await Order.find(query);

 const workbook = new ExcelJS.Workbook()

 const sheet = workbook.addWorksheet("Sales Report")

 sheet.columns = [
  {header:"Order ID",key:"orderId"},
  {header:"Date",key:"createdAt"},
  {header:"Subtotal",key:"subtotal"},
  {header:"Discount",key:"discount"},
  {header:"Final Total",key:"finalTotal"}
 ]

 orders.forEach(order=>{
  sheet.addRow({
   orderId:order.orderId,
   createdAt:new Date(order.createdAt).toDateString(),
   subtotal:order.subtotal,
   discount:order.discount,
   finalTotal:order.finalTotal
  })
 })

 res.setHeader(
 "Content-Type",
 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
 )

 res.setHeader(
 "Content-Disposition",
 "attachment; filename=sales-report.xlsx"
 )

 await workbook.xlsx.write(res)

 res.end()

}


export const downloadPDFReportController = async (req,res)=>{

 const { filter, startDate, endDate } = req.query;

let query = { status: "Delivered" };
const now = new Date();

if (filter === "daily") {
  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  query.createdAt = { $gte: start, $lte: end };
}

if (filter === "weekly") {
  const start = new Date();
  start.setDate(now.getDate() - 7);

  query.createdAt = { $gte: start };
}

if (filter === "yearly") {
  const start = new Date();
  start.setFullYear(now.getFullYear() - 1);

  query.createdAt = { $gte: start };
}

if (startDate && endDate) {
  query.createdAt = {
    $gte: new Date(startDate),
    $lte: new Date(endDate)
  };
}

const orders = await Order.find(query);

 const doc = new PDFDocument({ margin:40 })

 res.setHeader(
 "Content-Disposition",
 "attachment; filename=sales-report.pdf"
 )

 res.setHeader("Content-Type","application/pdf")

 doc.pipe(res)

 /* HEADER */

 doc.rect(0,0,doc.page.width,80).fill("#5f7550")

 doc
  .fillColor("white")
  .fontSize(26)
  .text("PitchWear",40,30)

 doc
  .fontSize(18)
  .text("SALES REPORT",420,35)

 doc.fillColor("black")

 /* REPORT DATE */

 doc
  .fontSize(11)
  .text(`Generated On: ${new Date().toDateString()}`,400,110)

 /* TABLE HEADER */

 let tableTop = 160

 doc.rect(40,tableTop-10,520,25).fill("#f2f2f2")

 doc
  .fillColor("black")
  .fontSize(11)
  .text("Order ID",50,tableTop)
  .text("Date",180,tableTop)
  .text("Subtotal",300,tableTop)
  .text("Discount",390,tableTop)
  .text("Total",480,tableTop)

 /* TABLE DATA */

 let y = tableTop + 30
 let totalSales = 0

 orders.forEach(order=>{

  totalSales += order.finalTotal

  doc
   .fontSize(11)
   .text(order.orderId,50,y)
   .text(new Date(order.createdAt).toDateString(),180,y)
   .text(`₹${order.subtotal}`,300,y)
   .text(`₹${order.discount}`,390,y)
   .text(`₹${order.finalTotal}`,480,y)

  y += 25

  doc.moveTo(40,y-10).lineTo(560,y-10).strokeColor("#dddddd").stroke()

 })

 /* TOTAL */

 y += 20

 doc
  .fontSize(14)
  .text(`Total Sales: ₹${totalSales}`,400,y)

 /* FOOTER */

 doc
  .fontSize(10)
  .fillColor("gray")
  .text(
   "PitchWear Admin Report",
   40,
   doc.page.height-50,
   {align:"center"}
  )

 doc.end()

}
import { Order } from "../../Models/order.model.js";
import { Product } from "../../Models/product.model.js";
import { User } from "../../Models/user.model.js";

export const getDashboardData = async () => {


  const totalOrders = await Order.countDocuments();

  
  const orders = await Order.find()
    .populate("user", "name fullName")
    .sort({ createdAt: -1 })
    .limit(5);

  
  const salesAgg = await Order.aggregate([
    { $match: { status: "Delivered" } },
    {
      $group: {
        _id: null,
         total: { $sum: "$finalTotal" }
      }
    }
  ]);

  const totalSales = salesAgg[0]?.total || 0;

  
  const avgOrderValue = totalOrders
    ? Math.round(totalSales / totalOrders)
    : 0;

  
  const pendingOrders = await Order.countDocuments({
    status: { $in: ["Pending", "Processing"] }
  });


   
  const salesByDate = await Order.aggregate([
  {
    $match: {
      status: "Delivered",
      createdAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
      },
      total: { $sum: "$finalTotal" }
    }
  },
  { $sort: { _id: 1 } },
  { $limit: 7 }
]);

const chartLabels = salesByDate.map(item => item._id);
const chartData = salesByDate.map(item => item.total);




  const recentUsers = await User.find()
  .sort({ createdAt: -1 })
  .limit(5)
  .select("name fullName email createdAt isBlocked");


  const productCount = await Product.countDocuments();

  return {
    totalSales,
    totalOrders,
    avgOrderValue,
    pendingOrders,
    productCount,
    orders,
    recentUsers,
    chartLabels,
    chartData
  };
};
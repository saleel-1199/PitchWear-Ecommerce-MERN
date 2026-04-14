import { getWalletService } from "../../Services/Product/wallet.service.js";
import {
  createWalletTopupOrderService,
  verifyWalletPaymentService
} from "../../Services/Product/wallet.service.js";

export const walletPage = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) return res.redirect("/login");

    const page = parseInt(req.query.page) || 1;
    const limit = 5; 
    const skip = (page - 1) * limit;

    const wallet = await getWalletService(userId);

    const totalTransactions = wallet.transactions.length;

    const paginatedTransactions = wallet.transactions
      .slice()
      .reverse()
      .slice(skip, skip + limit);

    res.render("products/Wallet", {
      wallet,
      user: req.user,
      transactions: paginatedTransactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit)
    });

  } catch (error) {
    console.log(error.message);
    res.redirect("/profile");
  }
};

export const createWalletTopupController = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { amount } = req.body;

    req.session.walletTopupAmount = Number(amount);

    const order = await createWalletTopupOrderService(
      userId,
      amount
    );

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

export const verifyWalletPaymentController = async (req, res) => {
  try {

    const userId = req.session.userId;

    await verifyWalletPaymentService({
      userId,
      session: req.session,
      ...req.body
    });

    res.json({ success: true });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};
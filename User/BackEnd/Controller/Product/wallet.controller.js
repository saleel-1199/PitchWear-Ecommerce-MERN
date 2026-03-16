import { getWalletService } from "../../Services/Product/wallet.service.js";

export const walletPage = async (req, res) => {
  try {
    const userId = req.session.userId; 

     if (!userId) {
      return res.redirect("/login");
    }

    const wallet = await getWalletService(userId);

    res.render("products/Wallet", {
      wallet,
      user:req.user
    });

  } catch (error) {
    console.log(error.message);
    res.redirect("/profile");
  }
};
import { User } from "../Models/user.model.js";

export const attachUser = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      req.user = null;
      res.locals.user = null;
      return next();
    }

    const user = await User.findById(req.session.userId).lean();

    req.user = user;          
    res.locals.user = user;   

    return next();
  } catch (err) {
    req.user = null;
    res.locals.user = null;
    return next();
  }
};

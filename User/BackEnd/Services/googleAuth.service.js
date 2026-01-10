export const handleGoogleLogin = (req) => {
  if (req.user.isBlocked) {
    return { blocked: true };
  }
  return { blocked: false, userId: req.user._id };
};
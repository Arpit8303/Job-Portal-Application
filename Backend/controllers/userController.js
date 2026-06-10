import userModel from "../models/userModel.js";

export const updateUserController = async (req, res, next) => {
  const { name, email, lastName, location, skills, resumeUrl, monthlyGoal } = req.body;
  if (!name || !email || !lastName || !location) {
    return next(new Error("Please Provide All Fields"));
  }
  const user = await userModel.findOne({ _id: req.user.userId });
  user.name = name;
  user.lastName = lastName;
  user.email = email;
  user.location = location;
  if (skills !== undefined) user.skills = skills;
  if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
  if (monthlyGoal !== undefined) user.monthlyGoal = monthlyGoal;

  await user.save();
  const token = user.createJWT();
  res.status(200).json({
    user,
    token,
  });
};

export const getPortfolioController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
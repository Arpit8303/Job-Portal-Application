import userModel from "../models/userModel.js";

export const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    //validate
    if (!name) {
      return next(new Error("name is required"));
    }
    if (!email) {
      return next(new Error("email is required"));
    }
    if (!password) {
      return next(new Error("password is required and greater than 6 character"));
    }
    const exisitingUser = await userModel.findOne({ email });
    if (exisitingUser) {
      return next(new Error("Email Already Register Please Login"));
    }
    const user = await userModel.create({ name, email, password });
    //token
    const token = user.createJWT();
    res.status(201).send({
      success: true,
      message: "User Created Successfully",
      user: {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return next(new Error("Please Provide All Fields"));
    }
    //find user by email
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return next(new Error("Invalid Username or password"));
    }
    //compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new Error("Invalid Username or password"));
    }
    user.password = undefined;
    const token = user.createJWT();
    res.status(200).json({
      success: true,
      message: "Login Successfully",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};
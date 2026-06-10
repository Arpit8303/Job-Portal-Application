const testPostController = (req, res) => {
  const { name } = req.body;
  res.status(200).json({
    success: true,
    message: `You have sent the data ${name} successfully`
  });
};

export { testPostController };

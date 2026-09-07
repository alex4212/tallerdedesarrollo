const getHome = (req, res) => {
  res.json({
    message: 'Welcome to the API',
    status: 'success'
  });
};

module.exports = {
  getHome
};

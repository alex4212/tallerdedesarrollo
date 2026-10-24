const getHome = (req, res) => {
  res.json({
    message: 'Welcome to the API',
    status: 'success'
  });
};

export { getHome };

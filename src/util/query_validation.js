function validateQuery(req, res, next) {
  const queryKeys = Object.keys(req.query);
  const allowed = ["category", "cuisine", "ingredients"];

  if (queryKeys.length && !allowed.includes(queryKeys[0])) {
    return res.status(400).send({
      message: `Invalid query parameter: '${queryKeys[0]}'. Can only query by category, cuisine, or ingredients`
    });
  }

  next();
}

module.exports = { validateQuery };

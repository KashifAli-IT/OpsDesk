function errorHandler(error, req, res, next) {
  console.error("Request error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON request body",
    });
  }

  if (error.code === "23514") {
    return res.status(400).json({
      error: "A supplied value violates a database constraint",
    });
  }

  if (error.code === "23502") {
    return res.status(400).json({
      error: "A required database field is missing",
    });
  }

  res.status(500).json({
    error: "Internal server error",
  });
}

module.exports = errorHandler;

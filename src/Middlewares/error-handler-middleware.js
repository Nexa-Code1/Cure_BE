export const errorHandlerMiddleware = (api) => {
  return (req, res, next) => {
    api(req, res, next).catch((error) => {
      console.log(`Error in ${req.url}`, error);
      return next(new Error(error.message, { cause: 500 }));
    });
  };
};
export const globalErrorHandler = (err, req, res, next) => {
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  } else if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Token is invalid" });
  } else {
    return res
      .status(500)
      .json({ message: `Some thing went error`, err: err.message });
  }
};

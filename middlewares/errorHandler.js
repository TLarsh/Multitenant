const notFound = (req, res, next) => {
    const error = new Error(`Not Found : ${req.originalUrl}`)
    res.status(404);
    next(error);
};

const errorHandler  = (err, req, res, next) => {
    const statuscode = res.statusCode === 200 ? 400 : res.statusCode;
    res.status(statuscode);
    res.json({
        error: err?.message,
        // stack: err?.stack,
    })
};

module.exports = {notFound, errorHandler};
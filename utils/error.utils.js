class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //This calls the parent Error constructor.

        this.statusCode = statusCode

        Error.captureStackTrace(this, this.constructor)
    }
}

export default AppError
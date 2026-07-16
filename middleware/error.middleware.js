class HandleError extends Error {
    constructor (message ,  status_code , error_code){
        super(message)
        this.status_code = status_code;
        this.error_code = error_code;
        this.isOperational = true ;
        Error.captureStackTrace(this , this.constructor)
    }
}




class BadRequestError extends HandleError {
    constructor(message="Bad request") {
        super(message , 400 , "BAD_REQUEST");
    }
}


class UnAuthorizedError extends HandleError {
    constructor(message="UnAuthorized Error") {
        super(message , 401 , "UNAUTHORIZED");
    }
}

class NotFoundError extends HandleError {
    constructor(message="Not Found Error") {
        super(message , 404 , "NOT-FOUND");
    }
}

class ConflictError extends HandleError {
    constructor(message="Conflict Error") {
        super(message , 409 , "CONFLICT-ERROR");
    }
}

class ForbiddenError extends HandleError {
    constructor(message="Forbidden Error") {
        super(message , 403 , "FORBIDDEN-ERROR");
    }
}


class ValidationError extends HandleError {
    constructor (message = "Validation failed" , errors={}){
        super (message , 422 , "VALIDATION_ERROR");
        this.errors = errors;
    }
}

class InternalServerError extends HandleError {
    constructor(message ="Internal server error"){
        super(message , 500 , "SERVER_ERROR")
    }
}

export {ForbiddenError,  HandleError, BadRequestError, UnAuthorizedError, NotFoundError, ConflictError, ValidationError , InternalServerError };
class ApiError extends Error {

    constructor(
        statusCode,
        message="Something went wrong",
        error = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        thisdata = null
        this.message =message
        this.success=false;
        this.errors = errors

        if(stack){
            this.stack = statck
        }else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}
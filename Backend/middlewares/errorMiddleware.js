//error middleware || NEXT function

const errorMiddleware = (err, req, res, next) => {
    console.log(err);
    
    const defaultError = {
        status: 500,
        message: err.message || "Something went wrong",
    };

    // missing field Error
    if(err.name === "ValidationError"){
        defaultError.status = 400;
        defaultError.message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    // Cast Error (Invalid ID format)
    if(err.name === "CastError"){
        defaultError.status = 400;
        defaultError.message = "Invalid ID format";
    }

    // duplicate error
    if(err.code === 11000){
        defaultError.status = 400;
        defaultError.message = `${Object.keys(err.keyValue)} field has to be unique`;
    }

    res.status(defaultError.status).json({
        success: false,
        message: defaultError.message,
    });
 
}

export default errorMiddleware;
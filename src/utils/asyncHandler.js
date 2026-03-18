// const asyncHandler = ()=>{};

// const asyncHandler= (requestHandler)=>{
//     return (req,res,next) =>{
//         Promise.resolve((requestHandler(req,res,next))).catch
//         ((error)=>next(error))
//     }
// }


// const asyncHandler = ()=>{}
    // const asyncHandler = (fnc)=>{()=>{}}
        // const asyncHandler = (fnc)=>async ()=>{}
            
            const asyncHandler = (fn) => async (req, res, next) => {
                console.log("TYPE OF NEXT:", typeof next);
                try {
                    await fn(req, res, next);
                } catch (error) {
                    console.error("ERROR:", error);
            
                    res.status(error.statusCode || 500).json({
                        success: false,
                        message: error.message || "Internal Server Error"
                    });
                }
            };
            
            export { asyncHandler };
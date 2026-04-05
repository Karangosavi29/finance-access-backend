const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
        .catch((error) => {
            console.log("FULL ERROR:", error)  
            next(error)
        })
}

export { asyncHandler }
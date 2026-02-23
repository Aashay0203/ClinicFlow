const roleMiddleware = (role) => {

    return (req, res, next) => {
        console.log(role);
        console.log(req.user.role);
        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }
        next();
    };
};

export default roleMiddleware;
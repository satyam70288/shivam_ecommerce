const validate = (schema) => async (req, res, next) => {
    try {
        const validated = await schema.validate(req.body, { 
            abortEarly: false, 
            stripUnknown: true, 
            strict: false 
        });
        req.body = validated; 
        next();
    } catch (err) {
        console.error("Validation error:", err);
        return res.status(400).json({
            statusCode: 400,
            message: "Validation failed",
            errors: err.errors || []
        });
    }
};

module.exports = validate;
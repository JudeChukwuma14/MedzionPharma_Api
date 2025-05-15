const joi = require("joi")


const createUser = (data) => {
    const schema = joi.object({
        username: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).max(30).required(),
        confirmPassword: joi.ref('password')
    })
    return schema.validate(data)
}

const loginUser = (data) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(8).max(30).required(),

    })
    return schema.validate(data)
}

module.exports.createUser = createUser
module.exports.loginUser = loginUser

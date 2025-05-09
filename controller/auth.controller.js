const { createUser, loginUser } = require("../middleware/joivalidation")
const userAuth = require("../model/auth.model")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const registerAccount = async (req, res) => {
    try {
        const { error } = createUser(req.body)
        if (error) {
            return res.status(401).json({ message: error.details[0].message, success: false })
        }
        const { username, email, password, confirmPassword } = req.body

        const checkEmail = await userAuth.findOne({ email: email })
        if (checkEmail) {
            return res.status(409).json({ message: "Email already exists", success: false })
        }
        if (password !== confirmPassword) {
            return res.status(401).json({ message: "Passwords do not match", success: false })
        }
        const hashedPassword = bcryptjs.hashSync(password, 10)
        await userAuth.create({
            username,
            email,
            password: hashedPassword
        })
        return res.status(201).json({ message: "Account created successfully", success: true })
    } catch (error) {
        return res.status(500).json({ message: "Oops!!, an error occurred while registering", success: false, error: error.message })
    }
}

const loginAccount = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userAuth.findOne({ email });
        if (!user) {
            return res.status(409).json({ message: "Email and Password Mismatch", success: false });
        }

        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(409).json({ message: "Wrong credentials", success: false });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1w" });

        res.cookie("authToken", token, {
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
            maxAge: 604800000, // 7 days
            path: "/",
        });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            user: { id: user._id, username: user.username, email: user.email, }, token: token,
        });
    } catch (error) {
        return res.status(500).json({ message: "Login failed", success: false, error: error.message });
    }
};


const logout = async (req, res) => {
    try {
        res.cookie("authToken", "", { maxAge: 0 })
        res.status(200).json({ message: 'Logged out successfully.' })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Server error.', error: error.message })
    }
}

module.exports = {
    registerAccount,
    loginAccount,
    logout
}
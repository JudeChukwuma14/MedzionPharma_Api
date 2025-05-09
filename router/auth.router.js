const express = require("express")
const { registerAccount, loginAccount, logout } = require("../controller/auth.controller")
const { verifyToken } = require("../middleware/verifyToken")
const router = express.Router()


router.post("/register", registerAccount)
router.post("/login", loginAccount)
router.get("/logout", logout)
router.get("/me", verifyToken, (req,res)=>{
    res.status(200).json({
        success:true,
        user:{id:req.user.id}
    })
})

module.exports = router
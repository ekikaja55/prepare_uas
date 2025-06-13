const jwt = require('jsonwebtoken')

const auth =(req, res, next) => {
    const token = req.headers['x-auth-token']
    console.log(token);
    if (!token) return res.status(401).json({ message: "Token Tidak Ditemukan" })
    try {
        const decoded =jwt.verify(token, "75c465ec-aea2-4e8a-91a8-4aa1ae4dc566")
        req.user = decoded
        next()
    } catch (error) {
        if(error.message === "jwt expired") return res.sendStatus(401)
        return res.status(400).json({ message: error.message })
    }
}

module.exports = auth



/**
 * contoh kalo pake Bearer
require("dotenv").config()
const jwt = require('jsonwebtoken')

const authVerify = async (req, res, next) => {
    console.log("masuk middleware auth");
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer")) return res.status(401).json({ message: "Token Tidak Ditemukan" })

    const token = authHeader.split(" ")[1]

    try {
        const decoded = await jwt.verify(token, process.env.SECRET_ACCESS_TOKEN)
        req.user = decoded
        next()

    } catch (error) {
        return res.status(400).json({message:"Token Tidak Valid"})
    }

}

module.exports = authVerify
 */




/**
 * cekrole
 * require("dotenv").config()
const jwt = require('jsonwebtoken')

const cekRole = async (req, res, next) => {
    console.log("masuk middleware cekrole");
    const user = req.user
    if (user.role === 'member') return res.sendStatus(403)
    next()
}

module.exports = cekRole
 * 
 */
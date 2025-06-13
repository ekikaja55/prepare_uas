const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    access_token: String,
    refresh_token: String
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    try {
        this.password = await bcryptjs.hash(this.password, 10)
        console.log(this.password);
        next()
    } catch (error) {
        console.log(error);
        next(error)

    }
})
module.exports = mongoose.model("User", userSchema)
const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    id_image: Number,
    username: String,
    path: String
}, { timestamps: true })

imageSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model("Image").countDocuments()
        this.id_image = count + 1
        console.log("udah ditambah 1 harusnya");
    }
    next()
})

module.exports = mongoose.model("Image",imageSchema)
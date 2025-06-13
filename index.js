const express = require('express')
const port = 3000
const mongoose = require('mongoose')
const app = express()
const cookieParser = require('cookie-parser')
const routes = require('./routes')


const main = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/db_week_12")
        console.log("masuk mongo");
        app.use(express.urlencoded({ extended: true }))
        app.use(cookieParser())
        app.use(express.json())
        app.use("/api", routes)
        app.listen(port, () => console.log(`Server jalan di port ${port}`)
        )
    } catch (error) {
        console.log(error);

    }
}

main()


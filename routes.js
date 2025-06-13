const express = require('express')
const { User, Image } = require('./models')
const router = express.Router()
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth')
const fs = require('fs')

//util buat nanganin error callback multer
const util = require('util')
const uploadSingle = require('./config_storage')
const path = require('path')
const uploadOne = util.promisify(uploadSingle.single('image'))

router.post("/user/register", async (req, res) => {
    const { username, email, password } = req.body
    try {
        const cariUser = await User.findOne({ email: email })
        if (cariUser) return res.status(400).json({ message: "Email Sudah Terdaftar" })
        const userBaru = new User({ username, email, password })
        await userBaru.save()
        return res.status(200).json({ message: "Registrasi Sukses" })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

router.post("/user/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const cariUser = await User.findOne({ email: email }).select("_id email username password")
        if (!cariUser || !(await bcryptjs.compare(password, cariUser.password))) {
            return res.status(200).json({ message: "Email atau Password Salah" })
        }
        console.log(cariUser);
        console.log(crypto.randomUUID());
        console.log(crypto.randomUUID());

        const payload = cariUser.toObject()
        delete payload.password

        const access_token = jwt.sign(payload, "75c465ec-aea2-4e8a-91a8-4aa1ae4dc566", {
            expiresIn: "5m"
        })
        const refresh_token = jwt.sign(payload, "6af61eb7-b218-4029-8181-68a73547f78f", {
            expiresIn: "7m"
        })

        cariUser.access_token = access_token
        cariUser.refresh_token = refresh_token

        res.cookie("access_token", access_token, {
            httpOnly: true,
            maxAge: 5 * 60 * 1000
        })
        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            maxAge: 7 * 60 * 1000
        })

        cariUser.save()
        return res.status(200).json({
            message: "Berhasil Login",
            access_token,
            refresh_token
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })

    }
})

router.get("/user/refresh_token", async (req, res) => {
    const token = req.cookies.refresh_token
    console.log(token);
    if (!token) return res.sendStatus(401)
    try {
        const cariUser = await User.findOne({ refresh_token: token }).select("_id email username ")

        if (!cariUser || !jwt.verify(token, "6af61eb7-b218-4029-8181-68a73547f78f")) return res.status(404).json({ message: "Token User Tidak Valid" })

        const access_token_baru = jwt.sign(cariUser.toObject(), "75c465ec-aea2-4e8a-91a8-4aa1ae4dc566", {
            expiresIn: "5m"
        })

        cariUser.access_token = access_token_baru

        await cariUser.save()

        res.cookie("access_token", access_token_baru, {
            httpOnly: true,
            maxAge: 5 * 60 * 1000
        })

        return res.status(200).json({ message: "Sukses Refresh Token", access_token_baru })

    } catch (error) {
        return res.status(500).json({ message: error.message })

    }
})

router.post("/user/logout", async (req, res) => {
    try {
        const refresh_token = req.cookies.refresh_token

        if (refresh_token) {
            await User.findOneAndUpdate({ refresh_token }, {
                $unset: { refresh_token: "", access_token: "" }
            })
        }

        res.clearCookie("access_token")
        res.clearCookie("refresh_token")

        return res.status(200).json({ message: "Logout berhasil" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

router.post('/images/add', auth, async (req, res) => {
    try {
        await uploadOne(req, res);
        const imgDoc = new Image({
            username: req.user.username,
            path: req.file.path
        });
        await imgDoc.save();

        res.status(200).json({
            message: 'Berhasil Mengunggah Gambar',
            id_image: imgDoc.id_image,
            filename: req.file.filename,
            path: req.file.path
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/images/:id', auth, async (req, res) => {
    const { id } = req.params
    try {
        const result = await Image.findOne({ id_image: id }).select("username path id")

        if (!result) return res.status(400).json({ message: "Gambar Tidak Ditemukan" })

        return res.status(200).sendFile(path.resolve(result.path))
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
})

router.put('/images/:id', auth, async (req, res) => {
    const { id } = req.params

    try {
        await uploadOne(req, res)
        
        //inget body bisa dibaca kalo uploadOne selesai
        console.log(req.body.nama);

        const image = await Image.findOne({ id_image: id })
        if (!image) return res.status(404).json({ message: "Gambar Tidak Ditemukan" })

        console.log('File path:', image.path);
        console.log('Exists:', fs.existsSync(image.path));

        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)

        }

        image.path = req.file.path
        image.save()


        res.status(200).json({
            message: 'Gambar berhasil diperbarui',
            filename: req.file.filename,
            new_path: req.file.path
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }

})

router.delete('/images/:id', auth, async (req, res) => {
    const { id } = req.params
    try {
        const image = await Image.findOne({ id_image: id })
        if (!image) return res.status(404).json({ message: "Gambar Tidak Ditemukan" })

        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)

        }
        await image.deleteOne()

        return res.status(200).json({ message: "Gambar Berhasil Dihapus" })


    } catch (error) {
        res.status(400).json({ message: error.message });

    }

})
module.exports = router

/**
 * Rumus Patokan Hitung MaxAge
Waktu	Milidetik (ms)
1 detik	1000
1 menit	60 * 1000 = 60000 kali aja misal kali 2 buat 2 menit
1 jam	60 * 60 * 1000 = 3600000
1 hari	24 * 60 * 60 * 1000 = 86400000
7 hari (1 minggu)	7 * 24 * 60 * 60 * 1000 = 604800000
 * 
 */
/**
 * router.post('/images/add', auth, async (req, res) => {
    try {
        await uploadMany(req, res);

        const savedImages = [];

        for (const file of req.files) {
            const imgDoc = new Image({
                username: req.user.username,
                path: file.path
            });
            await imgDoc.save();
            savedImages.push({
                id_image: imgDoc.id_image,
                filename: file.filename
            });
        }

        res.status(200).json({
            message: 'Berhasil Mengunggah Gambar',
            files: savedImages
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

 * 
 */


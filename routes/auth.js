const express = require('express')
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser')



//ROUTE 1.......................................SIGN UP
const JWT_SECRET = "Nayab is a good boy"

router.post('/createuser', [
    body('name').isLength({ min: 5 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
], async(req, res) => {
    {
        // give error if any and also gave status 400 to user
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // cheak wether email alreadt used or not
        try {


            let user = await User.findOne({ email: req.body.email });
            if (user) {
                // return error if there is one email used multiple time
                return res.status(400).json({ error: "sorry this email already exist" })
            }
            //salt for strong password
            const salt = await bcrypt.genSalt(10);
            secPass = await bcrypt.hash(req.body.password, salt)
                //create a user ..
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            })
            const data = {
                    user: {
                        id: user.id
                    }
                }
                //jwt token take data and secrat (which is JWT_SECRET here)
            const authToken = jwt.sign(data, JWT_SECRET)
            console.log(authToken)
            res.json({ authToken })
                // show the error if there is any mistake in code 
        } catch (error) {
            console.error(error.message);
            res.status(500).send("some error occur");
        }
    }
})




// ROUTE 2.............................................LOGIN 
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password cant be blank').exists(),
], async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "plz try to login with correct credential" })
        }
        const passwordcompare = await bcrypt.compare(password, user.password);
        if (!passwordcompare) {
            return res.status(400).json({ error: "plz try to login with correct credential" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({ authToken }) 
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error");
    }

})

// ROUTE 3..................................GET USER DETAIL
router.post('/getuser', fetchuser, async(req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error");
    }

})
module.exports = router;
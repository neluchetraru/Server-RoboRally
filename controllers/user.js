const express = require('express');
const {
    Users,
    Rooms,
    Robots
} = require('./dbConnection');

const router = express.Router();

router.post('/createUser/:username', async (req, res) => {
    const users = await Users.find({
        name: req.params.username
    }).exec()
    if (users.length == 0) {
        const user = new Users({
            name: req.params.username,
            robot: undefined,
            room: undefined
        })
        Users.create(user)
        res.status(200).send()
    } else {
        res.status(400).send()
    }
})


router.delete('/deleteUser/:username', async (req, res) => {
    const users = await Users.find({
        name: req.params.username
    }).exec()
    if (users.length == 1) {
        await Users.deleteOne({
            name: req.params.username
        }).exec()
        await Robots.deleteOne({
            owner: users[0]._id
        }).exec()
        await ProgrammingRecords.deleteMany({
            user: users[0]._id
        }).exec()


        res.status(200).send() // user deleted
    } else {
        res.status(404).send() // user not found
    }
})

router.put('/chooseRobot/:user/:robot_name', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()

    if (user) {
        if (user.robot) {
            await Robots.updateOne({
                _id: user.robot
            }, {
                $set: {
                    name: req.params.robot_name
                }
            }).exec()

        } else {
            const robot = new Robots({
                name: req.params.robot_name,
                owner: user._id
            })
            Robots.create(robot)
            await Users.updateOne({
                name: user.name
            }, {
                name: user.name,
                robot: robot._id
            }).exec()
        }
        res.status(200).send()

    } else {
        res.status(404).send()

    }

})

router.put('/joinRoom/:user/:room', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (!user) {
        res.status(404).send()
    } else {
        const room = await Rooms.findOne({
            room_number: req.params.room
        }).exec()
        if (room) {
            Users.updateOne({
                name: req.params.user
            }, {
                room: room._id
            }).exec()
            res.status(200).send()
        } else {
            res.status(400).send()
        }
    }
})
router.put('/exitRoom/:user', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (user) {
        if (user.room) {
            const room = await Rooms.findOne({
                _id: user.room
            }).exec()
            await Users.updateOne({
                name: req.params.user
            }, {
                $set: {
                    room: null
                }
            }).exec()
            await ProgrammingRecords.deleteMany({
                user: user._id,
                room: room._id
            }).exec()
            res.status(200).send({
                "room_number": room.room_number
            })
        } else {
            res.status(401).send()
        }
    } else {
        res.status(404).send()
    }
})
module.exports = router

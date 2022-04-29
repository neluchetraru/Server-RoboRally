const express = require('express');
const {
    Users,
    Rooms,
    ProgrammingRecords
} = require('../dbConnection');

const router = express.Router();

router.post('/createRoom/:owner/:map', async (req, res) => {

    const user = await Users.findOne({
        name: req.params.owner
    }).exec()

    if (user) {
        var last_room = await Rooms.find({
            room_number: {
                $gte: 0
            }
        }).sort({
            _id: -1
        }).limit(1).exec()


        if (last_room.length != 0) {

            room_number = last_room[0].room_number + Math.floor(Math.random() * 100)
            const newRoom = new Rooms({
                room_number: room_number,
                map: req.params.map,
                owner: user._id,
                gameStatus: "WAITING"
            })
            // add user to room
            if (!user.room) {
                await Users.updateOne({
                    name: user.name
                }, {
                    $set: {
                        room: newRoom._id
                    }
                }).exec()
                Rooms.create(newRoom)
                res.status(200).send({
                    room_number: room_number
                })
            } else {
                res.status(400).send() // user already in a room
            }



        } else {
            room_number = 100
            const newRoom = new Rooms({
                room_number: room_number,
                map: req.params.map,
                owner: user._id,
                gameStatus: "WAITING"
            })

            Rooms.create(newRoom)
            if (user.room) {
                await Users.updateOne({
                    name: user.name
                }, {
                    $set: {
                        room: newRoom._id
                    }
                }).exec()
                res.status(200).send({
                    room_number: room_number
                })
            } else {
                res.status(400).send() // user already in a room
            }

        }

    } else {
        res.status(404).send()
    }

})


router.put('/updateStatus/:room/:status', async (req, res) => {

    const room = await Rooms.findOne({
        room_number: req.params.room
    }).exec()
    if (room) {
        await Rooms.updateOne({
            room_number: req.params.room
        }, {
            $set: {
                gameStatus: req.params.status
            }
        }).exec()
        res.status(200).send()
    } else {
        res.status(404).send() // room not found
    }

})



router.get('/roomInfo/:room', async (req, res) => {
    const requestTime = (new Date()).getTime()
    const room = await Rooms.findOne({
        room_number: req.params.room
    }).exec()
    if (room) {
        const temp = await Users.find({
            room: room._id
        }).exec()
        const users = temp.map((user) => {
            return user.name
        })
        const room_owner = await Users.findById(room.owner).exec()

        res.status(200).send({
            "owner": room_owner ? room_owner.name : "",
            "users": users,
            "map": room.map,
            "gameStatus": room.gameStatus,
            "requestTime": requestTime
        })
    } else {
        res.status(404).send()
    }
})

router.delete('/deleteRoom/:room', async (req, res) => {
    const room = await Rooms.findOne({
        room_number: req.params.room
    }).exec()
    if (room) {
        await Users.updateMany([{
            room: room._id
        }], [{
            "$set": {
                room: null
            }
        }]).exec()
        await Rooms.deleteMany({
            room_number: req.params.room
        }).exec()
        await ProgrammingRecords.deleteMany({
            room: room._id
        }).exec()
        res.status(200).send()
    } else {
        res.status(404).send()
    }
})


module.exports = router

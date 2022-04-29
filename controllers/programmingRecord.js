const express = require('express');
const {
    Users,
    Rooms,
    ProgrammingRecords
} = require('./dbConnection');

const router = express.Router();

router.post('/createProgrammingRecord', async (req, res) => {
    console.log(req.body)
    const user = await Users.findOne({
        name: req.body.username
    }).exec()

    const room = await Rooms.findOne({
        room_number: req.body.roomNumber
    }).exec()
    if (user) {
        if (room) {
            if (user.room) {
                const newRecord = new ProgrammingRecords({
                    user: user._id,
                    room: room._id,
                    round: req.body.round,
                    register1: req.body.register1,
                    register2: req.body.register2,
                    register3: req.body.register3,
                    register4: req.body.register4,
                    register5: req.body.register5
                })
                ProgrammingRecords.create(newRecord)
                res.status(200).send()
            } else {
                res.status(402).send()
            }
        } else {
            res.status(401).send()
        }
    } else {
        res.status(400).send()
    }
})

router.get('/getProgrammingRecords/:roomNumber/:round', async (req, res) => {
    const requestTime = (new Date()).getTime()
    const room = await Rooms.findOne({
        room_number: req.params.roomNumber
    }).exec()
    if (room) {
        const records = await ProgrammingRecords.find({
            room: room._id,
            round: req.params.round
        }).exec()
        const response = []
        for (let i = 0; i < records.length; i++) {
            const user = await Users.findOne({
                _id: records[i].user
            }).exec()
            if (user) {
                response.push({
                    "username": user.name,
                    "register1": records[i].register1,
                    "register2": records[i].register2,
                    "register3": records[i].register3,
                    "register4": records[i].register4,
                    "register5": records[i].register5,
                    "round": records[i].round,
                    "requestTime": requestTime
                })
            }
        }
        res.status(200).send({
            response
        })
    } else {
        res.status(404).send()
    }
})
module.exports = router
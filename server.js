const express = require("express")
const mongoose = require("mongoose"),
    Schema = mongoose.Schema

var bodyParser = require('body-parser')

var userSchema = Schema({
    name: String,
    robot: {
        type: Schema.Types.ObjectId,
        ref: "Robots"
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: "Rooms"
    }
}, {
    collection: "Users"
})

var roomSchema = Schema({
    room_numnber: Number,
    map: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    timeCreated: Date,
}, {
    collection: "Rooms"
})

var robotSchema = Schema({
    name: {
        type: String
    },
    position: {
        x: Number,
        y: Number
    },
    direction: {
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    }
}, {
    collection: "Robots"
})


var programmingRecordSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: "Rooms"
    },
    // register is a list of all the registers
    register1: String,
    register2: String,
    register3: String,
    register4: String,
    register5: String,
    round: Number
}, {
    collection: "ProgrammingRecords"
})

const Users = mongoose.model("Users", userSchema)
const Rooms = mongoose.model("Rooms", roomSchema)
const Robots = mongoose.model("Robots", robotSchema)
const ProgrammingRecords = mongoose.model("ProgrammingRecords", programmingRecordSchema)
const url = process.env.URL || "mongodb://localhost:27017"
mongoose.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});
const connection = mongoose.connection;

connection.once("open", function () {
    console.log("MongoDB database connection established successfully");
});

const server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({
    extended: true
}))
const port = 3000



server.post('/createUser/:username', async (req, res) => {
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


server.delete('/deleteUser/:username', async (req, res) => {
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

server.put('/chooseRobot/:user/:robot_name', async (req, res) => {
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

server.delete("/deleteRobot/:username", async (req, res) => {
    const user = await Users.findOne({
        name: req.params.username
    }).exec()
    if (!user) {
        res.status(404).send()
    } else {
        if (user.robot) {
            await Users.updateOne({
                name: user.name
            }, {
                $set: {
                    robot: null
                }
            }).exec()
            await Robots.deleteOne({
                _id: user.robot
            }).exec()
            res.status(200).send()
        } else {
            res.status(400).send() // robot not found
        }
    }
})


server.post('/createRoom/:owner/:map', async (req, res) => {

    const user = await Users.findOne({
        name: req.params.owner
    }).exec()

    if (user) {
        var last_room = await Rooms.find({
            room_numnber: {
                $gte: 0
            }
        }).sort({
            _id: -1
        }).limit(1).exec()

        const date = new Date()
        if (last_room.length != 0) {

            room_numnber = last_room[0].room_numnber + Math.floor(Math.random() * 100)
            const newRoom = new Rooms({
                room_numnber: room_numnber,
                map: req.params.map,
                owner: user._id,
                // current timestamp
                timeCreated: date.getTime()
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
                    room_numnber: room_numnber
                })
            } else {
                res.status(400).send() // user already in a room
            }



        } else {
            room_numnber = 100
            const newRoom = new Rooms({
                room_numnber: room_numnber,
                map: req.params.map,
                owner: user._id,
                timeCreated: date.getTime()
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
                    room_numnber: room_numnber
                })
            } else {
                res.status(400).send() // user already in a room
            }

        }

    } else {
        res.status(404).send()
    }

})

server.put('/joinRoom/:user/:room', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (!user) {
        res.status(404).send()
    } else {
        const room = await Rooms.findOne({
            room_numnber: req.params.room
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


server.get('/roomInfo/:room', async (req, res) => {
    const room = await Rooms.findOne({
        room_numnber: req.params.room
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
            "timeCreated": room.timeCreated,
            "owner": room_owner.name,
            "users": users
        })
    } else {
        res.status(404).send()
    }
})

server.delete('/deleteRoom/:room', async (req, res) => {
    const room = await Rooms.findOne({
        room_numnber: req.params.room
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
            room_numnber: req.params.room
        }).exec()
        await ProgrammingRecords.deleteMany({
            room: room._id
        }).exec()
        res.status(200).send()
    } else {
        res.status(404).send()
    }
})


server.put('/exitRoom/:user', async (req, res) => {
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
                "room_numnber": room.room_numnber
            })
        } else {
            res.status(401).send()
        }
    } else {
        res.status(404).send()
    }
})


// update robot position 
server.put('/updateRobotPosition/:user/:x/:y', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (user) {
        if (user.robot) {
            await Robots.updateOne({
                _id: user.robot
            }, {
                $set: {
                    position: {
                        x: req.params.x,
                        y: req.params.y
                    }
                }
            }).exec()
            res.status(200).send()
        } else {
            res.status(401).send()
        }
    } else {
        res.status(404).send()
    }
})


// get robot information
server.get('/getRobotInfo/:user', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (user) {
        if (user.robot) {
            const robot = await Robots.findOne({
                _id: user.robot
            }).exec()
            res.status(200).send({
                "name": robot.name,
                "x": robot.position.x,
                "y": robot.position.y,
                "direction": robot.direction
            })
        } else {
            res.status(401).send()
        }
    } else {
        res.status(404).send()
    }
})

// update robot direction
server.put('/updateRobotDirection/:user/:direction', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (user) {
        if (user.robot) {
            await Robots.updateOne({
                _id: user.robot
            }, {
                $set: {
                    direction: req.params.direction
                }
            }).exec()
            res.status(200).send()
        } else {
            res.status(401).send()
        }
    } else {
        res.status(404).send()
    }
})


// Programming record 
// POST /createProgrammingRecord 
server.post('/createProgrammingRecord', async (req, res) => {
    const user = await Users.findOne({
        name: req.body.username
    }).exec()

    const room = await Rooms.findOne({
        room_numnber: req.body.roomNumber
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

// GET /getProgrammingRecords/:roomNumber/:round
server.get('/getProgrammingRecords/:roomNumber/:round', async (req, res) => {
    const room = await Rooms.findOne({
        room_numnber: req.params.roomNumber
    }).exec()
    if (room) {
        const users = new Set()
        const records = await ProgrammingRecords.find({
            room: room._id,
            round: req.params.round
        }).exec()
        for (let i = 0; i < records.length; i++) {
            users.add((await Users.findOne({
                _id: records[i].user
            }).exec()).name)
        }
        const usersArray = Array.from(users)


        res.status(200).send(usersArray)
    } else {
        res.status(404).send()
    }
})




server.listen(process.env.PORT || port, () => {
    console.log(`Running server on port ${process.env.PORT || port}`)
})
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose"),
    Schema = mongoose.Schema

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
    code: Number,
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
    }
}, {
    collection: "Robots"
})


const Users = mongoose.model("Users", userSchema)
const Rooms = mongoose.model("Rooms", roomSchema)
const Robots = mongoose.model("Robots", robotSchema)
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

server.put('/chooseRobot/:user/:robot_name', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (!user) {
        res.status(404).send()
    } else {
        const robot = new Robots({
            name: req.params.robot_name
        })
        Robots.create(robot)
        await Users.updateOne({
            name: user.name
        }, {
            name: user.name,
            robot: robot._id
        }).exec()
        res.status(200).send()
    }
})

server.post('/createRoom/:owner/:map', async (req, res) => {

    const user = await Users.findOne({
        name: req.params.owner
    }).exec()

    if (user) {
        var last_room = await Rooms.find({
            code: {
                $gte: 0
            }
        }).sort({
            _id: -1
        }).limit(1).exec()

        const date = new Date()
        if (last_room.length != 0) {

            code = last_room[0].code + Math.floor(Math.random() * 100)
            const newRoom = new Rooms({
                code: code,
                map: req.params.map,
                owner: user._id,
                // current timestamp
                timeCreated: date.getTime()
            })
            Rooms.create(newRoom)
            res.status(200).send({
                code: code
            })

        } else {
            code = 100
            const newRoom = new Rooms({
                code: code,
                map: req.params.map,
                owner: user._id,
                timeCreated: date.getTime()
            })
            Rooms.create(newRoom)
            res.status(200).send({
                code: code
            })
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
            code: req.params.room
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
        code: req.params.room
    }).exec()
    if (room) {
        const temp = await Users.find({
            room: room._id
        }).exec()
        const users = temp.map((user) => {
            return user.name
        })
        res.status(200).send([{
            "timeCreated": room.timeCreated,
            "users": users
        }])
    } else {
        res.status(404).send()
    }
})

server.delete('/deleteRoom/:room', async (req, res) => {
    const room = await Rooms.findOne({
        code: req.params.room
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
            code: req.params.room
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
            res.status(200).send({
                "code": room.code
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

// get robot position
server.get('/getRobotPosition/:user', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (user) {
        if (user.robot) {
            const robot = await Robots.findOne({
                _id: user.robot
            }).exec()
            res.status(200).send({
                "x": robot.position.x,
                "y": robot.position.y
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




server.listen(process.env.PORT || port, () => {
    console.log(`Running server on port ${process.env.PORT || port}`)
})
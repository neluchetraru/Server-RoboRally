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
    }
}, {
    collection: "Rooms"
})

var robotSchema = Schema({
    name: {
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
        res.status(200).send({
            "message": "User created successfully."
        })
    } else {
        res.status(404).send({
            "error": "username already exists."
        })
    }
})

server.put('/chooseRobot/:user/:robot_name', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (!user) {
        res.status(404).send({
            "error": "user does not exist"
        })
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
        res.status(200).send({
            "message": "robot created successfully"
        })
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
        if (last_room.length != 0) {

            code = last_room[0].code + Math.floor(Math.random() * 100)
            const newRoom = new Rooms({
                code: code,
                map: req.params.map,
                owner: user._id
            })
            Rooms.create(newRoom)
            res.status(200).send({
                "message": "Room created successfully.",
                code: code
            })

        } else {
            code = 100
            const newRoom = new Rooms({
                code: code,
                map: req.params.map,
                owner: user._id
            })
            Rooms.create(newRoom)
            res.status(200).send({
                "message": "Room created successfully.",
                code: code
            })
        }

    } else {
        res.status(400).send({
            "error": "user does not exist"
        })
    }

})

server.put('/joinRoom/:user/:room', async (req, res) => {
    const user = await Users.findOne({
        name: req.params.user
    }).exec()
    if (!user) {
        res.status(400).send({
            "error": "user does not exist"
        })
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
            res.status(200).send({
                "message": "user has joined the defined room"
            })
        } else {
            res.status(400).send({
                "message": "room not found"
            })
        }
    }
})


server.get('/getRoomInfo/:room', async (req, res) => {
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
        res.status(200).send(users)
    } else {
        res.status(400).send({
            "error": "room not found"
        })
    }
})

server.delete('/room/:room', async (req, res) => {
    const room = await Rooms.findOne({
        code: req.params.room
    }).exec()
    if (room) {
        await Users.updateMany([{
            room: room._id
        }], [{
            "$set": {
                room: undefined
            }
        }]).exec()
        await Rooms.deleteMany({
            code: req.params.room
        }).exec()
        res.status(200).send({
            "message": "room has been deleted"
        })
    } else {
        res.status(400).send({
            "error": "room does not exist"
        })
    }
})
server.listen(process.env.PORT || port, () => {
    console.log(`Running server on port ${port}`)
})
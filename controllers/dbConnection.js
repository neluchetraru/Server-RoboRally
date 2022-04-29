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
    room_number: Number,
    map: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    gameStatus: String
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

module.exports = {
    Users,
    Rooms,
    Robots,
    ProgrammingRecords
}
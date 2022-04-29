const express = require('express');
const {
    Users,
    Robots
} = require('./dbConnection');

const router = express.Router();
router.delete("/deleteRobot/:username", async (req, res) => {
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





// update robot position 
router.put('/updateRobotPosition/:user/:x/:y', async (req, res) => {
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
router.get('/getRobotInfo/:user', async (req, res) => {
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
router.put('/updateRobotDirection/:user/:direction', async (req, res) => {
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
module.exports = router

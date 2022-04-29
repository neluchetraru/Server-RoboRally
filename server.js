const express = require("express")
var bodyParser = require('body-parser')

const server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({
    extended: true
}))

server.use("/", require("./controllers/user"), require("./controllers/robot"), require("./controllers/room"), require("./controllers/programmingRecord"))
const port = 3000

server.listen(process.env.PORT || port, () => {
    console.log(`Running server on port ${process.env.PORT || port}`)
})
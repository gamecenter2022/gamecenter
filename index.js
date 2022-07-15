const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const db = require('./_configs/dbConfig.js');


mongoose.connect(db.developmentSrv, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((connected) => {
    console.log('Mongodb connected with success');
}).catch((err) => {
    console.log(err);
});

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var server = require("http").createServer(app);
let myObject = { "app": app, "server": server }

require('./socket.io')(myObject);
require('./_routes/user.route')(app);
require('./_routes/dice.route')(app);
require('./_routes/spinGame.route')(app);
require('./_routes/ticTacToe.route')(app);

app.get("/", (req, res) => {
    res.status(200).json(`Backend version 1.0.0 working `);
});
server.listen(PORT, () => {
    console.log(`Backend server listening at ${PORT}`);
});

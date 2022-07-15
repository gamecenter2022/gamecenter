const mongoose = require('mongoose');

const schema = mongoose.Schema;
const user = new schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayId: { type: String, required: true, unqiue: true },
    profileImage: { type: String },
    coins: {
        level: { type: Number, default: 1 },
        display: { type: Number, default: 0 },
        all: { type: Number, default: 0 },
        gameWin: { type: Number, default: 0 },
        gameLoos: { type: Number, default: 0 },
        spinWin: { type: Number, default: 0 },
        spinLoos: { type: Number, default: 0 },
    },
    gems: {
        level: { type: Number, default: 1 },
        display: { type: Number, default: 0 },
        all: { type: Number, default: 0 }
    },
},
    { versionKey: false, timestamps: true, });
module.exports = mongoose.model('user', user);
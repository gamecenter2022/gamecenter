const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const schema = mongoose.Schema;
const appConfig = new schema({
    userSr: { type: Number, default: 70001 },
    isDummyGameEnable: { type: Boolean, default: false },
    diceSrNumber: { type: Number, default: 1 },
    ticTacToeSr: { type: Number, default: 1 },
    greedySrNumber: { type: Number, default: 1 },
    gameSrNumber: { type: Number, default: 1 },
    misMatchCount: { type: Number, default: 0 },
}, {
    versionKey: false
});

module.exports = mongoose.model("appConfig", appConfig);
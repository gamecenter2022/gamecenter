const mongoose = require('mongoose');

const schema = mongoose.Schema;
const greedy = new schema({
    greedySrNumber: Number,
    winnerBodgie: Number,
    gameStatus: String,
    coinsEarning: Number,
    winnerLevel: String,
    applyUsers0: [],
    applyUsers1: [],
    applyUsers2: [],
    applyUsers3: [],
    applyUsers4: [],
    applyUsers5: [],
    applyUsers6: [],
    applyUsers7: [],

}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('greedy', greedy);
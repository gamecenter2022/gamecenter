const mongoose = require('mongoose');

const schema = mongoose.Schema;
const gameConfig = new schema({
    totalGameCount: { type: Number, required: true, default: 500 },
    highGameCount: { type: Number, required: true, default: 0 },
    mediumGameCount: { type: Number, required: true, default: 0 },
    lowGameCount: { type: Number, required: true, default: 0 },
    highPercentage: { type: Number, default: 20 },
    mediumPercentage: { type: Number, default: 20 },
    lowPercentage: { type: Number, default: 60 },
}, {
    versionKey: false
});

module.exports = mongoose.model("gameConfig", gameConfig);
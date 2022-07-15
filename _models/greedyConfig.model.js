const mongoose = require('mongoose');

const schema = mongoose.Schema;
const greedyConfig = new schema({
    totalGreedyCount: { type: Number, required: true, default: 500 },
    highGreedyCount: { type: Number, required: true, default: 0 },
    mediumGreedyCount: { type: Number, required: true, default: 0 },
    lowGreedyCount: { type: Number, required: true, default: 0 },
    highPercentage: { type: Number, default: 20 },
    mediumPercentage: { type: Number, default: 20 },
    lowPercentage: { type: Number, default: 60 },
}, {
    versionKey: false
});

module.exports = mongoose.model("greedyConfig", greedyConfig);
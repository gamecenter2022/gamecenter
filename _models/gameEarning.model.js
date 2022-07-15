const mongoose = require('mongoose');

const schema = mongoose.Schema;
const gameEarning = new schema({
    totalEarning: { type: Number, required: true },
    lowGameCount: { type: String, required: true },
    mediumGameCount: { type: String, required: true },
    highGameCount: { type: String, required: true }
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('gameEarning', gameEarning);
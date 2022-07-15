const mongoose = require('mongoose');

const schema = mongoose.Schema;
const spinHistory = new schema({
    userName: { type: String },
    userId: { type: mongoose.Types.ObjectId, required: true },
    batCoin: { type: Number, required: true },
    winCoin: { type: Number },
    gameType: { type: String, enum: ['high', 'medium', 'low'], required: true },
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('spinHistory', spinHistory);
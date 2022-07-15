const mongoose = require('mongoose');

const schema = mongoose.Schema;
const ticTacToe = new schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    opponent: { type: String },
    state: { type: String },
    ticTacToeSr: { type: Number, required: true },
    batCoin: { type: Number, required: true },
    winCoin: { type: Number },
    actualWin: { type: Number },
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('ticTacToe', ticTacToe);
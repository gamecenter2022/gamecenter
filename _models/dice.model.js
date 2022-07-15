const mongoose = require('mongoose');

const schema = mongoose.Schema;
const dice = new schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    batCoin: { type: Number, required: true },
    diceSrNumber: { type: Number, required: true },
    winCoin: { type: Number, required: true },
    actualWin: { type: Number, required: true },
    times: { type: Number, required: true },
    targetNo: { type: Number, required: true },
    returnNumber: { type: Number, required: true },
    name: { type: String, required: true },
    displayId: { type: Number, required: true },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('dice', dice);
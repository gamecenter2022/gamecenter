const mongoose = require('mongoose');

const schema = mongoose.Schema;
const gameHistory = new schema({
    gameSrNumber: Number,
    startTime: { type: Date, default: new Date() },
    winnerSeat: Number,
    winnerLevel: String,
    seatAUsers: Array,
    seatBUsers: Array,
    seatCUsers: Array,
    gameStatus: String,
    coinsEarning: Number,
    cardGameDetails: {
        totalSeatAUsers: { type: Number, default: 0 },
        totalSeatBUsers: { type: Number, default: 0 },
        totalSeatCUsers: { type: Number, default: 0 },
        totalSeatACoins: { type: Number, default: 0 },
        totalSeatBCoins: { type: Number, default: 0 },
        totalSeatCCoins: { type: Number, default: 0 },
    },
}, {
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model('gameHistory', gameHistory);


const mongoose = require('mongoose');

const schema = mongoose.Schema;
const luckyItem = new schema({
    oneHundredLuckyItem: {
        type: Object, required: false,
        low: Array,
        mid: Array,
        high: Array,
    },
    thousandLuckyItem: {
        type: Object, required: false,
        low: Array,
        mid: Array,
        high: Array,
    },
    tenThousandLuckyItem: {
        type: Object, required: false,
        low: Array,
        mid: Array,
        high: Array,
    },
}, {
    versionKey: false,
});

module.exports = mongoose.model('luckyItem', luckyItem);
const ticTacToe = require('../_models/ticTacToe.model');
const user = require('../_models/user.model');
const ObjectID = require('mongodb').ObjectId;
const displayId = require('../_helpers/displayId.helper');

exports.startTicTakToe = (req, res) => {
    displayId.genrate("ticTacToe").then((ticTacToeSrFound) => {
        if (ticTacToeSrFound == undefined) {
            res.status(500).send({ err: true, msg: 'ticTacToeSr is undefined' })
        } else {
            user.findOne({ _id: ObjectID(req.body.userId) }).then((userFound) => {
                if (userFound == null) {
                    res.status(500).send({ err: true, msg: "User Not Found" })
                } else {
                    if (userFound.coins.display >= req.body.batCoin) {
                        user.updateOne({ _id: ObjectID(req.body.userId) }, { $inc: { 'coins.display': -req.body.batCoin, 'coins.all': -req.body.batCoin } }).then((userUpdated) => {
                            if (userUpdated.modifiedCount == 1) {
                                let ins = new ticTacToe({
                                    userId: ObjectID(req.body.userId),
                                    opponent: req.body.opponent,
                                    batCoin: req.body.batCoin,
                                    ticTacToeSr: ticTacToeSrFound,
                                    state: "open"
                                });
                                ins.save().then((ticTacToeCreated) => {
                                    if (ticTacToeCreated == null) {
                                        res.status(500).send({ err: true, msg: 'TicTacToe Not created' })
                                    } else {
                                        res.status(200).send({ err: false, msg: 'TicTacToe Started successfully', created: ticTacToeCreated })
                                    }
                                }).catch((err) => {
                                    res.status(500).send({ err: true, msg: err })
                                });
                            } else {
                                res.status(500).send({ err: true, msg: "SomeThings went wrong" })
                            }
                        }).catch((err) => {
                            res.status(500).send({ err: true, msg: err })
                        })
                    } else {
                        res.status(500).send({ err: true, msg: 'No Sufficient Coins Available' });
                    }
                }
            }).catch((err) => {
                res.status(500).send({ err: true, msg: err })
            })
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err })
    });
}

exports.endTicTakToe = (req, res) => {
    ticTacToe.findOne({ _id: ObjectID(req.body.ticTacToeId) }).then((ticTacToes) => {
        if (ticTacToes == null) {
            res.status(500).send({ err: true, msg: 'TicTacToe Not Found' });
        } else {
            if (ticTacToes.state == 'open') {
                var batCoin = ticTacToes.batCoin
                var winCoin = winCoinOfTicTacToe(batCoin, ticTacToes.opponent)
                ticTacToe.updateOne({ _id: ObjectID(req.body.ticTacToeId) }, { $set: { winCoin: winCoin, state: "closed", actualWin: (2 * batCoin) - winCoin } }).then((updated) => {
                    if (updated.modifiedCount === 1) {
                        user.updateOne({ _id: ObjectID(ticTacToes.userId) }, { $inc: { 'coins.display': winCoin, 'coins.all': winCoin } }).then((updated) => {
                            if (updated.modifiedCount === 1) {
                                res.status(200).send({ err: false, msg: 'TicTacToe Complete successfully' })
                            } else {
                                res.status(500).send({ err: true, msg: "SomeThings went wrong" })
                            }
                        }).catch((err) => {
                            res.status(500).send({ err: true, msg: err })
                        })
                    } else {
                        res.status(500).send({ err: true, msg: "SomeThings went wrong" })
                    }
                }).catch((err) => {
                    console.log(err)
                    res.status(500).send({ err: true, msg: err })
                })
            } else {
                res.status(500).send({ err: true, msg: "Game Already Running" })
            }
        }
    }).catch((err) => {
        console.log(err)
        res.status(500).send({ err: true, msg: err })
    })
}

function winCoinOfTicTacToe(batCoin, opponent) {
    if (opponent == 'bot') {
        var totalWin = 2 * batCoin
        return totalWin
    } else {
        var totalWin = 2 * batCoin
        console.log('totalWin', totalWin)
        var winCoin = totalWin - (totalWin * 5) / 100;
        console.log('winCoin', winCoin)
        return winCoin
    }

}

exports.getAllTicTacToe = (req, res) => {
    ticTacToe.find({}).then((ticTacToes) => {
        if (ticTacToes.length == 0) {
            res.status(500).send({ err: true, msg: 'TicTacToe Not Found' })
        } else {
            res.status(200).send({ err: false, msg: 'Find All Tic Successfully', data: ticTacToes });
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err })
    })
}

exports.getTicTacToeByUser = (req, res) => {
    ticTacToe.find({ userId: ObjectID(req.params.userId) }).then((ticTacToes) => {
        if (ticTacToes.length == 0) {
            res.status(500).send({ err: true, msg: 'TicTacToe Not Found' })
        } else {
            res.status(200).send({ err: false, msg: 'Find All Tic Successfully', data: ticTacToes });
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err })
    })
}

exports.TicTacToeEarning = (req, res) => {
    var todayStart = new Date();
    todayStart.setSeconds(0);
    todayStart.setHours(-5);
    todayStart.setMinutes(-30);
    todayStart.setMilliseconds(0);
    ticTacToe.aggregate([
        {
            $group: { _id: "$null", total: { $sum: "$actualWin" } }
        }
    ]).sort({ createdAt: -1 }).then((transactions) => {
        ticTacToe.aggregate([
            { $match: { createdAt: { "$gte": todayStart } } },
            {
                $group: { _id: "$null", total: { $sum: "$actualWin" } }
            }
        ]).sort({ createdAt: -1 }).then((today) => {
            res.status(200).send({ err: false, msg: "Earning Retrieved Successfully.", 'Total': transactions[0], 'Today': today[0] });
        }).catch((err) => {
            res.status(500).send({ err: true, msg: err });
        })
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err });
    })
}
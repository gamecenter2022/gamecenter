const dice = require('../_models/dice.model');
const displayId = require('../_helpers/displayId.helper');
const user = require('../_models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;
const appConfig = require('../_models/appConfig.model');

exports.playDiceGame = (req, res) => {
    user.findOne({ _id: ObjectId(req.body.userId) }).then((userFound) => {
        if (userFound == null) {
            res.status(500).send({ err: true, msg: "User not found" })
        } else {
            let diceNumber = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
            var totalBatCoins = req.body.batCoin * req.body.times;
            if (userFound.coins.display >= totalBatCoins) {
                user.updateOne({ _id: ObjectId(req.body.userId) }, { $inc: { 'coins.display': - totalBatCoins, 'coins.all': - totalBatCoins } }).then((userUpdated) => {
                    displayId.genrate('dice').then((diceSrNumber) => {
                        gameWinCoins(req.body.batCoin, diceNumber, req.body.times, req.body.targetNo).then((finalWin) => {
                            let finalWinCoin = finalWin.winCoin
                            var actualWin = (req.body.batCoin * req.body.times) - finalWinCoin
                            let ins = new dice({
                                userId: userFound._id,
                                batCoin: req.body.batCoin,
                                diceSrNumber: diceSrNumber,
                                winCoin: finalWinCoin,
                                actualWin: actualWin,
                                times: req.body.times,
                                targetNo: req.body.targetNo,
                                returnNumber: finalWin.openNumber,
                                name: userFound.name,
                                displayId: userFound.displayId,
                            });
                            ins.save().then((created) => {
                                if (created == null) {
                                    res.status(500).send({ err: true, msg: 'something went wrong' })
                                } else {
                                    user.updateOne({ _id: ObjectId(req.body.userId) }, { $inc: { 'coins.display': created.winCoin, 'coins.all': created.winCoin } }).then((updated) => {
                                        if (updated.nModified == 0) {
                                            res.status(500).send({ err: true, msg: err })
                                        } else {
                                            res.status(200).send({ err: false, msg: 'You Win Coins Successfully', winCoin: created.winCoin, openNumber: finalWin.openNumber })
                                        }
                                    }).catch((err) => {
                                        res.status(500).send({ err: true, msg: err })
                                    })
                                }
                            }).catch((err) => {
                                res.status(500).send({ err: true, msg: err })
                            })
                        }).catch((err) => {
                            res.status(500).send({ err: true, msg: err })
                        });
                    }).catch((err) => {
                        res.status(500).send({ err: true, msg: err })
                    })
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
function gameWinCoins(batCoin, diceNumber, times, targetNo) {
    return new Promise(async (resolve, reject) => {
        try {
            let winGame = {
                winCoin: 0,
                openNumber: 0
            }
            let gameTotalCoins = batCoin * times;
            let openNumber = [1, 2, 3, 4, 5, 6];
            appConfig.findOne({}).then((appConfigFound) => {
                if (appConfigFound.misMatchCount >= 5) {
                    if (targetNo == diceNumber) {
                        appConfig.updateOne({}, { $set: { misMatchCount: 0 } }).then((appConfigFound) => {
                            if (appConfigFound) {
                                winGame.winCoin = gameTotalCoins * 5;
                                winGame.openNumber = diceNumber
                                resolve(winGame)
                            }
                        }).catch((err) => {
                            reject(err)
                        })
                    } else {
                        appConfig.updateOne({}, { $inc: { misMatchCount: 1 } }).then((appConfigFound) => {
                            if (appConfigFound) {
                                openNumber = openNumber.filter(function (item) {
                                    return item !== targetNo
                                })
                                newItem = openNumber[Math.floor(Math.random() * (openNumber.length - 1))]
                                winGame.openNumber = newItem
                                resolve(winGame)
                            }
                        }).catch((err) => {
                            reject(err)
                        })
                    }
                } else {
                    appConfig.updateOne({}, { $inc: { misMatchCount: 1 } }).then((appConfigFound) => {
                        if (appConfigFound) {
                            openNumber = openNumber.filter(function (item) {
                                return item !== targetNo
                            })
                            newItem = openNumber[Math.floor(Math.random() * (openNumber.length - 1))]
                            winGame.openNumber = newItem
                            resolve(winGame)
                        }
                    }).catch((err) => {
                        reject(err)
                    })
                }
            }).catch((err) => {
                reject(err)
            })
        } catch {
            reject(null)
        }
    })
}
exports.getAllDiceHistory = (req, res) => {
    var todayStart = new Date();
    todayStart.setSeconds(0);
    todayStart.setHours(-5);
    todayStart.setMinutes(-30);
    todayStart.setMilliseconds(0);
    dice.find({ createdAt: { "$gte": todayStart } }).sort({ createdAt: -1 }).then((diceHistory) => {
        if (diceHistory == null) {
            res.status(500).send({ err: true, msg: "Dice History not found" })
        } else {
            res.status(200).send({ err: false, msg: "Dice History find successfully", diceHistory: diceHistory })
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err })
    })
}
exports.getDiceHistoryByUserId = (req, res) => {
    dice.find({ userId: ObjectId(req.params.userId) }).then((diceHistory) => {
        if (diceHistory.length == 0) {
            res.status(200).send({ err: false, msg: "Dice History not found" })
        } else {
            res.status(200).send({ err: false, msg: "Dice History find Successfully", diceHistory: diceHistory })
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err })
    })
}

exports.getDiceEarning = (req, res) => {
    var todayStart = new Date();
    todayStart.setSeconds(0);
    todayStart.setHours(-5);
    todayStart.setMinutes(-30);
    todayStart.setMilliseconds(0);
    dice.aggregate([
        {
            $group: { _id: "$null", total: { $sum: "$actualWin" } }
        }
    ]).sort({ createdAt: -1 }).then((transactions) => {
        dice.aggregate([
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
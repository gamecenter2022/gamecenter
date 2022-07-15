const spinGameConfig = require('../_models/spinGameConfig.model');
const luckyItem = require('../_models/luckyItem.model');
const user = require('../_models/user.model');
const ObjectID = require('mongodb').ObjectId;
const spinHistory = require('../_models/spinHistory.model');
exports.getSpinResult = (req, res) => {
    spinGameConfig.findOne({}).then((game) => {
        if (game.highGameCount == 0 && game.mediumGameCount == 0 && game.lowGameCount == 0) {
            resetGame(game, req, res);
        } else {
            playGame(game, req, res)
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err });
    })
}
function playGame(game, req, res) {
    var item = randomCategory(game);
    sendItem(req, res, item, game)
}
function randomCategory(game) {
    var pickRandomElement = ['low', 'mid', 'high'];
    var item;
    if (game.lowGameCount == 0) {
        pickRandomElement = pickRandomElement.filter((item => { return item !== 'low' }))
    }
    if (game.mediumGameCount == 0) {
        pickRandomElement = pickRandomElement.filter((item => { return item !== 'mid' }))
    }
    if (game.highGameCount == 0) {
        pickRandomElement = pickRandomElement.filter(item => { return item !== 'high' })
    }
    item = pickRandomElement[Math.floor(Math.random() * pickRandomElement.length)]
    return item;
}
function resetGame(game, req, res) {
    console.log("resetGame", req.body);
    game.highGameCount = game.highPercentage * game.totalGameCount / 100;
    game.lowGameCount = game.lowPercentage * game.totalGameCount / 100;
    game.mediumGameCount = game.mediumPercentage * game.totalGameCount / 100;
    spinGameConfig.updateOne({}, { $set: game }).then((updated) => {
        if (updated.modifiedCount === 1) {
            playGame(game, req, res)
        } else {
            console.log("Not Updated");
        }
    }).catch((err) => {
        console.log(err);
    });
}

function randomItemFromArray(items, time, price) {
    var item = items[Math.floor(Math.random() * items.length)];
    return { item: item * time }
}

function updateGame(game) {
    spinGameConfig.updateOne({}, { $set: game }).then((updated) => {
        if (updated.modifiedCount === 1) {
            console.log("Spin Game Updated");
        } else {
            console.log("Spin Not Updated");
        }
    }).catch((err) => {
        console.log(err);
    });
}

function sendItem(req, res, item, game) {
    luckyItem.findOne({}).then((lucky) => {
        if (req.body.coins == 100) {
            if (item == 'low') {
                var mainItem = randomItemFromArray(lucky.oneHundredLuckyItem.low, req.body.time, req.body.coins);
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
            else if (item == 'mid') {
                var mainItem = randomItemFromArray(lucky.oneHundredLuckyItem.mid, req.body.time, req.body.coins);
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
            else if (item == 'high') {
                var mainItem = randomItemFromArray(lucky.oneHundredLuckyItem.high, req.body.time, req.body.coins);
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
        }
        else if (req.body.coins == 1000) {

            if (item == 'low') {
                var mainItem = randomItemFromArray(lucky.thousandLuckyItem.low, req.body.time, req.body.coins);
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
            else if (item == 'mid') {
                var mainItem = randomItemFromArray(lucky.thousandLuckyItem.mid, req.body.time, req.body.coins);
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
            else if (item == 'high') {
                var mainItem = randomItemFromArray(lucky.thousandLuckyItem.high, req.body.time, req.body.coins);
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
        }
        else if (req.body.coins == 10000) {
            if (item == 'low') {
                var mainItem = randomItemFromArray(lucky.tenThousandLuckyItem.low, req.body.time, req.body.coins);
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
            else if (item == 'mid') {
                var mainItem = randomItemFromArray(lucky.tenThousandLuckyItem.mid, req.body.time, req.body.coins);
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
            else if (item == 'high') {
                var mainItem = randomItemFromArray(lucky.tenThousandLuckyItem.high, req.body.time, req.body.coins)
                res.status(200).send({ err: false, msg: "Successfully saved.", data: mainItem, gameCategory: item });
            }
        }
        decreesGameCount(item, game);
    }).catch((err) => { console.log(err) });
}
function decreesGameCount(item, game) {
    if (item == 'low') {
        game.lowGameCount--;
        updateGame(game);
    } else if (item == 'mid') {
        game.mediumGameCount--;
        updateGame(game);
    } else if (item == 'high') {
        game.highGameCount--;
        updateGame(game);
    }
}

exports.LuckyItemsOfOne = (req, res) => {
    luckyItem.findOne({}).then((lucky) => {
        if (lucky == null) {
            res.status(500).send({ err: true, msg: "No LuckyItems Find" });
        } else {
            if (req.params.coins < 100) {
                res.status(500).send({ err: true, msg: "Please Enter Coins Greater Than 100" });
            } else if (req.params.coins == 100) {
                var LuckyItemsOfOneHundreds = [];
                lucky.oneHundredLuckyItem.low.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                lucky.oneHundredLuckyItem.mid.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                lucky.oneHundredLuckyItem.high.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                res.status(200).send({ err: false, msg: "Successfully Find.", data: LuckyItemsOfOneHundreds });
            }
            else if (req.params.coins == 1000) {
                var LuckyItemsOfOneHundreds = [];
                lucky.thousandLuckyItem.low.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                lucky.thousandLuckyItem.mid.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                lucky.thousandLuckyItem.high.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                res.status(200).send({ err: false, msg: "Successfully Find.", data: LuckyItemsOfOneHundreds });
            }
            else if (req.params.coins == 10000) {
                var LuckyItemsOfOneHundreds = [];
                lucky.tenThousandLuckyItem.low.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                lucky.tenThousandLuckyItem.mid.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                lucky.tenThousandLuckyItem.high.forEach((item) => {
                    LuckyItemsOfOneHundreds.push(item);
                })
                res.status(200).send({ err: false, msg: "Successfully Find.", data: LuckyItemsOfOneHundreds });
            } else if (req.params.coins > 10000) {
                res.status(500).send({ err: true, msg: "Please Enter Coins Less Than 10000" });
            }
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: "Something went wrong" });
    });
}
exports.addResultToUser = (req, res) => {
    let batCoin = Number(req.body.betCoins * req.body.times)
    user.findOneAndUpdate({ _id: ObjectID(req.body.userId) }, { $inc: { "coins.display": -batCoin, "coins.all": -batCoin } }).then((updatedUser) => {
        if (req.body.gameCategory == undefined) {
            console.log("spinHistory not created")
        } else {
            addCoin(req, res)
            createSpinHistory(updatedUser.username, req.body.userId, batCoin, req.body.item, req.body.gameCategory)
        }
    }).catch((err) => {
        console.log('updatedUser', err)
    });
}

function addCoin(req, res) {
    let winCoin = Number(req.body.item)
    let betCoins = Number(req.body.betCoins)
    if (winCoin > betCoins) {
        var newCoin = winCoin - betCoins
        user.findOneAndUpdate({ _id: ObjectID(req.body.userId) }, { $inc: { "coins.display": winCoin, "coins.all": winCoin, 'coins.spinWin': newCoin } }).then((updatedUser) => {
            console.log('return updatedUser', updatedUser.coins)
            res.status(200).send({ err: false, msg: "coins Added Successfully" })
        }).catch((err) => {
            console.log('updatedUser', err)
        })
    } else if (betCoins > winCoin) {
        var newCoin = betCoins - winCoin
        user.findOneAndUpdate({ _id: ObjectID(req.body.userId) }, { $inc: { "coins.display": winCoin, "coins.all": winCoin, 'coins.spinLoos': -newCoin } }).then((updatedUser) => {
            console.log('return updatedUser', updatedUser.coins)
            res.status(200).send({ err: false, msg: "coins Added Successfully" })
        }).catch((err) => {
            console.log('updatedUser', err)
        })
    } else if (betCoins == winCoin) {
        user.findOneAndUpdate({ _id: ObjectID(req.body.userId) }, { $inc: { "coins.display": winCoin, "coins.all": winCoin } }).then((updatedUser) => {
            console.log('return updatedUser', updatedUser.coins)
            res.status(200).send({ err: false, msg: "coins Added Successfully" })
        }).catch((err) => {
            console.log('updatedUser', err)
        })
    } else {
        console.log('error')
    }
}

function createSpinHistory(userName, userId, batCoin, winCoin, gameCategory) {
    let ins = new spinHistory({
        userName: userName,
        userId: userId,
        batCoin: batCoin,
        winCoin: winCoin,
        gameType: gameCategory,
    })
    ins.save().then((result) => {
        console.log('spinHistory created successfully')
    }).catch((err) => {
        console.log('spinHistory not created', err)
    });
}
exports.updateSpinGameConfig = (req, res) => {
    const body = req.body;
    spinGameConfig.updateOne({}, { $set: body }).then((result) => {
        if (result.modifiedCount == 1) {
            res.status(200).send({ err: false, msg: "updated Successfully" })
        } else {
            res.status(500).send({ err: true, msg: "not updated" })
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: "not updated" })
    });

}

exports.getTodaySpinHistory = (req, res) => {
    var todayStart = new Date();
    todayStart.setSeconds(0);
    todayStart.setHours(-5);
    todayStart.setMinutes(-30);
    todayStart.setMilliseconds(0);
    spinHistory.find({ createdAt: { "$gte": todayStart } }).sort({ 'createdAt': -1 }).then((spinHistories) => {
        var total = 0;
        spinHistories.forEach(function (element) {
            total += element.batCoin - element.winCoin;
        })
        res.status(200).send({ err: false, msg: "Retrieve History.", spinHistory: spinHistories, total: total });
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err })
    });
}

exports.getSpinGameConfig = (req, res) => {
    spinGameConfig.findOne().then((result) => {
        if (result == null) {
            res.status(500).send({ err: true, msg: "Config not found." });
        } else {
            res.status(200).send({ err: false, msg: "Retrieve Config.", config: result });
        }
    }).catch((err) => {
        res.status(500).send({ err: true, msg: err });
    });
}
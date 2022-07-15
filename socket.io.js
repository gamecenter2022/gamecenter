const ObjectID = require('mongodb').ObjectId;
const moment = require('moment');
var teenPattiScore = require("teenpattisolver");
const user = require('./_models/user.model');
const gameHistory = require('./_models/gameHistory.model');
const idGenerator = require('./_helpers/displayId.helper');
const level = require('./_helpers/level.helper');
const greedy = require('./_models/greedy.model');
const greedyConfig = require('./_models/greedyConfig.model');
const winnerHelper = require('./_helpers/cardGameWinner.helper');
const gameConfig = require('./_models/gameConfig.model');
module.exports = (myObject) => {
    let server = myObject.server
    let app = myObject.app
    var io = require("socket.io")(server, {
        transports: ['websocket'],
        allowUpgrades: false,
        pingInterval: 25000,
        pingTimeout: 60000,
    });
    app.set('socketio', io);
    var lastWinSeatName = ""
    var lastWinnerSet = []
    var dummyUser = []
    let seatName = ["A", "B", "C"]
    function startGame() {
        // storeNewGameIntoDB()
        // setTimeout(declareGame, 33000);
        // storeNewGreedyIntoDB()
        // setTimeout(greedyDeclare, 33000);
    }
    setTimeout(() => {
        setInterval(startGame, 42000);
    }, 15000);
    function getRandomTime(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    function storeNewGameIntoDB() {
        gameHistory.findOne().sort({ createdAt: -1 }).limit(1).then((lastGame) => {
            if (lastGame == null) {
                idGenerator.genrate('gameHistory').then((gameSrNumber) => {
                    let ins = new gameHistory({ gameStatus: 'open' });
                    ins.gameSrNumber = gameSrNumber;
                    ins.cardGameDetails = {
                        totalSeatAUsers: 0,
                        totalSeatBUsers: 0,
                        totalSeatCUsers: 0,
                        totalSeatACoins: 0,
                        totalSeatBCoins: 0,
                        totalSeatCCoins: 0
                    }
                    ins.save().then((storedGame) => {
                        io.to('card_game').emit('newGame_started', { err: false, msg: "New game started.", gameHistory: storedGame });
                        //add three calls for dummy game
                        console.log("Starting the game")
                        setTimeout(addDummyGameUser, getRandomTime(20000));
                        setTimeout(addDummyGameUser, getRandomTime(20000));
                        setTimeout(addDummyGameUser, getRandomTime(20000));
                    }).catch((err) => {
                        console.log('err', err)
                    })
                }).catch((err) => {
                    console.log(err);
                })
            } else {
                if (lastGame.gameStatus == "closed") {
                    idGenerator.genrate('gameHistory').then((gameSrNumber) => {
                        let ins = new gameHistory({ gameStatus: 'open' });
                        ins.gameSrNumber = gameSrNumber;
                        ins.cardGameDetails = {
                            totalSeatAUsers: 0,
                            totalSeatBUsers: 0,
                            totalSeatCUsers: 0,
                            totalSeatACoins: 0,
                            totalSeatBCoins: 0,
                            totalSeatCCoins: 0
                        }
                        ins.save().then((storedGame) => {
                            io.to('card_game').emit('newGame_started', { err: false, msg: "New game started.", gameHistory: storedGame });
                            //add three calls for dummy game
                            console.log("Starting the game")
                            setTimeout(addDummyGameUser, getRandomTime(20000));
                            setTimeout(addDummyGameUser, getRandomTime(20000));
                            setTimeout(addDummyGameUser, getRandomTime(20000));
                        }).catch((err) => {
                            console.log('err', err)
                        })
                    }).catch((err) => {
                        console.log(err);
                    })
                } else {
                    console.log("not starting the game *****")
                }
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    function addDummyGameUser() {
        let dummyCoin = [10000, 20000, 30000, 5000, 50000, 500, 1000, 1600, 1200, 40000, 100000, 60000]
        let randomCoin = Math.floor(Math.random() * dummyCoin.length);
        let chooseCoin = dummyCoin[randomCoin] //return 0,1,2
        let randomSeat = Math.floor(Math.random() * seatName.length);
        let chooseSeat = seatName[randomSeat]
        seatName.splice(randomSeat, 1)
        dummyUser.push({ seatName: chooseSeat, coinAmount: chooseCoin })
        io.to('card_game').emit('update_game', { err: false, msg: "Adding dummy user with coin.", dummyUser: dummyUser });
        console.log("I am getting call", dummyUser)
    }

    function getNewUpdateSet(finalWinnerSet, winSeatName, winner) {
        let newSet = []
        if (winSeatName === 1) { // A
            newSet.push(finalWinnerSet)
            newSet.push(winner.sets[0])
            newSet.push(winner.sets[1])
        }
        else if (winSeatName === 2) { // B
            newSet.push(winner.sets[0])
            newSet.push(finalWinnerSet)
            newSet.push(winner.sets[1])
        } else { // C
            newSet.push(winner.sets[0])
            newSet.push(winner.sets[1])
            newSet.push(finalWinnerSet)
        }
        return newSet
    }

    function getTotalEarnings(totalBatCoins, winSeatName, currentGame) {
        let totalCoinsSending = 0
        if (winSeatName === 1) { // A
            currentGame.seatAUsers.forEach((batUser) => {
                let battingCoin = batUser.coins;
                let threeBatCoin = (battingCoin * 3)
                threeBatCoin = threeBatCoin - (battingCoin * 0.1)
                totalCoinsSending = totalCoinsSending + threeBatCoin
            })
        }
        if (winSeatName === 2) { // B
            currentGame.seatBUsers.forEach((batUser) => {
                let battingCoin = batUser.coins;
                let threeBatCoin = (battingCoin * 3)
                threeBatCoin = threeBatCoin - (battingCoin * 0.1)
                totalCoinsSending = totalCoinsSending + threeBatCoin
            })
        }
        if (winSeatName === 3) { // C
            currentGame.seatCUsers.forEach((batUser) => {
                let battingCoin = batUser.coins;
                let threeBatCoin = (battingCoin * 3)
                threeBatCoin = threeBatCoin - (battingCoin * 0.1)
                totalCoinsSending = totalCoinsSending + threeBatCoin
            })
        }
        let coinsEarning = totalBatCoins - totalCoinsSending
        return coinsEarning
    }

    //Declare game
    function declareGame() {
        dummyUser = []
        seatName = ["A", "B", "C"]
        winnerHelper.getWinner().then((winner) => {
            gameHistory.findOne().sort({ createdAt: -1 }).limit(1).then((currentGame) => {
                if (currentGame.gameStatus == "closed") {
                    return;
                }

                let winnerSeatType = winner.winnerLevelType
                let coinsArray = [];
                coinsArray.push(currentGame.cardGameDetails.totalSeatACoins);
                coinsArray.push(currentGame.cardGameDetails.totalSeatBCoins);
                coinsArray.push(currentGame.cardGameDetails.totalSeatCCoins);
                let winSeatName = getSeatNameFromUsers(winnerSeatType, coinsArray) // for example A
                let finalWinnerSet = winner.sets[(winner.winnerSet - 1)]
                winner.sets.splice((winner.winnerSet - 1), 1)
                winnerCard = winner.nineCards
                let newSet = getNewUpdateSet(finalWinnerSet, winSeatName, winner)

                //['low', 'medium', 'high'];
                var totalCoinsSending = 0
                let totalBatCoins = coinsArray.reduce((total, coin) => total + coin);
                let coinsEarning = getTotalEarnings(totalBatCoins, winSeatName, currentGame)
                //Settle transaction
                if (winSeatName === 1) {
                    currentGame.seatAUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        batCoin = (batCoin * .90) + batCoin;
                        totalCoinsSending = ((batCoin * .90) + batCoin + batCoin);
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": batCoin, "coins.all": batCoin, "coins.gameWin": batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    currentGame.seatBUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": -batCoin, "coins.all": -batCoin, "coins.gameLoos": batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    currentGame.seatCUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": -batCoin, "coins.all": -batCoin, "coins.gameLoos": batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    updateGameStatus(currentGame, winner, winSeatName, coinsEarning, newSet)
                }
                if (winSeatName === 2) {
                    currentGame.seatAUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": -batCoin, "coins.all": -batCoin, "coins.gameLoos": batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    currentGame.seatBUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        batCoin = (batCoin * .90) + batCoin;
                        totalCoinsSending = ((batCoin * .90) + batCoin + batCoin);
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": batCoin, "coins.all": batCoin, "coins.gameWin": batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    currentGame.seatCUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": -batCoin, "coins.all": -batCoin, "coins.gameLoos": batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    updateGameStatus(currentGame, winner, winSeatName, coinsEarning, newSet)
                }
                if (winSeatName === 3) { //high
                    currentGame.seatAUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": -batCoin, "coins.all": -batCoin, "coins.gameLoos": batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    currentGame.seatBUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": -batCoin, "coins.all": -batCoin, "coins.gameLoos": -batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    currentGame.seatCUsers.forEach((batUser) => {
                        let batCoin = batUser.coins;
                        batCoin = (batCoin * .90) + batCoin;
                        totalCoinsSending = ((batCoin * .90) + batCoin + batCoin);
                        user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": batCoin, "coins.all": batCoin, "coins.gameWin": batCoin } }).then((updatedUser) => {
                            console.log('updatedUser')
                        }).catch((err) => {
                            console.log('updatedUser', err)
                        })
                    })
                    updateGameStatus(currentGame, winner, winSeatName, coinsEarning, newSet)
                }
            }).catch((err) => {
                console.log('err', err)
            })
        }).catch((err) => {
            console.log('err', err)
        })
    }

    function updateGameStatus(currentGame, winner, winSeatName, coinsEarning, newSet) {
        gameHistory.updateOne({ _id: currentGame._id }, { $set: { winnerLevel: winner.winnerLevelType, gameStatus: 'closed', winnerSeat: winSeatName, coinsEarning: coinsEarning } }).then((updatedGame) => {
            io.to('card_game').emit('declareGame', { err: false, msg: "Declare game successfully.", gameHistory: currentGame, winSeatName: winSeatName, winnerSet: newSet })
            lastWinSeatName = winSeatName
            lastWinnerSet = newSet
        });
    }

    function getSeatNameFromUsers(fromLevel, usersCoinsArray) {
        //if  user coins are zero, means no one is playing return random seat, 1-to-3
        let totalBatCoins = usersCoinsArray.reduce((total, coin) => total + coin);
        if (totalBatCoins == 0) {
            var random = Math.floor(Math.random() * 3); //output 0,1,2
            return random + 1
        }
        if (fromLevel === 'low') {
            var indexOfSeat = usersCoinsArray.indexOf(Math.min(...usersCoinsArray));
            return (indexOfSeat + 1);
        }
        else if (fromLevel === 'medium') {
            var copyUsersCoinsArray = [...usersCoinsArray]
            var indexOfMax = usersCoinsArray.indexOf(Math.max(...usersCoinsArray));
            var indexOfMin = usersCoinsArray.indexOf(Math.min(...usersCoinsArray));
            copyUsersCoinsArray.splice(indexOfMax, 1);
            copyUsersCoinsArray.splice(indexOfMin, 1);
            return (usersCoinsArray.indexOf(copyUsersCoinsArray[0]) + 1);
        }
        else if (fromLevel === 'high') {
            var indexOfSeat = usersCoinsArray.indexOf(Math.max(...usersCoinsArray));
            return (indexOfSeat + 1);
        }
    }


    // greedy leave high low medium  
    function storeNewGreedyIntoDB() {
        greedy.findOne().sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
            if (lastGreedy == null) {
                idGenerator.genrate('greedy').then((greedySrNumber) => {
                    let ins = new greedy({
                        gameStatus: 'open',
                        greedySrNumber: greedySrNumber
                    });
                    ins.save().then((storedGreedy) => {
                        io.to('join_greedy').emit('newGreedy_started', { err: false, msg: "New greedy started.", greedyHistory: storedGreedy });
                    }).catch((err) => {
                        console.log('err', err)
                    })
                }).catch((err) => {
                    console.log(err);
                })
            } else if (lastGreedy.gameStatus == "closed") {
                idGenerator.genrate('greedy').then((greedySrNumber) => {
                    let ins = new greedy({
                        gameStatus: 'open',
                        greedySrNumber: greedySrNumber
                    });
                    ins.save().then((storedGreedy) => {
                        io.to('join_greedy').emit('newGreedy_started', { err: false, msg: "New greedy started.", greedyHistory: storedGreedy });
                    }).catch((err) => {
                        console.log('err', err)
                    })
                }).catch((err) => {
                    console.log(err);
                })
            } else {
                console.log("greedy not starting *****")
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    function greedyCoinsArrayForLevels() {
        return new Promise(async (resolve, reject) => {
            try {
                var levels = [];
                greedy.findOne().sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                    if (lastGreedy.gameStatus == "closed") {
                        reject("closed")
                    } else {
                        let applyUsers0 = 0;
                        lastGreedy.applyUsers0.forEach((user) => {
                            applyUsers0 = Number(applyUsers0) + Number(user.batCoin);
                        });
                        let obj0 = {
                            applyUsers: Number(applyUsers0),
                            bodgie: 0
                        };
                        levels.push(obj0)

                        //**************************************************************** */
                        let applyUsers1 = 0;
                        lastGreedy.applyUsers1.forEach((user) => {
                            applyUsers1 = Number(applyUsers1) + Number(user.batCoin);
                        });
                        let obj1 = {
                            applyUsers: Number(applyUsers1),
                            bodgie: 1
                        };
                        levels.push(obj1)

                        let applyUsers2 = 0;
                        lastGreedy.applyUsers2.forEach((user) => {
                            applyUsers2 = Number(applyUsers2) + Number(user.batCoin);
                        });
                        let obj2 = {
                            applyUsers: Number(applyUsers2),
                            bodgie: 2
                        };
                        levels.push(obj2)


                        let applyUsers3 = 0;
                        lastGreedy.applyUsers3.forEach((user) => {
                            applyUsers3 = Number(applyUsers3) + Number(user.batCoin);
                        });
                        let obj3 = {
                            applyUsers: Number(applyUsers3),
                            bodgie: 3
                        };
                        levels.push(obj3)


                        let applyUsers4 = 0;
                        lastGreedy.applyUsers4.forEach((user) => {
                            applyUsers4 = Number(applyUsers4) + Number(user.batCoin);
                        });
                        let obj4 = {
                            applyUsers: Number(applyUsers4),
                            bodgie: 4
                        };
                        levels.push(obj4)


                        let applyUsers5 = 0;
                        lastGreedy.applyUsers5.forEach((user) => {
                            applyUsers5 = Number(applyUsers5) + Number(user.batCoin);
                        });
                        let obj5 = {
                            applyUsers: Number(applyUsers5),
                            bodgie: 5
                        };
                        levels.push(obj5)

                        let applyUsers6 = 0;
                        lastGreedy.applyUsers6.forEach((user) => {
                            applyUsers6 = Number(applyUsers6) + Number(user.batCoin);
                        });
                        let obj6 = {
                            applyUsers: Number(applyUsers6),
                            bodgie: 6
                        };
                        levels.push(obj6)

                        let applyUsers7 = 0;
                        lastGreedy.applyUsers7.forEach((user) => {
                            applyUsers0 = Number(applyUsers7) + Number(user.batCoin);
                        });
                        let obj7 = {
                            applyUsers: Number(applyUsers7),
                            bodgie: 7
                        };
                        levels.push(obj7)





                        levels.sort(function (a, b) { return b.applyUsers - a.applyUsers });
                    }
                    if (levels.length > 0) {
                        resolve(levels)
                    } else {
                        reject(null);
                    }
                }).catch((err) => {
                    console.log('error', err)
                });
            } catch (err) {
                console.log('error', err)
            }
        });
    }

    function getLevels() {
        return new Promise(async (resolve, reject) => {
            try {
                greedyCoinsArrayForLevels().then((data) => {
                    var high = [];
                    var medium = [];
                    var low = [];
                    let allBodgie = [];
                    count = 0;
                    data.forEach((level) => {
                        if (level.applyUsers != 0) {
                            count++;
                        } else {

                        }
                    });
                    if (count == 0) {
                        high.push(data[0], data[1])
                        medium.push(data[2], data[3], data[4])
                        low.push(data[5], data[6], data[7])
                    } else if (count == 1) {
                        high.push(data[0], data[1])
                        medium.push(data[2], data[3], data[4])
                        low.push(data[5], data[6], data[7])
                    } else if (count == 2) {
                        high.push(data[0], data[2])
                        medium.push(data[1], data[3], data[4])
                        low.push(data[5], data[6], data[7])
                    } else if (count == 3) {
                        high.push(data[0], data[5])
                        medium.push(data[1], data[3], data[4])
                        low.push(data[2], data[6], data[7])
                    } else if (count == 4) {
                        high.push(data[0], data[1])
                        medium.push(data[2], data[4], data[5])
                        low.push(data[3], data[6], data[7])
                    } else if (count == 5) {
                        high.push(data[0], data[1])
                        medium.push(data[2], data[4], data[5])
                        low.push(data[3], data[6], data[7])
                    } else if (count == 6) {
                        high.push(data[0], data[1])
                        medium.push(data[2], data[3], data[6])
                        low.push(data[4], data[5], data[7])
                    } else if (count == 7) {
                        high.push(data[0], data[1])
                        medium.push(data[2], data[3], data[4])
                        low.push(data[5], data[6], data[7])
                    } else if (count == 8) {
                        high.push(data[0], data[1])
                        medium.push(data[2], data[3], data[4])
                        low.push(data[5], data[6], data[7])
                    }
                    allBodgie.push(high);
                    allBodgie.push(medium);
                    allBodgie.push(low);
                    if (allBodgie.length > 0) {
                        resolve(allBodgie)
                    } else {
                        reject(null)
                    }
                }).catch((err) => {
                    console.log('greedyCoinsArrayForLevels error', err)
                });
            } catch {
                reject(null)
            }
        });
    }
    function getWinBodgie() {
        return new Promise(async (resolve, reject) => {
            try {
                getLevels().then((data) => {
                    greedyLevelCalculation().then((newStatus) => {
                        updateGreedyConfig(newStatus)
                        let res = {
                            data: 0,
                            level: 0
                        }
                        if (newStatus == 'high') {
                            res.data = data[0];
                            res.level = newStatus;
                            resolve(res);
                        }
                        if (newStatus == 'medium') {
                            res.data = data[1];
                            res.level = newStatus;
                            resolve(res);
                        }
                        if (newStatus == 'low') {
                            res.data = data[2];
                            res.level = newStatus;
                            resolve(res);
                        }
                    }).catch((err) => {
                        console.log(err)
                    })
                }).catch((err) => {
                    console.log(err)
                });
            } catch {
                reject()
            }
        });
    }
    function greedyLevelCalculation() {
        return new Promise(async (resolve, reject) => {
            try {
                greedyConfig.findOne({}).then((greedy) => {
                    if (greedy == null) {
                        reject('No greedy configs found');
                    } else {
                        let greedyLevel = ['low', 'medium', 'high']
                        var item;
                        if (greedy.lowGreedyCount === 0 && greedy.mediumGreedyCount === 0 && greedy.highGreedyCount === 0) {
                            resetGreedyConfig(greedy)
                        } else {
                            if (greedy.lowGreedyCount == 0) {
                                greedyLevel = greedyLevel.filter((item => { return item !== 'low' }))
                            }
                            if (greedy.mediumGreedyCount == 0) {
                                greedyLevel = greedyLevel.filter((item => { return item !== 'mid' }))
                            }
                            if (greedy.highGreedyCount == 0) {
                                greedyLevel = greedyLevel.filter(item => { return item !== 'high' })
                            }
                            item = greedyLevel[Math.floor(Math.random() * greedyLevel.length)]
                            resolve(item)
                        }
                    }
                }).catch((err) => {
                    reject('No greedy configs found');
                });
            } catch {
                reject('No greedy configs found');
            }
        });
    }
    function updateGreedyConfig(status) {
        if (status == 'low') {
            greedyConfig.updateOne({}, { $inc: { lowGreedyCount: -1 } }).then((greedy) => {
                console.log("greedyConfig update successfully")
            }).catch((err) => {
                console.log(err);
            })
        } else if (status == 'medium') {
            greedyConfig.updateOne({}, { $inc: { mediumGreedyCount: -1 } }).then((greedy) => {
                console.log("greedyConfig update successfully")
            }).catch((err) => {
                console.log(err);
            })
        } else if (status == 'high') {
            greedyConfig.updateOne({}, { $inc: { highGreedyCount: -1 } }).then((greedy) => {
                console.log("greedyConfig update successfully")
            }).catch((err) => {
                console.log(err);
            })
        }
    }

    function resetGreedyConfig(greedy) {
        greedy.highGreedyCount = greedy.highPercentage * greedy.totalGreedyCount / 100;
        greedy.lowGreedyCount = greedy.lowPercentage * greedy.totalGreedyCount / 100;
        greedy.mediumGreedyCount = greedy.mediumPercentage * greedy.totalGreedyCount / 100;
        greedyConfig.updateOne({}, { $set: greedy }).then((updated) => {
            if (updated.nModified === 1) {
                console.log('Updated', greedy)
                getWinBodgie()
            } else {
                console.log("Not Updated");
            }
        }).catch((err) => {
            console.log(err);
        });
    }
    function greedyDeclare() {
        getWinBodgie().then((data) => {
            let result = data.data;
            var randomData = result[Math.floor(Math.random() * result.length)];
            if (randomData == undefined) {

            } else {
                if (data.level == 'high') {
                    //Settle Transaction from high, any bodgie
                    winningBodgie(randomData.bodgie, data.level);
                } else if (data.level == 'medium') {
                    //Settle Transaction from medium, any bodgie
                    winningBodgie(randomData.bodgie, data.level);
                } else if (data.level == 'low') {
                    //Settle Transaction from low, any bodgie
                    winningBodgie(randomData.bodgie, data.level);
                }
            }
        }).catch((err) => {
            console.log("err", err)
        })
    }
    function winningBodgie(bodgie, status) {
        if (bodgie == 0) {
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy.applyUsers0.length == 0) {
                    updateGreedyStatus(bodgie, status, lastGreedy._id)
                } else {
                    if (lastGreedy.gameStatus == "closed") {

                    } else {
                        lastGreedy.applyUsers0.forEach((batUser) => {
                            let newBatCoin = (batUser.batCoin) * 2;
                            user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": newBatCoin, "coins.all": newBatCoin } }).then((updatedUser) => {
                                updateGreedyStatus(bodgie, status, lastGreedy._id)
                            }).catch((err) => {
                                console.log('updatedUser', err)
                            })
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
            });
        } else if (bodgie == 1) {
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy.applyUsers1.length == 0) {
                    updateGreedyStatus(bodgie, status, lastGreedy._id)
                } else {
                    if (lastGreedy.gameStatus == "closed") {

                    } else {
                        lastGreedy.applyUsers1.forEach((batUser) => {
                            let newBatCoin = (batUser.batCoin) * 3;
                            user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": newBatCoin, "coins.all": newBatCoin } }).then((updatedUser) => {
                                updateGreedyStatus(bodgie, status, lastGreedy._id)
                            }).catch((err) => {
                                console.log('updatedUser', err)
                            })
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
            });
        } else if (bodgie == 2) {
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy.applyUsers2.length == 0) {
                    updateGreedyStatus(bodgie, status, lastGreedy._id)
                } else {
                    if (lastGreedy.gameStatus == "closed") {

                    } else {
                        lastGreedy.applyUsers2.forEach((batUser) => {
                            let newBatCoin = (batUser.batCoin) * 4;
                            user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": newBatCoin, "coins.all": newBatCoin } }).then((updatedUser) => {
                                updateGreedyStatus(bodgie, status, lastGreedy._id)
                            }).catch((err) => {
                                console.log('updatedUser', err)
                            })
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
            });
        } else if (bodgie == 3) {
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy.applyUsers3.length == 0) {
                    updateGreedyStatus(bodgie, status, lastGreedy._id)
                } else {
                    if (lastGreedy.gameStatus == "closed") {

                    } else {
                        lastGreedy.applyUsers3.forEach((batUser) => {
                            let newBatCoin = (batUser.batCoin) * 5;
                            user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": newBatCoin, "coins.all": newBatCoin } }).then((updatedUser) => {
                                updateGreedyStatus(bodgie, status, lastGreedy._id)
                            }).catch((err) => {
                                console.log('updatedUser', err)
                            })
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
            });
        } else if (bodgie == 4) {
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy.applyUsers4.length == 0) {
                    updateGreedyStatus(bodgie, status, lastGreedy._id)
                } else {
                    if (lastGreedy.gameStatus == "closed") {

                    } else {
                        lastGreedy.applyUsers4.forEach((batUser) => {
                            let newBatCoin = (batUser.batCoin) * 6;
                            user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": newBatCoin, "coins.all": newBatCoin } }).then((updatedUser) => {
                                updateGreedyStatus(bodgie, status, lastGreedy._id)
                            }).catch((err) => {
                                console.log('updatedUser', err)
                            })
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
            });
        } else if (bodgie == 5) {
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy.applyUsers5.length == 0) {
                    updateGreedyStatus(bodgie, status, lastGreedy._id)
                } else {
                    if (lastGreedy.gameStatus == "closed") {

                    } else {
                        lastGreedy.applyUsers5.forEach((batUser) => {
                            let newBatCoin = (batUser.batCoin) * 7;
                            user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": newBatCoin, "coins.all": newBatCoin } }).then((updatedUser) => {
                                updateGreedyStatus(bodgie, status, lastGreedy._id)
                            }).catch((err) => {
                                console.log('updatedUser', err)
                            })
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
            });
        } else if (bodgie == 6) {
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy.applyUsers6.length == 0) {
                    updateGreedyStatus(bodgie, status, lastGreedy._id)
                } else {
                    if (lastGreedy.gameStatus == "closed") {

                    } else {
                        lastGreedy.applyUsers6.forEach((batUser) => {
                            let newBatCoin = (batUser.batCoin) * 8;
                            user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": newBatCoin, "coins.all": newBatCoin } }).then((updatedUser) => {
                                updateGreedyStatus(bodgie, status, lastGreedy._id)
                            }).catch((err) => {
                                console.log('updatedUser', err)
                            })
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
            });
        } else if (bodgie == 7) {
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy.applyUsers7.length == 0) {
                    updateGreedyStatus(bodgie, status, lastGreedy._id)
                } else {
                    if (lastGreedy.gameStatus == "closed") {
                    } else {
                        lastGreedy.applyUsers7.forEach((batUser) => {
                            let newBatCoin = (batUser.batCoin) * 9;
                            user.updateOne({ _id: ObjectID(batUser.userId) }, { $inc: { "coins.display": newBatCoin, "coins.all": newBatCoin } }).then((updatedUser) => {
                                updateGreedyStatus(bodgie, status, lastGreedy._id)
                            }).catch((err) => {
                                console.log('updatedUser', err)
                            })
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    function updateGreedyStatus(bodgie, status, greedyId) {
        greedy.updateOne({ _id: greedyId }, { $set: { gameStatus: "closed", winnerLevel: status, winnerBodgie: bodgie } }).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
            if (lastGreedy.nModified == 0) {
                console.log('greedyStatus not updated')
            } else {

                console.log("greedy successfully finished");
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    // socket connection
    io.on("connection", (socket) => {
        //** Game Socket */
        console.log('connection', socket.id);

        socket.on('join_card_game', () => {
            socket.join('card_game');
            gameHistory.findOne().sort({ createdAt: -1 }).limit(1).then((lastGame) => {
                if (lastGame == null) { console.log('no game found on joining') }
                else {
                    if (lastGame.gameStatus == 'open') {
                        //var duration = moment(Date()).diff(moment(lastGame.createdAt), 'seconds')
                        io.to('card_game').emit('update_game', { err: false, msg: "Successfully retrieve card game details.", gameHistory: lastGame, dummyUser: dummyUser });
                    }
                    else { //closed
                        socket.emit('game_over', { err: false, msg: "Successfully retrieve card game details.", gameHistory: lastGame, winSeatName: lastWinSeatName, winnerSet: lastWinnerSet, dummyUser: dummyUser });
                    }
                }
            }).catch((err) => {
                io.to('card_game').emit('update_game', { err: true, msg: err });
            });

        });

        socket.on('leave_card_game', () => {
            socket.leave('card_game');
        });

        // apply for bet
        socket.on('apply_card_game_seat', (data) => {
            gameHistory.findOne().sort({ createdAt: -1 }).limit(1).then((appliedGame) => {
                if (appliedGame == null || appliedGame.gameStatus === "closed" || data.user.gameSrNumber != appliedGame.gameSrNumber) {
                    socket.emit('update_game', { err: true, msg: "Game Over, wait for next game.", latestApplyUserDetail: data, gameHistory: appliedGame, dummyUser: dummyUser });
                    return;
                }
                else {
                    let currentCardGameDetails = appliedGame.cardGameDetails;
                    if (data.user.seat === 'a') {
                        currentCardGameDetails.totalSeatAUsers++;
                        currentCardGameDetails.totalSeatACoins += data.user.coins;
                    } else if (data.user.seat === 'b') {
                        currentCardGameDetails.totalSeatBUsers++;
                        currentCardGameDetails.totalSeatBCoins += data.user.coins;
                    } else {
                        currentCardGameDetails.totalSeatCUsers++;
                        currentCardGameDetails.totalSeatCCoins += data.user.coins;
                    }
                    let cardGameDetails = {
                        totalSeatAUsers: currentCardGameDetails.totalSeatAUsers,
                        totalSeatBUsers: currentCardGameDetails.totalSeatBUsers,
                        totalSeatCUsers: currentCardGameDetails.totalSeatCUsers,
                        totalSeatACoins: currentCardGameDetails.totalSeatACoins,
                        totalSeatBCoins: currentCardGameDetails.totalSeatBCoins,
                        totalSeatCCoins: currentCardGameDetails.totalSeatCCoins,
                    };

                    if (data.user.seat === 'a') {
                        gameHistory.findOneAndUpdate({ _id: appliedGame._id }, { $push: { seatAUsers: data.user }, $set: { cardGameDetails: cardGameDetails } }, { new: true }).then((currentGame) => {
                            if (appliedGame == null) {
                                io.to('card_game').emit('update_game', { err: true, msg: "Game Over, wait for next game." });
                            } else {
                                io.to('card_game').emit('update_game', { err: false, msg: "Successfully retrieve card game details.", latestApplyUserDetail: data, gameHistory: currentGame, dummyUser: dummyUser })
                            }
                        }).catch((err) => { })

                    } else if (data.user.seat === 'b') {
                        gameHistory.findOneAndUpdate({ _id: appliedGame._id }, { $push: { seatBUsers: data.user }, $set: { cardGameDetails: cardGameDetails } }, { new: true }).then((currentGame) => {
                            if (appliedGame == null) {
                                io.to('card_game').emit('update_game', { err: true, msg: "Game Over, wait for next game." });
                            } else {
                                io.to('card_game').emit('update_game', { err: false, msg: "Successfully retrieve card game details.", latestApplyUserDetail: data, gameHistory: currentGame, dummyUser: dummyUser })
                            }
                        }).catch((err) => {
                            console.log('err', err)
                        })
                    } else {
                        gameHistory.findOneAndUpdate({ _id: appliedGame._id }, { $push: { seatCUsers: data.user }, $set: { cardGameDetails: cardGameDetails } }, { new: true }).then((currentGame) => {
                            if (appliedGame == null) {
                                io.to('card_game').emit('update_game', { err: true, msg: "Game Over, wait for next game." });
                            } else {
                                io.to('card_game').emit('update_game', { err: false, msg: "Successfully retrieve card game details.", latestApplyUserDetail: data, gameHistory: currentGame, dummyUser: dummyUser })
                            }
                        }).catch((err) => {
                            console.log('err', err)
                        })
                    }
                }
            })

        });

        //update socket id
        socket.on('update_socket_id', (usr) => {
            console.log('update_socket_id', usr)
            console.log(' socket.id ', socket.id)
            user.updateOne({ _id: usr.userId }, { $set: { socketId: socket.id } }).then(() => {
                socket.emit('update_socket_id', { err: false, msg: "Socket id has been successfully updated." })
            }).catch((err) => {
                socket.emit('update_socket_id', { err: true, msg: err });
            });
        });
        //  join greedy
        socket.on('join_greedy_game', () => {
            socket.join('join_greedy');
            greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((lastGreedy) => {
                if (lastGreedy == null) {
                    console.log('no game found on joining')
                }
                else {
                    if (lastGreedy.gameStatus == 'open') {
                        io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully join greedy", greedyHistory: lastGreedy });
                    }
                    else {
                        socket.emit('greedy_over', { err: false, msg: "Game Over wait for next game", greedyHistory: lastGreedy, });
                    }
                }
            }).catch((err) => {
                io.to('join_greedy').emit('update_greedy', { err: true, msg: err });
            });
        });

        // Apply for greedy
        socket.on('apply_greedy', (request) => {
            user.findOne({ _id: ObjectID(request.userId) }).then((userFound) => {
                if (userFound == null) {
                    socket.emit('apply_greedy_game', { err: true, msg: 'User account are not exist.' });
                } else {
                    if (userFound.coins.display >= request.batCoin) {
                        var greedyUser = applyForGreedy(userFound._id, userFound.name, request.batCoin, request.indexNo)
                        greedy.findOne({}).sort({ createdAt: -1 }).limit(1).then((greedyFinished) => {
                            if (greedyFinished == null || greedyFinished.gameStatus == "closed ") {
                                socket.emit('update_greedy', { err: true, msg: "Game Over, wait for next game." });
                                return;
                            } else {
                                if (request.indexNo === 0) {
                                    greedy.updateOne({ _id: greedyFinished._id }, { $push: { applyUsers0: greedyUser } }).then((greedyUpdated) => {
                                        if (greedyUpdated.nModified == 0) {
                                            io.to('join_greedy').emit('update_greedy', { err: true, msg: "Greedy Not updated" });
                                        } else {
                                            user.updateOne({ _id: ObjectID(request.userId) }, { $inc: { 'coins.display': -request.batCoin, 'coins.all': -request.batCoin } }).then((greedyUpdated) => {
                                                if (greedyUpdated.nModified == 0) {
                                                    socket.emit('apply_greedy_game', { err: true, msg: "Game Over, wait for next game." });
                                                } else {
                                                    io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully Apply For Greedy" })
                                                    console.log("Successfully Apply For Greedy")
                                                }
                                            }).catch((err) => {
                                                socket.emit('update_greedy', { err: true, msg: "User Not updated" });
                                            })
                                        }
                                    }).catch((err) => {
                                        io.to('join_greedy').emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
                                    })
                                } else if (request.indexNo === 1) {
                                    greedy.updateOne({ _id: greedyFinished._id }, { $push: { applyUsers1: greedyUser } }).then((greedyUpdated) => {
                                        if (greedyUpdated.nModified == 0) {
                                            io.to('join_greedy').emit('update_greedy', { err: true, msg: "Greedy Not updated" });
                                        } else {
                                            user.updateOne({ _id: ObjectID(request.userId) }, { $inc: { 'coins.display': -request.batCoin, 'coins.all': -request.batCoin } }).then((greedyUpdated) => {
                                                if (greedyUpdated.nModified == 0) {
                                                    socket.emit('apply_greedy_game', { err: true, msg: "Game Over, wait for next game." });
                                                } else {
                                                    io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully Apply For Greedy" })
                                                }
                                            }).catch((err) => {
                                                socket.emit('update_greedy', { err: true, msg: "User Not updated" });
                                            })
                                        }
                                    }).catch((err) => {
                                        io.to('join_greedy').emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
                                    })
                                } else if (request.indexNo === 2) {
                                    greedy.updateOne({ _id: greedyFinished._id }, { $push: { applyUsers2: greedyUser } }).then((greedyUpdated) => {
                                        if (greedyUpdated.nModified == 0) {
                                            io.to('join_greedy').emit('update_greedy', { err: true, msg: "Greedy Not updated" });
                                        } else {
                                            user.updateOne({ _id: ObjectID(request.userId) }, { $inc: { 'coins.display': -request.batCoin, 'coins.all': -request.batCoin } }).then((greedyUpdated) => {
                                                if (greedyUpdated.nModified == 0) {
                                                    socket.emit('apply_greedy_game', { err: true, msg: "Game Over, wait for next game." });
                                                } else {
                                                    io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully Apply For Greedy" })
                                                }
                                            }).catch((err) => {
                                                socket.emit('update_greedy', { err: true, msg: "User Not updated" });
                                            })
                                        }
                                    }).catch((err) => {
                                        io.to('join_greedy').emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
                                    })
                                } else if (request.indexNo === 3) {
                                    greedy.updateOne({ _id: greedyFinished._id }, { $push: { applyUsers3: greedyUser } }).then((greedyUpdated) => {
                                        if (greedyUpdated.nModified == 0) {
                                            io.to('join_greedy').emit('update_greedy', { err: true, msg: "Greedy Not updated" });
                                        } else {
                                            user.updateOne({ _id: ObjectID(request.userId) }, { $inc: { 'coins.display': -request.batCoin, 'coins.all': -request.batCoin } }).then((greedyUpdated) => {
                                                if (greedyUpdated.nModified == 0) {
                                                    socket.emit('apply_greedy_game', { err: true, msg: "Game Over, wait for next game." });
                                                } else {
                                                    io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully Apply For Greedy" })
                                                }
                                            }).catch((err) => {
                                                socket.emit('update_greedy', { err: true, msg: "User Not updated" });
                                            })
                                        }
                                    }).catch((err) => {
                                        io.to('join_greedy').emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
                                    })
                                } else if (request.indexNo === 4) {
                                    greedy.updateOne({ _id: greedyFinished._id }, { $push: { applyUsers4: greedyUser } }).then((greedyUpdated) => {
                                        if (greedyUpdated.nModified == 0) {
                                            io.to('join_greedy').emit('update_greedy', { err: true, msg: "Greedy Not updated" });
                                        } else {
                                            user.updateOne({ _id: ObjectID(request.userId) }, { $inc: { 'coins.display': -request.batCoin, 'coins.all': -request.batCoin } }).then((greedyUpdated) => {
                                                if (greedyUpdated.nModified == 0) {
                                                    socket.emit('apply_greedy_game', { err: true, msg: "Game Over, wait for next game." });
                                                } else {
                                                    io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully Apply For Greedy" })
                                                }
                                            }).catch((err) => {
                                                socket.emit('update_greedy', { err: true, msg: "User Not updated" });
                                            })
                                        }
                                    }).catch((err) => {
                                        io.to('join_greedy').emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
                                    })
                                } else if (request.indexNo === 5) {
                                    greedy.updateOne({ _id: greedyFinished._id }, { $push: { applyUsers5: greedyUser } }).then((greedyUpdated) => {
                                        if (greedyUpdated.nModified == 0) {
                                            io.to('join_greedy').emit('update_greedy', { err: true, msg: "Greedy Not updated" });
                                        } else {
                                            user.updateOne({ _id: ObjectID(request.userId) }, { $inc: { 'coins.display': -request.batCoin, 'coins.all': -request.batCoin } }).then((greedyUpdated) => {
                                                if (greedyUpdated.nModified == 0) {
                                                    socket.emit('apply_greedy_game', { err: true, msg: "Game Over, wait for next game." });
                                                } else {
                                                    io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully Apply For Greedy" })
                                                }
                                            }).catch((err) => {
                                                socket.emit('update_greedy', { err: true, msg: "User Not updated" });
                                            })
                                        }
                                    }).catch((err) => {
                                        io.to('join_greedy').emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
                                    })
                                } else if (request.indexNo === 6) {
                                    greedy.updateOne({ _id: greedyFinished._id }, { $push: { applyUsers6: greedyUser } }).then((greedyUpdated) => {
                                        if (greedyUpdated.nModified == 0) {
                                            io.to('join_greedy').emit('update_greedy', { err: true, msg: "Greedy Not updated" });
                                        } else {
                                            user.updateOne({ _id: ObjectID(request.userId) }, { $inc: { 'coins.display': -request.batCoin, 'coins.all': -request.batCoin } }).then((greedyUpdated) => {
                                                if (greedyUpdated.nModified == 0) {
                                                    socket.emit('apply_greedy_game', { err: true, msg: "Game Over, wait for next game." });
                                                } else {
                                                    io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully Apply For Greedy" })
                                                }
                                            }).catch((err) => {
                                                socket.emit('update_greedy', { err: true, msg: "User Not updated" });
                                            })
                                        }
                                    }).catch((err) => {
                                        io.to('join_greedy').emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
                                    })
                                } else if (request.indexNo === 7) {
                                    greedy.updateOne({ _id: greedyFinished._id }, { $push: { applyUsers7: greedyUser } }).then((greedyUpdated) => {
                                        if (greedyUpdated.nModified == 0) {
                                            io.to('join_greedy').emit('update_greedy', { err: true, msg: "Greedy Not updated" });
                                        } else {
                                            user.updateOne({ _id: ObjectID(request.userId) }, { $inc: { 'coins.display': -request.batCoin, 'coins.all': -request.batCoin } }).then((greedyUpdated) => {
                                                if (greedyUpdated.nModified == 0) {
                                                    socket.emit('apply_greedy_game', { err: true, msg: "Game Over, wait for next game." });
                                                } else {
                                                    io.to('join_greedy').emit('update_greedy', { err: false, msg: "Successfully Apply For Greedy" })
                                                }
                                            }).catch((err) => {
                                                socket.emit('update_greedy', { err: true, msg: "User Not updated" });
                                            })
                                        }
                                    }).catch((err) => {
                                        io.to('join_greedy').emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
                                    })
                                }
                            }
                        }).catch((err) => {
                            console.log('greedyFinished', err)
                        });
                        if (request.indexNo == 0) {

                        }
                    } else {
                        socket.emit('apply_greedy_game', { err: true, msg: 'No Sufficient coins available' });
                    }
                }
            }).catch((err) => {
                socket.emit('apply_greedy_game', { err: true, msg: 'something went wrong' });
            })
        });
    });
}
function applyForGreedy(userId, userName, batCoin, indexNo) {
    var applyUser = {
        userId: userId,
        userName: userName,
        batCoin: Number(batCoin),
        indexNo: Number(indexNo)
    }
    return applyUser;
}
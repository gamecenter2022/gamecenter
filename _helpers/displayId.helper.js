const appConofig = require('../_models/appConfig.model');
const gameHistory = require('../_models/gameHistory.model');
exports.genrate = (type) => {
    return new Promise((resolve, reject) => {
        appConofig.findOne({}).then((config) => {
            if (type === 'user') {
                let nextNumber = config.userSr
                appConofig.updateOne({ _id: config._id }, { $inc: { userSr: 1 } }).then((updated) => {
                    console.log('Successfully Updated.')
                }).catch((err) => { reject(err) })
                resolve(nextNumber + "")
            }
            else if (type === 'gameHistory') {
                gameHistory.findOne().sort({ createdAt: -1 }).limit(1).then((document) => {
                    if (document == null) { resolve(1) }
                    let gameSrNumber = parseInt(document.gameSrNumber) + 1;
                    resolve(gameSrNumber);
                }).catch((err) => {
                    reject(err);
                });
            }
            else if (type === 'dice') {
                let nextNumber = config.diceSrNumber
                appConofig.updateOne({ _id: config._id }, { $inc: { diceSrNumber: 1 } }).then((updated) => {
                    console.log('Successfully Updated.')
                }).catch((err) => { reject(err) })
                resolve(nextNumber + "")
            } else if (type === 'ticTacToe') {
                let nextNumber = config.ticTacToeSr
                appConofig.updateOne({ _id: config._id }, { $inc: { ticTacToeSr: 1 } }).then((updated) => {
                    console.log('Successfully Updated.')
                }).catch((err) => { reject(err) })
                resolve(nextNumber + "")
            } else if (type === 'greedy') {
                let nextNumber = config.greedySrNumber
                appConofig.updateOne({ _id: config._id }, { $inc: { greedySrNumber: 1 } }).then((updated) => {
                    console.log('Successfully Updated.')
                }).catch((err) => { reject(err) })
                resolve(nextNumber + "")
            }
            else {
                reject("Invalid type of registration can't process display id for " + type);
            }
        }).catch((err) => { reject(err) })
    });
}
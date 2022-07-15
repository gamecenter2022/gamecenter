var teenPattiScore = require("teenpattisolver");

const gameConfig = require('../_models/gameConfig.model');

exports.getWinner = () => {
    return new Promise((resolve, reject) => {
        calculation(resolve, reject);
    });
}

function calculation(resolve, reject) {
    gameConfig.findOne({}).then((configs) => {
        if (configs == null) {
            reject('No game configs found');
        } else {
            var gameLevels = ['low', 'medium', 'high'];
            var random = Math.floor(Math.random() * gameLevels.length);
            if (gameLevels[random] === 'low' && configs.lowGameCount > 0) {
                updateConfigs(resolve, reject, configs.totalGameCount, configs.lowGameCount, configs.mediumGameCount, configs.highGameCount, 'low');
            } else if (gameLevels[random] === 'medium' && configs.mediumGameCount > 0) {
                updateConfigs(resolve, reject, configs.totalGameCount, configs.lowGameCount, configs.mediumGameCount, configs.highGameCount, 'medium');
            } else if (gameLevels[random] === 'high' && configs.highGameCount > 0) {
                updateConfigs(resolve, reject, configs.totalGameCount, configs.lowGameCount, configs.mediumGameCount, configs.highGameCount, 'high');
            } else {
                if (configs.lowGameCount == 0 && configs.mediumGameCount == 0 && configs.highGameCount == 0) {
                    let updatedConfigs = {
                        lowGameCount: ((2000 * configs.lowPercentage) / 100),
                        mediumGameCount: ((2000 * configs.mediumPercentage) / 100),
                        highGameCount: ((2000 * configs.highPercentage) / 100),
                    };
                    gameConfig.updateOne({}, { $set: updatedConfigs }).then((updated) => {
                        calculation(resolve, reject);
                    }).catch((err) => {
                        console.log(err);
                        reject(err);
                    });

                } else {
                    calculation(resolve, reject);
                }
            }
        }
    }).catch((err) => {
        reject(err);
    });
}

function updateConfigs(resolve, reject, gameCount, lowGameCount, mediumGameCount, highGameCount, winnerLevelType) {
    let updatedConfigs = {
        gameCount: gameCount,
        lowGameCount: winnerLevelType === 'low' ? lowGameCount - 1 : lowGameCount,
        mediumGameCount: winnerLevelType === 'medium' ? mediumGameCount - 1 : mediumGameCount,
        highGameCount: winnerLevelType === 'high' ? highGameCount - 1 : highGameCount,
    };
    gameConfig.updateOne({}, { $set: updatedConfigs }).then((updated) => {
        getRandomCard(resolve, reject, winnerLevelType);
    }).catch((err) => {
        console.log(err);
        reject(err);
    });
}

function getRandomCard(resolve, reject, winnerLevelType) {
    const cards = [
        { card: 'Ac' }, { card: 'Ad' }, { card: 'Ah' }, { card: 'As' },
        { card: '2c' }, { card: '2d' }, { card: '2h' }, { card: '2s' },
        { card: '3c' }, { card: '3d' }, { card: '3h' }, { card: '3s' },
        { card: '4c' }, { card: '4d' }, { card: '4h' }, { card: '4s' },
        { card: '5c' }, { card: '5d' }, { card: '5h' }, { card: '5s' },
        { card: '6c' }, { card: '6d' }, { card: '6h' }, { card: '6s' },
        { card: '7c' }, { card: '7d' }, { card: '7h' }, { card: '7s' },
        { card: '8c' }, { card: '8d' }, { card: '8h' }, { card: '8s' },
        { card: '9c' }, { card: '9d' }, { card: '9h' }, { card: '9s' },
        { card: 'Tc' }, { card: 'Td' }, { card: 'Th' }, { card: 'Ts' },
        { card: 'Jc' }, { card: 'Jd' }, { card: 'Jh' }, { card: 'Js' },
        { card: 'Qc' }, { card: 'Qd' }, { card: 'Qh' }, { card: 'Qs' },
        { card: 'Kc' }, { card: 'Kd' }, { card: 'Kh' }, { card: 'Ks' }
    ];

    var nineUniqueCards = [];
    var cardCount = 0;
    while (cardCount < 9) {
        var cardName = cards[Math.floor(Math.random() * cards.length)].card;
        if (!nineUniqueCards.includes(cardName)) {
            nineUniqueCards.push(cardName);
            cardCount++
        }
    }
    sets = [];
    var set_1 = teenPattiScore.scoreHandsNormal([nineUniqueCards[0], nineUniqueCards[1], nineUniqueCards[2]]);
    var set_2 = teenPattiScore.scoreHandsNormal([nineUniqueCards[3], nineUniqueCards[4], nineUniqueCards[5]]);
    var set_3 = teenPattiScore.scoreHandsNormal([nineUniqueCards[6], nineUniqueCards[7], nineUniqueCards[8]]);

    set_1.cards = [nineUniqueCards[0], nineUniqueCards[1], nineUniqueCards[2]]
    set_2.cards = [nineUniqueCards[3], nineUniqueCards[4], nineUniqueCards[5]]
    set_3.cards = [nineUniqueCards[6], nineUniqueCards[7], nineUniqueCards[8]]

    sets.push(set_1);
    sets.push(set_2);
    sets.push(set_3);
    var winnerSet;

    if (set_1.score > set_2.score && set_1.score > set_3.score) {
        winnerSet = 1;
    } else if (set_2.score > set_3.score && set_2.score > set_1.score) {
        winnerSet = 2;
    } else {
        winnerSet = 3;
    }

    resolve({ winnerLevelType: winnerLevelType, nineCards: nineUniqueCards, winnerSet: winnerSet, sets: sets });
}


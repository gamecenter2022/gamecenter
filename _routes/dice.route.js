const dice = require('../_controllers/dice.controller');

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
        res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Acc' + 'ess-Control-Request-Method, Access-Control-Request-Headers');
        res.header('Cache-Control', 'no-cache');
        next();
    });
    app.post("/api/dice/playDiceGame", dice.playDiceGame);
    app.get("/api/dice/getAllDiceHistory", dice.getAllDiceHistory);
    app.get("/api/dice/getDiceHistoryByUserId/:userId", dice.getDiceHistoryByUserId);
    app.get("/api/dice/getDiceEarning", dice.getDiceEarning);
}
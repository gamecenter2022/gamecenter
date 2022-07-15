const spinGame = require('../_controllers/spinGame.controller');

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
        res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Acc' + 'ess-Control-Request-Method, Access-Control-Request-Headers');
        res.header('Cache-Control', 'no-cache');
        next();
    });
    app.post("/api/game/spin", spinGame.getSpinResult);
    app.post('/api/game/spin/addResultToUser', spinGame.addResultToUser);
    app.post('/api/game/spin/updateSpinGameConfig', spinGame.updateSpinGameConfig);
    app.get('/api/game/LuckyItemsOfOne/:coins', spinGame.LuckyItemsOfOne);
    app.get('/api/game/spin/getTodaySpinHistory', spinGame.getTodaySpinHistory);
    app.get('/api/game/spin/getSpinGameConfig', spinGame.getSpinGameConfig);
}
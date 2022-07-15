const ticTacToe = require('../_controllers/ticTacToe.controller');

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
        res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Acc' + 'ess-Control-Request-Method, Access-Control-Request-Headers');
        res.header('Cache-Control', 'no-cache');
        next();
    });
    app.post("/api/ticTacToe/startTicTakToe", ticTacToe.startTicTakToe);
    app.post("/api/ticTacToe/endTicTakToe", ticTacToe.endTicTakToe);
    app.get("/api/ticTacToe/getAllTicTacToe", ticTacToe.getAllTicTacToe);
    app.get("/api/ticTacToe/getTicTacToeByUser/:userId", ticTacToe.getTicTacToeByUser);
    app.get("/api/ticTacToe/TicTacToeEarning", ticTacToe.TicTacToeEarning);
}
var modules = {
    config: null,
    express: null,
    http: null,
    static: null,
};

modules.config = require('config');
modules.express = require('express');
modules.http = require('http');
modules.static = require('node-static');

var actions = {
    price: function(req, res) {
        console.log(req.query);
        return res.json({ success:true });
    },
};

var App = modules.express();
    App.use(modules.express.static(modules.config.get('dirs.public')));

App.get('/api/:version/:action', (req, res) => {
    res.header('Content-type', 'application/json');

    if(
        !req.params.version.match(/v\d+/)
        || !req.params.action.match(/^\w+$/)
    ) {
        return res.json({ success: false, error: 'Wrong action' });
    }
    var version = req.params.version.replace('v', '');
    var action = req.params.action;

    if(
        !actions.hasOwnProperty(action)
    ) {
        return res.json({ success: false, error: 'Wrong action' });
    }

    return actions[action](req, res);

});

App.get('/api/*', (req, res) => {
    res.header('Content-type', 'application/json');
    res.status(404);
    return res.json({ success: false, error: 'Wrong action' });
});

var Server = modules.http.createServer(App);
    Server.listen(modules.config.get('server.port'));

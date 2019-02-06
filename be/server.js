var modules = {
    config: null,
    express: null,
    http: null,
    static: null,
    axios: null,
    formdata: null
};

modules.config = require('config');
modules.express = require('express');
modules.http = require('http');
modules.static = require('node-static');
modules.axios = require('axios');
modules.formdata = require('form-data');

var latlngService = {
    testdata: modules.config.get('coords'),
    counter: 0,
    get: (address) => {
        return new Promise((resolve, reject) => {

            resolve(latlngService.testdata[latlngService.counter++ % latlngService.testdata.length]);
            return;

            var form = new modules.formdata();
                form.append('c1', address);
                form.append('action', 'gpcm');

            modules.axios.post(
                'https://www.latlong.net/_spm4.php',
                form,
                {
                    headers: Object.assign(
                        form.getHeaders(), 
                        { 'X-Requested-With': 'XMLHttpRequest'}
                    ),
                }
            )
                .then((response) => {
                    var coords = response.data;
                    var matches = coords.match(/^([-.\d]+),([-.\d]+)$/);
                    if(matches.length == 3)
                    {
                        lat = parseFloat(matches[1]);
                        lng = parseFloat(matches[2]);
                        resolve({
                            lat: lat,
                            lng: lng
                        });
                    }
                    else
                    {
                        reject();
                    }

                })
                .catch((error) => {
                    reject();
                });

        });
    }
};

var uberService = {
    testdata: modules.config.get('prices'),
    counter: 0,
    estimatePrice: (from, to) => {
        
        return new Promise((resolve, reject) => {
            
            resolve(uberService.testdata[uberService.counter++ % uberService.testdata.length]);
            return;

            modules.axios.get(
                'https://api.uber.com/v1.2/estimates/price',
                {
                    params: {
                        start_latitude: from.lat,
                        start_longitude: from.lng,
                        end_latitude: to.lat,
                        end_longitude: to.lng,
                    },
                    headers: {
                        'Authorization': 'Token ' + modules.config.get('uber.server_key'),
                    }
                }
            )
                .then((response) => {
                    if(response.data.prices)
                    {
                        resolve(response.data.prices);
                    }
                    else
                    {
                        reject();
                    }
                })
                .catch((error) => {
                    reject();
                });

        });
    }
};

var actions = {
    price: function(req, res) {
        
        var from = req.query.from;
        var to = req.query.to;
        
        latlngService.get(from)
            .then((coords) => {
                var start = coords;

                latlngService.get(to)
                    .then((coords) => {

                        var end = coords;

                        uberService.estimatePrice(start, end)
                            .then((prices) => {
                                res.json({ success:true, prices: prices });
                            })
                            .catch((error) => {
                                res.json({ success:false });
                            });

                    })
                    .catch((error) => {
                        res.json({ success:false });
                    });

            })
            .catch((error) => {
                res.json({ success:false });
            });
        
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

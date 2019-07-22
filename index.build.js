'use strict';

var getGeysers = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(refresh || !geysers)) {
                            _context.next = 5;
                            break;
                        }

                        console.log("Load");
                        _context.next = 4;
                        return (0, _nodeFetch2.default)(BASE_URL + '/geysers').then(function (res) {
                            return res.json();
                        }).then(function (json) {
                            return json.geysers || [];
                        });

                    case 4:
                        geysers = _context.sent;

                    case 5:
                        return _context.abrupt('return', geysers);

                    case 6:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getGeysers() {
        return _ref.apply(this, arguments);
    };
}();

var getGeyserByID = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(id) {
        var match;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return getGeysers();

                    case 2:
                        geysers = _context2.sent;
                        match = geysers.find(function (geyser) {
                            return geyser['id'] == id;
                        });

                        if (!match) {
                            _context2.next = 6;
                            break;
                        }

                        return _context2.abrupt('return', match);

                    case 6:
                        _context2.next = 8;
                        return getGeysers(true);

                    case 8:
                        geysers = _context2.sent;
                        return _context2.abrupt('return', geysers.find(function (geyser) {
                            return geyser['id'] == id;
                        }));

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getGeyserByID(_x2) {
        return _ref2.apply(this, arguments);
    };
}();

var _dataloader = require('dataloader');

var _dataloader2 = _interopRequireDefault(_dataloader);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _expressGraphql = require('express-graphql');

var _expressGraphql2 = _interopRequireDefault(_expressGraphql);

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var BASE_URL = 'https://www.geysertimes.org/api/v5';

var geysers = void 0;

function getEruptionByURL(relativeURL) {
    return (0, _nodeFetch2.default)('' + BASE_URL + relativeURL).then(function (res) {
        return res.json();
    }).then(function (json) {
        return json.entries.length ? json.entries[0] : null;
    });
}

function getPredictionByURL(relativeURL) {
    return (0, _nodeFetch2.default)('' + BASE_URL + relativeURL).then(function (res) {
        return res.json();
    }).then(function (json) {
        return json.predictions.length ? json.predictions[0] : null;
    });
}

var app = (0, _express2.default)();

app.use((0, _expressGraphql2.default)(function (req) {
    var geyserLoader = new _dataloader2.default(function (keys) {
        return Promise.all(keys.map(getGeyserByID));
    });
    var predictionLoader = new _dataloader2.default(function (keys) {
        return Promise.all(keys.map(getPredictionByURL));
    });

    var eruptionLoader = new _dataloader2.default(function (keys) {
        return Promise.all(keys.map(getEruptionByURL));
    });

    var loaders = {
        geyser: geyserLoader,
        prediction: predictionLoader,
        eruption: eruptionLoader
    };
    return {
        context: { loaders: loaders },
        schema: _schema2.default,
        graphiql: true
    };
}));

app.listen(5000);

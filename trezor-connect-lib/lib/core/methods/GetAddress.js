"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _pathUtils = require("../../utils/pathUtils");

var _CoinInfo = require("../../data/CoinInfo");

var _errors = require("../../constants/errors");

var _lodash = require("lodash");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _builder = require("../../message/builder");

var GetAddress =
/*#__PURE__*/
function (_AbstractMethod) {
  (0, _inheritsLoose2.default)(GetAddress, _AbstractMethod);

  function GetAddress(message) {
    var _this;

    _this = _AbstractMethod.call(this, message) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "confirmed", false);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "progress", 0);
    _this.requiredPermissions = ['read']; // create a bundle with only one batch if bundle doesn't exists

    var payload = !message.payload.hasOwnProperty('bundle') ? (0, _objectSpread2.default)({}, message.payload, {
      bundle: [].concat(message.payload)
    }) : message.payload; // validate bundle type

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'bundle',
      type: 'array'
    }, {
      name: 'useEventListener',
      type: 'boolean'
    }]);
    var bundle = [];
    payload.bundle.forEach(function (batch) {
      // validate incoming parameters for each batch
      (0, _paramsValidator.validateParams)(batch, [{
        name: 'path',
        obligatory: true
      }, {
        name: 'coin',
        type: 'string'
      }, {
        name: 'address',
        type: 'string'
      }, {
        name: 'showOnTrezor',
        type: 'boolean'
      }]);
      var path = (0, _pathUtils.validatePath)(batch.path, 3);
      var coinInfo;

      if (batch.coin) {
        coinInfo = (0, _CoinInfo.getBitcoinNetwork)(batch.coin);
      }

      if (coinInfo && !batch.crossChain) {
        (0, _paramsValidator.validateCoinPath)(coinInfo, path);
      } else if (!coinInfo) {
        coinInfo = (0, _CoinInfo.getBitcoinNetwork)(path);
      }

      var showOnTrezor = true;

      if (batch.hasOwnProperty('showOnTrezor')) {
        showOnTrezor = batch.showOnTrezor;
      }

      if (!coinInfo) {
        throw _errors.NO_COIN_INFO;
      } else if (coinInfo) {
        // set required firmware from coinInfo support
        _this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(_this.name, coinInfo, _this.firmwareRange);
      } // fix coinInfo network values (segwit/legacy)


      coinInfo = (0, _CoinInfo.fixCoinInfoNetwork)(coinInfo, path);
      bundle.push({
        path: path,
        address: batch.address,
        coinInfo: coinInfo,
        showOnTrezor: showOnTrezor
      });
    });
    var useEventListener = payload.useEventListener && bundle.length === 1 && typeof bundle[0].address === 'string' && bundle[0].showOnTrezor;
    _this.confirmed = useEventListener;
    _this.useUi = !useEventListener; // set info

    if (bundle.length === 1) {
      _this.info = (0, _pathUtils.getLabel)('Export #NETWORK address', bundle[0].coinInfo);
    } else {
      var requestedNetworks = bundle.map(function (b) {
        return b.coinInfo;
      });
      var uniqNetworks = (0, _lodash.uniqBy)(requestedNetworks, function (ci) {
        return ci ? ci.shortcut : null;
      });

      if (uniqNetworks.length === 1 && uniqNetworks[0]) {
        _this.info = (0, _pathUtils.getLabel)('Export multiple #NETWORK addresses', uniqNetworks[0]);
      } else {
        _this.info = 'Export multiple addresses';
      }
    }

    _this.params = bundle;
    return _this;
  }

  var _proto = GetAddress.prototype;

  _proto.getButtonRequestData = function getButtonRequestData(code) {
    if (code === 'ButtonRequest_Address') {
      var data = {
        type: 'address',
        serializedPath: (0, _pathUtils.getSerializedPath)(this.params[this.progress].path),
        address: this.params[this.progress].address || 'not-set'
      };
      return data;
    }

    return null;
  };

  _proto.confirmation =
  /*#__PURE__*/
  function () {
    var _confirmation = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee() {
      var uiPromise, label, uiResp;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!this.confirmed) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", true);

            case 2:
              _context.next = 4;
              return this.getPopupPromise().promise;

            case 4:
              // initialize user response promise
              uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);
              label = this.info; // request confirmation view

              this.postMessage(new _builder.UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'export-address',
                label: label
              })); // wait for user action

              _context.next = 9;
              return uiPromise.promise;

            case 9:
              uiResp = _context.sent;
              this.confirmed = uiResp.payload;
              return _context.abrupt("return", this.confirmed);

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function confirmation() {
      return _confirmation.apply(this, arguments);
    }

    return confirmation;
  }();

  _proto.noBackupConfirmation =
  /*#__PURE__*/
  function () {
    var _noBackupConfirmation = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee2() {
      var uiPromise, uiResp;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.getPopupPromise().promise;

            case 2:
              // initialize user response promise
              uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device); // request confirmation view

              this.postMessage(new _builder.UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'no-backup'
              })); // wait for user action

              _context2.next = 6;
              return uiPromise.promise;

            case 6:
              uiResp = _context2.sent;
              return _context2.abrupt("return", uiResp.payload);

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function noBackupConfirmation() {
      return _noBackupConfirmation.apply(this, arguments);
    }

    return noBackupConfirmation;
  }();

  _proto.run =
  /*#__PURE__*/
  function () {
    var _run = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee3() {
      var responses, bundledResponse, i, batch, silent, response;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              responses = [];
              bundledResponse = this.params.length > 1;
              i = 0;

            case 3:
              if (!(i < this.params.length)) {
                _context3.next = 24;
                break;
              }

              batch = this.params[i]; // silently get address and compare with requested address
              // or display as default inside popup

              if (!batch.showOnTrezor) {
                _context3.next = 15;
                break;
              }

              _context3.next = 8;
              return this.device.getCommands().getAddress(batch.path, batch.coinInfo, false);

            case 8:
              silent = _context3.sent;

              if (!(typeof batch.address === 'string')) {
                _context3.next = 14;
                break;
              }

              if (!(batch.address !== silent.address)) {
                _context3.next = 12;
                break;
              }

              throw new Error('Addresses do not match');

            case 12:
              _context3.next = 15;
              break;

            case 14:
              batch.address = silent.address;

            case 15:
              _context3.next = 17;
              return this.device.getCommands().getAddress(batch.path, batch.coinInfo, batch.showOnTrezor);

            case 17:
              response = _context3.sent;
              responses.push(response);

              if (bundledResponse) {
                // send progress
                this.postMessage(new _builder.UiMessage(UI.BUNDLE_PROGRESS, {
                  progress: i,
                  response: response
                }));
              }

              this.progress++;

            case 21:
              i++;
              _context3.next = 3;
              break;

            case 24:
              return _context3.abrupt("return", bundledResponse ? responses : responses[0]);

            case 25:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return GetAddress;
}(_AbstractMethod2.default);

exports.default = GetAddress;
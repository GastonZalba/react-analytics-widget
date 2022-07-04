"use strict";

exports.__esModule = true;
exports.GoogleProvider = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// dont wait for auth twice, even after unmounts
var isLoaded = false; // Save the button for later. Workaround for API limitation that render
// the auth button only once per page load.

var authButton = null; // wait for auth and refeshed token (if needed) to display children

var GoogleProvider = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(GoogleProvider, _React$Component);

  function GoogleProvider() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "state", {
      ready: false,
      needsNewToken: false
    });

    return _this;
  }

  var _proto = GoogleProvider.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this.init();
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    gapi.analytics.auth.off();
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    // The token may have to be refreshed because the parent element changed its state (by an interval?),
    // or because this component was remounted.
    if (this.state.ready && (prevProps.accessToken !== this.props.accessToken || this.state.needsNewToken)) {
      gapi.auth.setToken({
        access_token: this.props.accessToken
      });
      this.setState({
        needsNewToken: false
      });
    }
  };

  _proto.init = function init() {
    var _this2 = this;

    var doAuth = function doAuth() {
      var authObj = _this2.props.accessToken ? {
        serverAuth: {
          access_token: _this2.props.accessToken
        }
      } : {
        clientid: _this2.props.clientId
      };
      gapi.analytics.auth && gapi.analytics.auth.authorize(_extends({
        userInfoLabel: _this2.props.userInfoLabel
      }, authObj, {
        container: _this2.authButtonNode
      }));
      gapi.analytics.auth.once('needsAuthorization', function () {
        // Api limitation render the button once per page load
        // So we store it for later
        authButton = _this2.authButtonNode;
      });
      gapi.analytics.auth.once('error', function (err) {
        console.error(err);
      });
    };

    var addRealTimeSupport = function addRealTimeSupport() {
      /**
       * This code is an adaptation from one made by Google, available here:
       * https://ga-dev-tools.appspot.com/public/javascript/embed-api/components/active-users.js"
       * 
       * This version has:
       * - dynamic support for metrics (not just "rt:activeUsers") than can be passed as an argument
       * - support for dimensions 
       * - error handling (previously non-existent) performed according to the official documentation,
       * with an exponential backoff before retry subsequent requests.
       * 
       */
      gapi.analytics.createComponent('RealTime', {
        initialize: function initialize() {
          this.realTime = {
            rows: []
          };
          gapi.analytics.auth.once('signOut', this.handleSignOut_.bind(this));
        },
        execute: function execute() {
          // Stop any polling currently going on.
          if (this.polling_) {
            this.stop();
            this.forcePause_ = false;
          } // Wait until the user is authorized.


          if (gapi.analytics.auth.isAuthorized()) {
            this.pollrealTime_();
          } else {
            gapi.analytics.auth.once('signIn', this.pollrealTime_.bind(this));
          }
        },
        stop: function stop(silent) {
          if (silent === void 0) {
            silent = false;
          }

          clearTimeout(this.timeout_);
          this.polling_ = false;

          if (!silent) {
            this.emit('stop', {
              realTime: this.realTime
            });
          }
        },
        pause: function pause() {
          this.forcePause_ = true;
        },
        pollrealTime_: function () {
          var _pollrealTime_ = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
            var options, pollingInterval, sleep, retryExpErrors, retryOnceErrors, errorBody, i, result, _errorBody, error, errors, retryExp, random_number_ms, wait;

            return _regenerator["default"].wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    options = this.get();
                    pollingInterval = (options.pollingInterval || 5) * 1000;

                    sleep = function sleep(ms) {
                      return new Promise(function (resolve) {
                        return setTimeout(resolve, ms);
                      });
                    };

                    if (!(isNaN(pollingInterval) || pollingInterval < 5000)) {
                      _context.next = 5;
                      break;
                    }

                    throw new Error('Frequency must be 5 seconds or more.');

                  case 5:
                    this.polling_ = true; // https://developers.google.com/analytics/devguides/reporting/realtime/v3/errors#error_table
                    // List of errors that are retry-able waiting exponentially

                    retryExpErrors = ['userRateLimitExceeded', 'rateLimitExceeded', 'quotaExceeded']; // List of errors that are retry-able only once

                    retryOnceErrors = ['internalServerError', 'backendError'];
                    this.retryOnce_ = null; // If any error occurs in the makeRequest_ method,
                    // the request is retried using an exponential backoff.
                    // https://developers.google.com/analytics/devguides/reporting/realtime/v3/errors#backoff

                    i = 0;

                  case 10:
                    if (!(i < 5)) {
                      _context.next = 45;
                      break;
                    }

                    _context.prev = 11;
                    _context.next = 14;
                    return this.makeRequest_(options, pollingInterval);

                  case 14:
                    result = _context.sent;

                    // If the values ​​changed
                    if (JSON.stringify(this.realTime.rows) !== JSON.stringify(result.rows)) {
                      this.onChange_({
                        realTime: result
                      });
                    }

                    this.onSuccess_({
                      realTime: result
                    });
                    this.forcePause_ = false;
                    this.realTime = result;
                    return _context.abrupt("return");

                  case 22:
                    _context.prev = 22;
                    _context.t0 = _context["catch"](11);

                    if (_context.t0.hasOwnProperty('body')) {
                      _context.next = 27;
                      break;
                    }

                    this.stop();
                    return _context.abrupt("return", this.onError_({
                      error: _context.t0
                    }));

                  case 27:
                    // If an error happen, pause automatic interval pulling
                    this.forcePause_ = true;
                    errorBody = JSON.parse(_context.t0.body);
                    _errorBody = errorBody, error = _errorBody.error;
                    errors = error.errors; // Check if the request must be retried (waiting exponentially)

                    retryExp = errors.some(function (_ref) {
                      var reason = _ref.reason;
                      return retryExpErrors.includes(reason);
                    });

                    if (retryExp) {
                      _context.next = 36;
                      break;
                    }

                    // Check if the request must be retried (only once)
                    this.retryOnce_ = errors.some(function (_ref2) {
                      var reason = _ref2.reason;
                      return retryOnceErrors.includes(reason);
                    });

                    if (this.retryOnce_) {
                      _context.next = 36;
                      break;
                    }

                    return _context.abrupt("break", 45);

                  case 36:
                    if (!(this.retryOnce_ && i > 1)) {
                      _context.next = 38;
                      break;
                    }

                    return _context.abrupt("break", 45);

                  case 38:
                    // random_number_ms is a random number of milliseconds less than or equal to 1000.
                    // This is necessary to avoid certain lock errors in some concurrent implementations.
                    random_number_ms = ~~(Math.random() * 1000); // Exponential wait in milliseconds

                    wait = Math.pow(2, i) * 1000;
                    _context.next = 42;
                    return sleep(Math.round(wait + random_number_ms));

                  case 42:
                    i++;
                    _context.next = 10;
                    break;

                  case 45:
                    this.stop();
                    this.onError_(errorBody);

                  case 47:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this, [[11, 22]]);
          }));

          function pollrealTime_() {
            return _pollrealTime_.apply(this, arguments);
          }

          return pollrealTime_;
        }(),

        /**
         * The makeRequest_ method makes API requests and emits
         * the response.
         */
        makeRequest_: function makeRequest_(options, pollingInterval) {
          var _this3 = this;

          return new Promise(function (resolve, reject) {
            gapi.client.analytics.data.realtime.get({
              ids: options.ids,
              metrics: options.query.metrics,
              dimensions: options.query.dimensions
            }).then(function (response) {
              // If everything is ok, reinitialize
              if (_this3.polling_ && !_this3.forcePause_) {
                _this3.timeout_ = setTimeout(_this3.pollrealTime_.bind(_this3), pollingInterval);
              }

              resolve(response.result);
            })["catch"](function (err) {
              reject(err);
            });
          });
        },
        onSuccess_: function onSuccess_(data) {
          this.emit('success', data);
        },
        onChange_: function onChange_(data) {
          this.emit('change', data);
        },
        onError_: function onError_(err) {
          this.emit('error', err);
        },
        handleSignOut_: function handleSignOut_() {
          this.stop();
          gapi.analytics.auth.once('signIn', this.handleSignIn_.bind(this));
        },
        handleSignIn_: function handleSignIn_() {
          this.pollrealTime_();
          gapi.analytics.auth.once('signOut', this.handleSignOut_.bind(this));
        }
      });
    };

    gapi.analytics.ready(function () {
      // If the library is loaded (and was unmounted), so refesh the token 
      if (isLoaded) {
        if (_this2.props.accessToken) {
          _this2.setState({
            needsNewToken: true
          });
        } // If exists, append the stored auth button


        if (authButton && !_this2.state.ready) {
          _this2.authButtonNode.appendChild(authButton);
        }
      } else {
        // Run this only once, even is unmounted
        addRealTimeSupport();
        doAuth();
      }

      var isAuthorized = gapi.analytics.auth.isAuthorized();

      if (isAuthorized) {
        _this2.setState({
          ready: true
        });
      } else {
        gapi.analytics.auth.on("signIn", function (_) {
          _this2.setState({
            ready: true
          });
        });
      }

      isLoaded = true;
    });
  };

  _proto.render = function render() {
    var _this4 = this;

    return /*#__PURE__*/_react["default"].createElement("div", null, this.props.clientId && /*#__PURE__*/_react["default"].createElement("div", {
      ref: function ref(node) {
        return _this4.authButtonNode = node;
      }
    }), this.state.ready && !this.state.needsNewToken && this.props.children);
  };

  return GoogleProvider;
}(_react["default"].Component);

exports.GoogleProvider = GoogleProvider;
GoogleProvider.propTypes = process.env.NODE_ENV !== "production" ? {
  clientId: _propTypes["default"].string,
  accessToken: _propTypes["default"].string
} : {};
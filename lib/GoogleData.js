"use strict";

exports.__esModule = true;
exports.GoogleDataChart = exports.GoogleDataRT = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DEFAULT_LOADING = /*#__PURE__*/_react["default"].createElement("div", {
  className: "widgetAnalytics_loaderSpinner"
});

var DEFAULT_ERROR = /*#__PURE__*/_react["default"].createElement("div", {
  className: "widgetAnalytics_errorCircle"
}, /*#__PURE__*/_react["default"].createElement("div", null, "X"));

var DEFAULT_CHART = {
  type: "LINE",
  options: {
    width: '100%'
  }
}; // real time data

var GoogleDataRT = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(GoogleDataRT, _React$Component);

  function GoogleDataRT() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "state", {
      isError: false,
      isLoading: true,
      visualization: null,
      deltaClass: null
    });

    _defineProperty(_assertThisInitialized(_this), "pausePolling", _this.pausePolling.bind(_assertThisInitialized(_this)));

    _defineProperty(_assertThisInitialized(_this), "resumePolling", _this.resumePolling.bind(_assertThisInitialized(_this)));

    _defineProperty(_assertThisInitialized(_this), "stopPolling", _this.stopPolling.bind(_assertThisInitialized(_this)));

    _defineProperty(_assertThisInitialized(_this), "loadData", function () {
      var config = _extends({}, _this.props.config);

      _this.realTime = new gapi.analytics.ext.RealTime(config).on('success', function () {
        _this.setState({
          isLoading: false,
          isError: false
        });
      }).on('change', function (_ref) {
        var realTime = _ref.realTime;

        var visualization = _this.dataToVisualization(realTime);

        var value = realTime.totalResults ? +realTime.rows[0][0] : 0;
        var deltaClass; // Check if the response has multiples columns or only one

        if (realTime.columnHeaders.length === 1) {
          var delta = value - (_this.lastValue | 0); // Add CSS animation to visually show the when the counter goes up and down

          deltaClass = delta > 0 ? "widgetAnalytics_isIncreasing" : "widgetAnalytics_isDecreasing";
          var timeout;
          clearTimeout(timeout);
          timeout = setTimeout(function () {
            _this.setState({
              deltaClass: null
            });
          }, 4800);
          _this.lastValue = value;
        }

        _this.setState({
          visualization: visualization,
          deltaClass: deltaClass
        });
      }).on('error', /*#__PURE__*/function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref2) {
          var error;
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  error = _ref2.error;

                  _this.setState({
                    isError: error.message,
                    isLoading: false
                  });

                case 2:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref3.apply(this, arguments);
        };
      }());

      _this.updateView();

      window.addEventListener('blur', _this.pausePolling, false);
      window.addEventListener('focus', _this.resumePolling, false);
    });

    _defineProperty(_assertThisInitialized(_this), "updateView", function () {
      _this.setState({
        isError: false,
        isLoading: true
      });

      _this.realTime.set(_this.props.views.query).execute();
    });

    _defineProperty(_assertThisInitialized(_this), "dataToVisualization", function (realTimeData) {
      // Check if the customOutput prop exists
      if (_this.props.customOutput) {
        return _this.props.customOutput(realTimeData, _this.RTNode);
      } // Simple result


      if (realTimeData.columnHeaders.length === 1) {
        var count = realTimeData.totalResults ? +realTimeData.rows[0][0] : 0 + 0;
        return /*#__PURE__*/_react["default"].createElement("span", {
          className: "widgetAnalytics_realTimeValueNumber"
        }, count, /*#__PURE__*/_react["default"].createElement("span", {
          className: "widgetAnalytics_arrow"
        })); // Complex result
      } else {
        return /*#__PURE__*/_react["default"].createElement("table", {
          className: "widgetAnalytics_realTimeTable"
        }, /*#__PURE__*/_react["default"].createElement("tbody", null, /*#__PURE__*/_react["default"].createElement("tr", null, // Get the headers
        realTimeData.columnHeaders.map(function (column, key) {
          var columnName = column.name.replace('rt:', '');
          columnName = columnName.charAt(0).toUpperCase() + columnName.slice(1);
          columnName = columnName.replace(/([A-Z])/g, ' $1').trim();
          return /*#__PURE__*/_react["default"].createElement("th", {
            key: key
          }, columnName);
        })), // If no results
        !realTimeData.totalResults ?
        /*#__PURE__*/
        // Show default empty value
        _react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("td", null, "-"), /*#__PURE__*/_react["default"].createElement("td", null, "-")) : // Otherwise, loop between results
        realTimeData.rows.map(function (row, key) {
          return /*#__PURE__*/_react["default"].createElement("tr", {
            key: key
          }, row.map(function (cell, key2) {
            return /*#__PURE__*/_react["default"].createElement("td", {
              key: key + ' ' + key2
            }, cell);
          }));
        })));
      }
    });

    return _this;
  }

  var _proto = GoogleDataRT.prototype;

  _proto.pausePolling = function pausePolling() {
    this.realTime.pause();
  };

  _proto.stopPolling = function stopPolling() {
    this.realTime.stop();
  };

  _proto.resumePolling = function resumePolling() {
    if (this.realTime.polling_) {
      this.realTime.execute();
    }
  };

  _proto.componentDidMount = function componentDidMount() {
    this.loadData();
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    // Prevent double execution on load
    if (JSON.stringify(this.props.views) !== JSON.stringify(prevProps.views)) {
      this.updateView();
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.realTime.off();
    this.realTime.stop();
    window.removeEventListener('blur', this.pausePolling, false);
    window.removeEventListener('focus', this.resumePolling, false);
  };

  _proto.render = function render() {
    var _this2 = this;

    var classes = ["widgetAnalytics_widget", "widgetAnalytics_widgetRealTime"];
    if (this.state.isError) classes.push("widgetAnalytics_onError");
    if (this.state.isLoading) classes.push("widgetAnalytics_onLoading");
    if (this.props.className) classes.push(this.props.className);
    if (this.state.deltaClass) classes.push(this.state.deltaClass);
    return /*#__PURE__*/_react["default"].createElement("div", {
      className: classes.join(' '),
      style: _extends({}, this.props.style, {
        position: 'relative'
      })
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "widgetAnalytics_widgetRealTimeContainer",
      ref: function ref(node) {
        return _this2.RTNode = node;
      }
    }, this.props.config.options && this.props.config.options.title && /*#__PURE__*/_react["default"].createElement("div", {
      className: "widgetAnalytics_realTimeTitle"
    }, this.props.config.options.title), /*#__PURE__*/_react["default"].createElement("div", {
      className: "widgetAnalytics_realTimeValue"
    }, this.state.visualization)), this.state.isLoading && /*#__PURE__*/_react["default"].createElement("div", {
      className: "widgetAnalytics_loader"
    }, this.props.loader !== undefined ? this.props.loader : DEFAULT_LOADING), this.state.isError && /*#__PURE__*/_react["default"].createElement("div", {
      title: this.props.errors ? this.state.isError : '',
      className: "widgetAnalytics_errorContainer"
    }, this.props.errors && /*#__PURE__*/_react["default"].createElement("div", {
      className: "widgetAnalytics_errorMsg"
    }, this.state.isError), DEFAULT_ERROR));
  };

  return GoogleDataRT;
}(_react["default"].Component); // single chart


exports.GoogleDataRT = GoogleDataRT;

var GoogleDataChart = /*#__PURE__*/function (_React$Component2) {
  _inheritsLoose(GoogleDataChart, _React$Component2);

  function GoogleDataChart() {
    var _this3;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this3 = _React$Component2.call.apply(_React$Component2, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this3), "state", {
      isLoading: true,
      isError: null
    });

    _defineProperty(_assertThisInitialized(_this3), "refreshChart", _this3.refreshChart.bind(_assertThisInitialized(_this3)));

    _defineProperty(_assertThisInitialized(_this3), "loadChart", function () {
      var config = _extends({}, _this3.props.config, {
        chart: _extends({}, DEFAULT_CHART, _this3.props.config.chart, {
          container: _this3.chartNode
        })
      });

      _this3.chart = new gapi.analytics.googleCharts.DataChart(config).on('success', function () {
        _this3.setState({
          isError: false,
          isLoading: false
        });
      }).on('error', /*#__PURE__*/function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref4) {
          var error;
          return _regenerator["default"].wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  error = _ref4.error;

                  _this3.setState({
                    isError: error.message,
                    isLoading: false
                  });

                case 2:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        return function (_x2) {
          return _ref5.apply(this, arguments);
        };
      }()); // Responsive Google Charts

      window.addEventListener('resize', _this3.refreshChart);

      _this3.updateView();
    });

    _defineProperty(_assertThisInitialized(_this3), "updateView", function () {
      _this3.setState({
        isError: false,
        isLoading: true
      });

      _this3.chart.set(_this3.props.views).execute();
    });

    return _this3;
  }

  var _proto2 = GoogleDataChart.prototype;

  _proto2.refreshChart = function refreshChart() {
    var _this4 = this;

    if (this.res) {
      clearTimeout(this.res);
    }

    ; // Timeout to prevent multiples fires

    this.res = setTimeout(function () {
      _this4.chart.execute();
    }, 100);
  };

  _proto2.componentDidMount = function componentDidMount() {
    this.loadChart();
  };

  _proto2.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.props.views) !== JSON.stringify(prevProps.views)) {
      this.updateView();

      if (!prevState.isLoading) {
        var height = this.chartNode.clientHeight;
        this.chartNode.style.height = height + 'px';
      } else if (!this.state.isLoading) {
        this.chartNode.style.height = '';
      }
    }
  };

  _proto2.componentWillUnmount = function componentWillUnmount() {
    this.chart.off();
    window.removeEventListener('resize', this.refreshChart);
  };

  _proto2.render = function render() {
    var _this5 = this;

    var classes = ["widgetAnalytics_widget", "widgetAnalytics_widgetChart"];
    if (this.state.isError) classes.push("widgetAnalytics_onError");
    if (this.state.isLoading) classes.push("widgetAnalytics_onLoading");
    if (this.props.className) classes.push(this.props.className);
    return /*#__PURE__*/_react["default"].createElement("div", {
      style: _extends({}, this.props.style, {
        position: 'relative'
      }),
      className: classes.join(' ')
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "widgetAnalytics_widgetChartContainer",
      ref: function ref(node) {
        return _this5.chartNode = node;
      }
    }), this.state.isLoading && /*#__PURE__*/_react["default"].createElement("div", {
      className: "widgetAnalytics_loader"
    }, this.props.loader !== undefined ? this.props.loader : DEFAULT_LOADING), this.state.isError && /*#__PURE__*/_react["default"].createElement("div", {
      title: this.props.errors ? this.state.isError : '',
      className: "widgetAnalytics_errorContainer"
    }, this.props.errors && /*#__PURE__*/_react["default"].createElement("div", {
      className: "widgetAnalytics_errorMsg"
    }, this.state.isError), DEFAULT_ERROR));
  };

  return GoogleDataChart;
}(_react["default"].Component);

exports.GoogleDataChart = GoogleDataChart;
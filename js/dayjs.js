(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.dayjs = factory());
}(this, (function () { 'use strict';

  var SECONDS_A_MINUTE = 60;
  var SECONDS_A_HOUR = SECONDS_A_MINUTE * 60;
  var SECONDS_A_DAY = SECONDS_A_HOUR * 24;
  var SECONDS_A_WEEK = SECONDS_A_DAY * 7;
  var MILLISECONDS_A_SECOND = 1e3;
  var MILLISECONDS_A_MINUTE = SECONDS_A_MINUTE * MILLISECONDS_A_SECOND;
  var MILLISECONDS_A_HOUR = SECONDS_A_HOUR * MILLISECONDS_A_SECOND;
  var MILLISECONDS_A_DAY = SECONDS_A_DAY * MILLISECONDS_A_SECOND;
  var MILLISECONDS_A_WEEK = SECONDS_A_WEEK * MILLISECONDS_A_SECOND; // English locales

  var MS = 'millisecond';
  var S = 'second';
  var MIN = 'minute';
  var H = 'hour';
  var D = 'day';
  var W = 'week';
  var M = 'month';
  var Q = 'quarter';
  var Y = 'year';
  var DATE = 'date';
  var FORMAT_DEFAULT = 'YYYY-MM-DDTHH:mm:ssZ'; // regex

  var REGEX_PARSE = /^(\d{4})-?(\d{1,2})-?(\d{0,2})(.*?(\d{1,2}):(\d{1,2}):(\d{1,2}))?.?(\d{1,3})?$/;
  var REGEX_FORMAT = /\[.*?\]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
  var en = {
    name: 'en',
    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_')
  };

  var padStart = function padStart(string, length, pad) {
    var s = String(string);
    if (!s || s.length >= length) return string;
    return "" + Array(length + 1 - s.length).join(pad) + string;
  };

  var padZoneStr = function padZoneStr(negMinuts) {
    var minutes = Math.abs(negMinuts);
    var hourOffset = Math.floor(minutes / 60);
    var minuteOffset = minutes % 60;
    return "" + (negMinuts <= 0 ? '+' : '-') + padStart(hourOffset, 2, '0') + ":" + padStart(minuteOffset, 2, '0');
  };

  var monthDiff = function monthDiff(a, b) {
    // function from moment.js in order to keep the same result
    var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month());
    var anchor = a.clone().add(wholeMonthDiff, 'months');
    var c = b - anchor < 0;
    var anchor2 = a.clone().add(wholeMonthDiff + (c ? -1 : 1), 'months');
    return Number(-(wholeMonthDiff + (b - anchor) / (c ? anchor - anchor2 : anchor2 - anchor)));
  };

  var absFloor = function absFloor(n) {
    return n < 0 ? Math.ceil(n) || 0 : Math.floor(n);
  };

  var prettyUnit = function prettyUnit(u) {
    var special = {
      M: M,
      y: Y,
      w: W,
      d: D,
      h: H,
      m: MIN,
      s: S,
      ms: MS
    };
    return special[u] || String(u || '').toLowerCase().replace(/s$/, '');
  };

  var isUndefined = function isUndefined(s) {
    return s === undefined;
  };

  var U = {
    padStart: padStart,
    padZoneStr: padZoneStr,
    monthDiff: monthDiff,
    absFloor: absFloor,
    prettyUnit: prettyUnit,
    isUndefined: isUndefined
  };

  var L = 'en'; // global locale

  var Ls = {}; // global loaded locale

  Ls[L] = en;

  var isDayjs = function isDayjs(d) {
    return d instanceof Dayjs;
  }; // eslint-disable-line no-use-before-define


  var parseLocale = function parseLocale(preset, object, isLocal) {
    var l;
    if (!preset) return null;

    if (typeof preset === 'string') {
      if (Ls[preset]) {
        l = preset;
      }

      if (object) {
        Ls[preset] = object;
        l = preset;
      }
    } else {
      var name = preset.name;
      Ls[name] = preset;
      l = name;
    }

    if (!isLocal) L = l;
    return l;
  };

  var dayjs = function dayjs(date, c) {
    if (isDayjs(date)) {
      return date.clone();
    }

    var cfg = c || {};
    cfg.date = date;
    return new Dayjs(cfg); // eslint-disable-line no-use-before-define
  };

  var wrapper = function wrapper(date, instance) {
    return dayjs(date, {
      locale: instance.$L
    });
  };

  var Utils = U; // for plugin use

  Utils.parseLocale = parseLocale;
  Utils.isDayjs = isDayjs;
  Utils.wrapper = wrapper;

  var parseDate = function parseDate(date) {
    var reg;
    if (date === null) return new Date(NaN); // Treat null as an invalid date

    if (Utils.isUndefined(date)) return new Date();
    if (date instanceof Date) return date; // eslint-disable-next-line no-cond-assign

    if (typeof date === 'string' && /.*[^Z]$/i.test(date) // looking for a better way
    && (reg = date.match(REGEX_PARSE))) {
      // 2018-08-08 or 20180808
      return new Date(reg[1], reg[2] - 1, reg[3] || 1, reg[5] || 0, reg[6] || 0, reg[7] || 0, reg[8] || 0);
    }

    return new Date(date); // timestamp
  };

  var Dayjs =
  /*#__PURE__*/
  function () {
    function Dayjs(cfg) {
      this.parse(cfg); // for plugin
    }

    var _proto = Dayjs.prototype;

    _proto.parse = function parse(cfg) {
      this.$d = parseDate(cfg.date);
      this.init(cfg);
    };

    _proto.init = function init(cfg) {
      this.$y = this.$d.getFullYear();
      this.$M = this.$d.getMonth();
      this.$D = this.$d.getDate();
      this.$W = this.$d.getDay();
      this.$H = this.$d.getHours();
      this.$m = this.$d.getMinutes();
      this.$s = this.$d.getSeconds();
      this.$ms = this.$d.getMilliseconds();
      this.$L = this.$L || parseLocale(cfg.locale, null, true) || L;
    }; // eslint-disable-next-line class-methods-use-this


    _proto.$utils = function $utils() {
      return Utils;
    };

    _proto.isValid = function isValid() {
      return !(this.$d.toString() === 'Invalid Date');
    };

    _proto.$compare = function $compare(that) {
      return this.valueOf() - dayjs(that).valueOf();
    };

    _proto.isSame = function isSame(that) {
      return this.$compare(that) === 0;
    };

    _proto.isBefore = function isBefore(that) {
      return this.$compare(that) < 0;
    };

    _proto.isAfter = function isAfter(that) {
      return this.$compare(that) > 0;
    };

    _proto.year = function year() {
      return this.$y;
    };

    _proto.month = function month() {
      return this.$M;
    };

    _proto.day = function day() {
      return this.$W;
    };

    _proto.date = function date() {
      return this.$D;
    };

    _proto.hour = function hour() {
      return this.$H;
    };

    _proto.minute = function minute() {
      return this.$m;
    };

    _proto.second = function second() {
      return this.$s;
    };

    _proto.millisecond = function millisecond() {
      return this.$ms;
    };

    _proto.unix = function unix() {
      return Math.floor(this.valueOf() / 1000);
    };

    _proto.valueOf = function valueOf() {
      // timezone(hour) * 60 * 60 * 1000 => ms
      return this.$d.getTime();
    };

    _proto.startOf = function startOf(units, _startOf) {
      var _this = this;

      // startOf -> endOf
      var isStartOf = !Utils.isUndefined(_startOf) ? _startOf : true;
      var unit = Utils.prettyUnit(units);

      var instanceFactory = function instanceFactory(d, m) {
        var ins = wrapper(new Date(_this.$y, m, d), _this);
        return isStartOf ? ins : ins.endOf(D);
      };

      var instanceFactorySet = function instanceFactorySet(method, slice) {
        var argumentStart = [0, 0, 0, 0];
        var argumentEnd = [23, 59, 59, 999];
        return wrapper(_this.toDate()[method].apply( // eslint-disable-line prefer-spread
        _this.toDate(), isStartOf ? argumentStart.slice(slice) : argumentEnd.slice(slice)), _this);
      };

      switch (unit) {
        case Y:
          return isStartOf ? instanceFactory(1, 0) : instanceFactory(31, 11);

        case M:
          return isStartOf ? instanceFactory(1, this.$M) : instanceFactory(0, this.$M + 1);

        case W:
          return isStartOf ? instanceFactory(this.$D - this.$W, this.$M) : instanceFactory(this.$D + (6 - this.$W), this.$M);

        case D:
        case DATE:
          return instanceFactorySet('setHours', 0);

        case H:
          return instanceFactorySet('setMinutes', 1);

        case MIN:
          return instanceFactorySet('setSeconds', 2);

        case S:
          return instanceFactorySet('setMilliseconds', 3);

        default:
          return this.clone();
      }
    };

    _proto.endOf = function endOf(arg) {
      return this.startOf(arg, false);
    };

    _proto.$set = function $set(units, int) {
      // private set
      var unit = Utils.prettyUnit(units);

      switch (unit) {
        case D:
          this.$d.setDate(this.$D + (int - this.$W));
          break;

        case DATE:
          this.$d.setDate(int);
          break;

        case M:
          this.$d.setMonth(int);
          break;

        case Y:
          this.$d.setFullYear(int);
          break;

        case H:
          this.$d.setHours(int);
          break;

        case MIN:
          this.$d.setMinutes(int);
          break;

        case S:
          this.$d.setSeconds(int);
          break;

        case MS:
          this.$d.setMilliseconds(int);
          break;

        default:
          break;
      }

      this.init();
      return this;
    };

    _proto.set = function set(string, int) {
      return this.clone().$set(string, int);
    };

    _proto.add = function add(number, units) {
      var _this2 = this;

      number = Number(number); // eslint-disable-line no-param-reassign

      var unit = Utils.prettyUnit(units);

      var instanceFactory = function instanceFactory(u, n) {
        var date = _this2.set(DATE, 1).set(u, n + number);

        return date.set(DATE, Math.min(_this2.$D, date.daysInMonth()));
      };

      if (unit === M) {
        return instanceFactory(M, this.$M);
      }

      if (unit === Y) {
        return instanceFactory(Y, this.$y);
      }

      var step;

      switch (unit) {
        case MIN:
          step = MILLISECONDS_A_MINUTE;
          break;

        case H:
          step = MILLISECONDS_A_HOUR;
          break;

        case D:
          step = MILLISECONDS_A_DAY;
          break;

        case W:
          step = MILLISECONDS_A_WEEK;
          break;

        case S:
          step = MILLISECONDS_A_SECOND;
          break;

        default:
          // ms
          step = 1;
      }

      var nextTimeStamp = this.valueOf() + number * step;
      return wrapper(nextTimeStamp, this);
    };

    _proto.subtract = function subtract(number, string) {
      return this.add(number * -1, string);
    };

    _proto.format = function format(formatStr) {
      var _this3 = this;

      var str = formatStr || FORMAT_DEFAULT;
      var zoneStr = Utils.padZoneStr(this.$d.getTimezoneOffset());
      var locale = this.$locale();
      var weekdays = locale.weekdays,
          months = locale.months;

      var getShort = function getShort(arr, index, full, length) {
        return arr && arr[index] || full[index].substr(0, length);
      };

      return str.replace(REGEX_FORMAT, function (match) {
        if (match.indexOf('[') > -1) return match.replace(/\[|\]/g, '');

        switch (match) {
          case 'YY':
            return String(_this3.$y).slice(-2);

          case 'YYYY':
            return String(_this3.$y);

          case 'M':
            return String(_this3.$M + 1);

          case 'MM':
            return Utils.padStart(_this3.$M + 1, 2, '0');

          case 'MMM':
            return getShort(locale.monthsShort, _this3.$M, months, 3);

          case 'MMMM':
            return months[_this3.$M];

          case 'D':
            return String(_this3.$D);

          case 'DD':
            return Utils.padStart(_this3.$D, 2, '0');

          case 'd':
            return String(_this3.$W);

          case 'dd':
            return getShort(locale.weekdaysMin, _this3.$W, weekdays, 2);

          case 'ddd':
            return getShort(locale.weekdaysShort, _this3.$W, weekdays, 3);

          case 'dddd':
            return weekdays[_this3.$W];

          case 'H':
            return String(_this3.$H);

          case 'HH':
            return Utils.padStart(_this3.$H, 2, '0');

          case 'h':
          case 'hh':
            if (_this3.$H === 0) return 12;
            return Utils.padStart(_this3.$H < 13 ? _this3.$H : _this3.$H - 12, match === 'hh' ? 2 : 1, '0');

          case 'a':
            return _this3.$H < 12 ? 'am' : 'pm';

          case 'A':
            return _this3.$H < 12 ? 'AM' : 'PM';

          case 'm':
            return String(_this3.$m);

          case 'mm':
            return Utils.padStart(_this3.$m, 2, '0');

          case 's':
            return String(_this3.$s);

          case 'ss':
            return Utils.padStart(_this3.$s, 2, '0');

          case 'SSS':
            return Utils.padStart(_this3.$ms, 3, '0');

          case 'Z':
            return zoneStr;

          default:
            // 'ZZ'
            return zoneStr.replace(':', '');
        }
      });
    };

    _proto.diff = function diff(input, units, float) {
      var unit = Utils.prettyUnit(units);
      var that = dayjs(input);
      var diff = this - that;
      var result = Utils.monthDiff(this, that);

      switch (unit) {
        case Y:
          result /= 12;
          break;

        case M:
          break;

        case Q:
          result /= 3;
          break;

        case W:
          result = diff / MILLISECONDS_A_WEEK;
          break;

        case D:
          result = diff / MILLISECONDS_A_DAY;
          break;

        case H:
          result = diff / MILLISECONDS_A_HOUR;
          break;

        case MIN:
          result = diff / MILLISECONDS_A_MINUTE;
          break;

        case S:
          result = diff / MILLISECONDS_A_SECOND;
          break;

        default:
          // milliseconds
          result = diff;
      }

      return float ? result : Utils.absFloor(result);
    };

    _proto.daysInMonth = function daysInMonth() {
      return this.endOf(M).$D;
    };

    _proto.$locale = function $locale() {
      // get locale object
      return Ls[this.$L];
    };

    _proto.locale = function locale(preset, object) {
      var that = this.clone();
      that.$L = parseLocale(preset, object, true);
      return that;
    };

    _proto.clone = function clone() {
      return wrapper(this.toDate(), this);
    };

    _proto.toDate = function toDate() {
      return new Date(this.$d);
    };

    _proto.toArray = function toArray() {
      return [this.$y, this.$M, this.$D, this.$H, this.$m, this.$s, this.$ms];
    };

    _proto.toJSON = function toJSON() {
      return this.toISOString();
    };

    _proto.toISOString = function toISOString() {
      // ie 8 return
      // new Dayjs(this.valueOf() + this.$d.getTimezoneOffset() * 60000)
      // .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      return this.toDate().toISOString();
    };

    _proto.toObject = function toObject() {
      return {
        years: this.$y,
        months: this.$M,
        date: this.$D,
        hours: this.$H,
        minutes: this.$m,
        seconds: this.$s,
        milliseconds: this.$ms
      };
    };

    _proto.toString = function toString() {
      return this.$d.toUTCString();
    };

    return Dayjs;
  }();

  dayjs.extend = function (plugin, option) {
    plugin(option, Dayjs, dayjs);
    return dayjs;
  };

  dayjs.locale = parseLocale;
  dayjs.isDayjs = isDayjs;
  dayjs.en = Ls[L];

  return dayjs;

})));

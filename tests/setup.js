// Jest setup file
// Mock jQuery for testing environment
global.$ = global.jQuery = function(selector) {
  return {
    text: function(val) {
      if (val === undefined) {
        return $(selector)._text || '';
      }
      $(selector)._text = val;
      return $(selector);
    },
    html: function(val) {
      if (val === undefined) {
        return $(selector)._html || '';
      }
      $(selector)._html = val;
      return $(selector);
    },
    append: function(content) {
      if (!$(selector)._children) $(selector)._children = [];
      $(selector)._children.push(content);
      return $(selector);
    },
    empty: function() {
      $(selector)._children = [];
      return $(selector);
    },
    addClass: function(cls) {
      if (!$(selector)._classes) $(selector)._classes = [];
      if (!$(selector)._classes.includes(cls)) {
        $(selector)._classes.push(cls);
      }
      return $(selector);
    },
    removeClass: function(cls) {
      if ($(selector)._classes) {
        $(selector)._classes = $(selector)._classes.filter(c => c !== cls);
      }
      return $(selector);
    },
    hasClass: function(cls) {
      return $(selector)._classes && $(selector)._classes.includes(cls);
    },
    val: function(val) {
      if (val === undefined) {
        return $(selector)._value || '';
      }
      $(selector)._value = val;
      return $(selector);
    },
    on: function(event, handler) {
      if (!$(selector)._events) $(selector)._events = {};
      if (!$(selector)._events[event]) $(selector)._events[event] = [];
      $(selector)._events[event].push(handler);
      return $(selector);
    },
    off: function(event, handler) {
      return $(selector);
    },
    trigger: function(event) {
      if ($(selector)._events && $(selector)._events[event]) {
        $(selector)._events[event].forEach(h => h());
      }
      return $(selector);
    },
    eq: function(index) {
      return $(selector);
    },
    class: function() { return this; },
    scrollHeight: 1000,
    scrollTop: function(val) {
      if (val !== undefined) {
        $(selector)._scrollTop = val;
      }
      return $(selector)._scrollTop || 0;
    },
    each: function(callback) {
      return $(selector);
    }
  };
};

// Proper localStorage mock with real storage backing
var _localStorageStore = {};
const localStorageMock = {
  getItem: jest.fn(function(key) { return _localStorageStore[key] !== undefined ? _localStorageStore[key] : null; }),
  setItem: jest.fn(function(key, value) { _localStorageStore[key] = String(value); }),
  removeItem: jest.fn(function(key) { delete _localStorageStore[key]; }),
  clear: jest.fn(function() { _localStorageStore = {}; }),
  get length() { return Object.keys(_localStorageStore).length; },
  key: jest.fn(function(index) { var keys = Object.keys(_localStorageStore); return keys[index] !== undefined ? keys[index] : null; })
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock jQuery AJAX
$.ajax = jest.fn();
$.getJSON = jest.fn();

// Mock console.error to suppress errors in tests
console.error = jest.fn();

// Helper to load command JS files that use `window.CmdXxx = {...}` pattern
global.loadCommandFile = function(filename) {
  var fs = require('fs');
  var path = require('path');
  var code = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'commands', filename),
    'utf8'
  );
  eval(code);
};

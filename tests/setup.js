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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
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

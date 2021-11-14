(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TestingLibrary = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
  DomTestingLibrary: require('@testing-library/dom'),
  userEvent: require('@testing-library/user-event').default,
}

},{"@testing-library/dom":11,"@testing-library/user-event":37}],2:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createDOMElementFilter;
exports.test = void 0;

/**
 * Source: https://github.com/facebook/jest/blob/e7bb6a1e26ffab90611b2593912df15b69315611/packages/pretty-format/src/plugins/DOMElement.ts
 */

/* eslint-disable -- trying to stay as close to the original as possible */

/* istanbul ignore file */
function escapeHTML(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
} // Return empty string if keys is empty.


const printProps = (keys, props, config, indentation, depth, refs, printer) => {
  const indentationNext = indentation + config.indent;
  const colors = config.colors;
  return keys.map(key => {
    const value = props[key];
    let printed = printer(value, config, indentationNext, depth, refs);

    if (typeof value !== 'string') {
      if (printed.indexOf('\n') !== -1) {
        printed = config.spacingOuter + indentationNext + printed + config.spacingOuter + indentation;
      }

      printed = '{' + printed + '}';
    }

    return config.spacingInner + indentation + colors.prop.open + key + colors.prop.close + '=' + colors.value.open + printed + colors.value.close;
  }).join('');
}; // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#node_type_constants


const NodeTypeTextNode = 3; // Return empty string if children is empty.

const printChildren = (children, config, indentation, depth, refs, printer) => children.map(child => {
  const printedChild = typeof child === 'string' ? printText(child, config) : printer(child, config, indentation, depth, refs);

  if (printedChild === '' && typeof child === 'object' && child !== null && child.nodeType !== NodeTypeTextNode) {
    // A plugin serialized this Node to '' meaning we should ignore it.
    return '';
  }

  return config.spacingOuter + indentation + printedChild;
}).join('');

const printText = (text, config) => {
  const contentColor = config.colors.content;
  return contentColor.open + escapeHTML(text) + contentColor.close;
};

const printComment = (comment, config) => {
  const commentColor = config.colors.comment;
  return commentColor.open + '<!--' + escapeHTML(comment) + '-->' + commentColor.close;
}; // Separate the functions to format props, children, and element,
// so a plugin could override a particular function, if needed.
// Too bad, so sad: the traditional (but unnecessary) space
// in a self-closing tagColor requires a second test of printedProps.


const printElement = (type, printedProps, printedChildren, config, indentation) => {
  const tagColor = config.colors.tag;
  return tagColor.open + '<' + type + (printedProps && tagColor.close + printedProps + config.spacingOuter + indentation + tagColor.open) + (printedChildren ? '>' + tagColor.close + printedChildren + config.spacingOuter + indentation + tagColor.open + '</' + type : (printedProps && !config.min ? '' : ' ') + '/') + '>' + tagColor.close;
};

const printElementAsLeaf = (type, config) => {
  const tagColor = config.colors.tag;
  return tagColor.open + '<' + type + tagColor.close + ' …' + tagColor.open + ' />' + tagColor.close;
};

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const FRAGMENT_NODE = 11;
const ELEMENT_REGEXP = /^((HTML|SVG)\w*)?Element$/;

const testNode = val => {
  const constructorName = val.constructor.name;
  const {
    nodeType,
    tagName
  } = val;
  const isCustomElement = typeof tagName === 'string' && tagName.includes('-') || typeof val.hasAttribute === 'function' && val.hasAttribute('is');
  return nodeType === ELEMENT_NODE && (ELEMENT_REGEXP.test(constructorName) || isCustomElement) || nodeType === TEXT_NODE && constructorName === 'Text' || nodeType === COMMENT_NODE && constructorName === 'Comment' || nodeType === FRAGMENT_NODE && constructorName === 'DocumentFragment';
};

const test = val => {
  var _val$constructor;

  return (val == null ? void 0 : (_val$constructor = val.constructor) == null ? void 0 : _val$constructor.name) && testNode(val);
};

exports.test = test;

function nodeIsText(node) {
  return node.nodeType === TEXT_NODE;
}

function nodeIsComment(node) {
  return node.nodeType === COMMENT_NODE;
}

function nodeIsFragment(node) {
  return node.nodeType === FRAGMENT_NODE;
}

function createDOMElementFilter(filterNode) {
  return {
    test: val => {
      var _val$constructor2;

      return (val == null ? void 0 : (_val$constructor2 = val.constructor) == null ? void 0 : _val$constructor2.name) && testNode(val);
    },
    serialize: (node, config, indentation, depth, refs, printer) => {
      if (nodeIsText(node)) {
        return printText(node.data, config);
      }

      if (nodeIsComment(node)) {
        return printComment(node.data, config);
      }

      const type = nodeIsFragment(node) ? `DocumentFragment` : node.tagName.toLowerCase();

      if (++depth > config.maxDepth) {
        return printElementAsLeaf(type, config);
      }

      return printElement(type, printProps(nodeIsFragment(node) ? [] : Array.from(node.attributes).map(attr => attr.name).sort(), nodeIsFragment(node) ? {} : Array.from(node.attributes).reduce((props, attribute) => {
        props[attribute.name] = attribute.value;
        return props;
      }, {}), config, indentation + config.indent, depth, refs, printer), printChildren(Array.prototype.slice.call(node.childNodes || node.children).filter(filterNode), config, indentation + config.indent, depth, refs, printer), config, indentation);
    }
  };
}
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = configure;
exports.getConfig = getConfig;
exports.runWithExpensiveErrorDiagnosticsDisabled = runWithExpensiveErrorDiagnosticsDisabled;

var _prettyDom = require("./pretty-dom");

// It would be cleaner for this to live inside './queries', but
// other parts of the code assume that all exports from
// './queries' are query functions.
let config = {
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 1000,
  // asyncWrapper and advanceTimersWrapper is to support React's async `act` function.
  // forcing react-testing-library to wrap all async functions would've been
  // a total nightmare (consider wrapping every findBy* query and then also
  // updating `within` so those would be wrapped too. Total nightmare).
  // so we have this config option that's really only intended for
  // react-testing-library to use. For that reason, this feature will remain
  // undocumented.
  asyncWrapper: cb => cb(),
  unstable_advanceTimersWrapper: cb => cb(),
  eventWrapper: cb => cb(),
  // default value for the `hidden` option in `ByRole` queries
  defaultHidden: false,
  // showOriginalStackTrace flag to show the full error stack traces for async errors
  showOriginalStackTrace: false,
  // throw errors w/ suggestions for better queries. Opt in so off by default.
  throwSuggestions: false,

  // called when getBy* queries fail. (message, container) => Error
  getElementError(message, container) {
    const prettifiedDOM = (0, _prettyDom.prettyDOM)(container);
    const error = new Error([message, `Ignored nodes: comments, <script />, <style />\n${prettifiedDOM}`].filter(Boolean).join('\n\n'));
    error.name = 'TestingLibraryElementError';
    return error;
  },

  _disableExpensiveErrorDiagnostics: false,
  computedStyleSupportsPseudoElements: false
};

function runWithExpensiveErrorDiagnosticsDisabled(callback) {
  try {
    config._disableExpensiveErrorDiagnostics = true;
    return callback();
  } finally {
    config._disableExpensiveErrorDiagnostics = false;
  }
}

function configure(newConfig) {
  if (typeof newConfig === 'function') {
    // Pass the existing config out to the provided function
    // and accept a delta in return
    newConfig = newConfig(config);
  } // Merge the incoming config delta


  config = { ...config,
    ...newConfig
  };
}

function getConfig() {
  return config;
}
},{"./pretty-dom":14}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eventMap = exports.eventAliasMap = void 0;
const eventMap = {
  // Clipboard Events
  copy: {
    EventType: 'ClipboardEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  cut: {
    EventType: 'ClipboardEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  paste: {
    EventType: 'ClipboardEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  // Composition Events
  compositionEnd: {
    EventType: 'CompositionEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  compositionStart: {
    EventType: 'CompositionEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  compositionUpdate: {
    EventType: 'CompositionEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  // Keyboard Events
  keyDown: {
    EventType: 'KeyboardEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      charCode: 0,
      composed: true
    }
  },
  keyPress: {
    EventType: 'KeyboardEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      charCode: 0,
      composed: true
    }
  },
  keyUp: {
    EventType: 'KeyboardEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      charCode: 0,
      composed: true
    }
  },
  // Focus Events
  focus: {
    EventType: 'FocusEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false,
      composed: true
    }
  },
  blur: {
    EventType: 'FocusEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false,
      composed: true
    }
  },
  focusIn: {
    EventType: 'FocusEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  focusOut: {
    EventType: 'FocusEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  // Form Events
  change: {
    EventType: 'Event',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  },
  input: {
    EventType: 'InputEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  invalid: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: true
    }
  },
  submit: {
    EventType: 'Event',
    defaultInit: {
      bubbles: true,
      cancelable: true
    }
  },
  reset: {
    EventType: 'Event',
    defaultInit: {
      bubbles: true,
      cancelable: true
    }
  },
  // Mouse Events
  click: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      button: 0,
      composed: true
    }
  },
  contextMenu: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  dblClick: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  drag: {
    EventType: 'DragEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  dragEnd: {
    EventType: 'DragEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  dragEnter: {
    EventType: 'DragEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  dragExit: {
    EventType: 'DragEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  dragLeave: {
    EventType: 'DragEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  dragOver: {
    EventType: 'DragEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  dragStart: {
    EventType: 'DragEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  drop: {
    EventType: 'DragEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  mouseDown: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  mouseEnter: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false,
      composed: true
    }
  },
  mouseLeave: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false,
      composed: true
    }
  },
  mouseMove: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  mouseOut: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  mouseOver: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  mouseUp: {
    EventType: 'MouseEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  // Selection Events
  select: {
    EventType: 'Event',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  },
  // Touch Events
  touchCancel: {
    EventType: 'TouchEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  touchEnd: {
    EventType: 'TouchEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  touchMove: {
    EventType: 'TouchEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  touchStart: {
    EventType: 'TouchEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  // UI Events
  resize: {
    EventType: 'UIEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  scroll: {
    EventType: 'UIEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  // Wheel Events
  wheel: {
    EventType: 'WheelEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  // Media Events
  abort: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  canPlay: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  canPlayThrough: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  durationChange: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  emptied: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  encrypted: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  ended: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  loadedData: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  loadedMetadata: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  loadStart: {
    EventType: 'ProgressEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  pause: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  play: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  playing: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  progress: {
    EventType: 'ProgressEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  rateChange: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  seeked: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  seeking: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  stalled: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  suspend: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  timeUpdate: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  volumeChange: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  waiting: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  // Image Events
  load: {
    EventType: 'UIEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  error: {
    EventType: 'Event',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  // Animation Events
  animationStart: {
    EventType: 'AnimationEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  },
  animationEnd: {
    EventType: 'AnimationEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  },
  animationIteration: {
    EventType: 'AnimationEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  },
  // Transition Events
  transitionCancel: {
    EventType: 'TransitionEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  },
  transitionEnd: {
    EventType: 'TransitionEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true
    }
  },
  transitionRun: {
    EventType: 'TransitionEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  },
  transitionStart: {
    EventType: 'TransitionEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  },
  // pointer events
  pointerOver: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  pointerEnter: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  pointerDown: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  pointerMove: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  pointerUp: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  pointerCancel: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  pointerOut: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: true,
      cancelable: true,
      composed: true
    }
  },
  pointerLeave: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: false,
      cancelable: false
    }
  },
  gotPointerCapture: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  lostPointerCapture: {
    EventType: 'PointerEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false,
      composed: true
    }
  },
  // history events
  popState: {
    EventType: 'PopStateEvent',
    defaultInit: {
      bubbles: true,
      cancelable: false
    }
  }
};
exports.eventMap = eventMap;
const eventAliasMap = {
  doubleClick: 'dblClick'
};
exports.eventAliasMap = eventAliasMap;
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEvent = createEvent;
exports.fireEvent = fireEvent;

var _config = require("./config");

var _helpers = require("./helpers");

var _eventMap = require("./event-map");

function fireEvent(element, event) {
  return (0, _config.getConfig)().eventWrapper(() => {
    if (!event) {
      throw new Error(`Unable to fire an event - please provide an event object.`);
    }

    if (!element) {
      throw new Error(`Unable to fire a "${event.type}" event - please provide a DOM element.`);
    }

    return element.dispatchEvent(event);
  });
}

function createEvent(eventName, node, init, {
  EventType = 'Event',
  defaultInit = {}
} = {}) {
  if (!node) {
    throw new Error(`Unable to fire a "${eventName}" event - please provide a DOM element.`);
  }

  const eventInit = { ...defaultInit,
    ...init
  };
  const {
    target: {
      value,
      files,
      ...targetProperties
    } = {}
  } = eventInit;

  if (value !== undefined) {
    setNativeValue(node, value);
  }

  if (files !== undefined) {
    // input.files is a read-only property so this is not allowed:
    // input.files = [file]
    // so we have to use this workaround to set the property
    Object.defineProperty(node, 'files', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: files
    });
  }

  Object.assign(node, targetProperties);
  const window = (0, _helpers.getWindowFromNode)(node);
  const EventConstructor = window[EventType] || window.Event;
  let event;
  /* istanbul ignore else  */

  if (typeof EventConstructor === 'function') {
    event = new EventConstructor(eventName, eventInit);
  } else {
    // IE11 polyfill from https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
    event = window.document.createEvent(EventType);
    const {
      bubbles,
      cancelable,
      detail,
      ...otherInit
    } = eventInit;
    event.initEvent(eventName, bubbles, cancelable, detail);
    Object.keys(otherInit).forEach(eventKey => {
      event[eventKey] = otherInit[eventKey];
    });
  } // DataTransfer is not supported in jsdom: https://github.com/jsdom/jsdom/issues/1568


  const dataTransferProperties = ['dataTransfer', 'clipboardData'];
  dataTransferProperties.forEach(dataTransferKey => {
    const dataTransferValue = eventInit[dataTransferKey];

    if (typeof dataTransferValue === 'object') {
      /* istanbul ignore if  */
      if (typeof window.DataTransfer === 'function') {
        Object.defineProperty(event, dataTransferKey, {
          value: Object.getOwnPropertyNames(dataTransferValue).reduce((acc, propName) => {
            Object.defineProperty(acc, propName, {
              value: dataTransferValue[propName]
            });
            return acc;
          }, new window.DataTransfer())
        });
      } else {
        Object.defineProperty(event, dataTransferKey, {
          value: dataTransferValue
        });
      }
    }
  });
  return event;
}

Object.keys(_eventMap.eventMap).forEach(key => {
  const {
    EventType,
    defaultInit
  } = _eventMap.eventMap[key];
  const eventName = key.toLowerCase();

  createEvent[key] = (node, init) => createEvent(eventName, node, init, {
    EventType,
    defaultInit
  });

  fireEvent[key] = (node, init) => fireEvent(node, createEvent[key](node, init));
}); // function written after some investigation here:
// https://github.com/facebook/react/issues/10135#issuecomment-401496776

function setNativeValue(element, value) {
  const {
    set: valueSetter
  } = Object.getOwnPropertyDescriptor(element, 'value') || {};
  const prototype = Object.getPrototypeOf(element);
  const {
    set: prototypeValueSetter
  } = Object.getOwnPropertyDescriptor(prototype, 'value') || {};

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    /* istanbul ignore if */
    // eslint-disable-next-line no-lonely-if -- Can't be ignored by istanbul otherwise
    if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      throw new Error('The given element does not have a value setter');
    }
  }
}

Object.keys(_eventMap.eventAliasMap).forEach(aliasKey => {
  const key = _eventMap.eventAliasMap[aliasKey];

  fireEvent[aliasKey] = (...args) => fireEvent[key](...args);
});
/* eslint complexity:["error", 9] */
},{"./config":4,"./event-map":5,"./helpers":10}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNodeText = getNodeText;

var _helpers = require("./helpers");

function getNodeText(node) {
  if (node.matches('input[type=submit], input[type=button], input[type=reset]')) {
    return node.value;
  }

  return Array.from(node.childNodes).filter(child => child.nodeType === _helpers.TEXT_NODE && Boolean(child.textContent)).map(c => c.textContent).join('');
}
},{"./helpers":10}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getQueriesForElement = getQueriesForElement;

var defaultQueries = _interopRequireWildcard(require("./queries"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * @typedef {{[key: string]: Function}} FuncMap
 */

/**
 * @param {HTMLElement} element container
 * @param {FuncMap} queries object of functions
 * @param {Object} initialValue for reducer
 * @returns {FuncMap} returns object of functions bound to container
 */
function getQueriesForElement(element, queries = defaultQueries, initialValue = {}) {
  return Object.keys(queries).reduce((helpers, key) => {
    const fn = queries[key];
    helpers[key] = fn.bind(null, element);
    return helpers;
  }, initialValue);
}
},{"./queries":18}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserCodeFrame = getUserCodeFrame;
// We try to load node dependencies
let chalk = null;
let readFileSync = null;
let codeFrameColumns = null;

try {
  const nodeRequire = module && module.require;
  readFileSync = nodeRequire.call(module, 'fs').readFileSync;
  codeFrameColumns = nodeRequire.call(module, '@babel/code-frame').codeFrameColumns;
  chalk = nodeRequire.call(module, 'chalk');
} catch {// We're in a browser environment
} // frame has the form "at myMethod (location/to/my/file.js:10:2)"


function getCodeFrame(frame) {
  const locationStart = frame.indexOf('(') + 1;
  const locationEnd = frame.indexOf(')');
  const frameLocation = frame.slice(locationStart, locationEnd);
  const frameLocationElements = frameLocation.split(':');
  const [filename, line, column] = [frameLocationElements[0], parseInt(frameLocationElements[1], 10), parseInt(frameLocationElements[2], 10)];
  let rawFileContents = '';

  try {
    rawFileContents = readFileSync(filename, 'utf-8');
  } catch {
    return '';
  }

  const codeFrame = codeFrameColumns(rawFileContents, {
    start: {
      line,
      column
    }
  }, {
    highlightCode: true,
    linesBelow: 0
  });
  return `${chalk.dim(frameLocation)}\n${codeFrame}\n`;
}

function getUserCodeFrame() {
  // If we couldn't load dependencies, we can't generate the user trace

  /* istanbul ignore next */
  if (!readFileSync || !codeFrameColumns) {
    return '';
  }

  const err = new Error();
  const firstClientCodeFrame = err.stack.split('\n').slice(1) // Remove first line which has the form "Error: TypeError"
  .find(frame => !frame.includes('node_modules/')); // Ignore frames from 3rd party libraries

  return getCodeFrame(firstClientCodeFrame);
}
},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TEXT_NODE = void 0;
exports.checkContainerType = checkContainerType;
exports.getDocument = getDocument;
exports.getWindowFromNode = getWindowFromNode;
exports.jestFakeTimersAreEnabled = jestFakeTimersAreEnabled;
// Constant node.nodeType for text nodes, see:
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#Node_type_constants
const TEXT_NODE = 3;
exports.TEXT_NODE = TEXT_NODE;

function jestFakeTimersAreEnabled() {
  /* istanbul ignore else */
  if (typeof jest !== 'undefined' && jest !== null) {
    return (// legacy timers
      setTimeout._isMockFunction === true || // modern timers
      Object.prototype.hasOwnProperty.call(setTimeout, 'clock')
    );
  } // istanbul ignore next


  return false;
}

function getDocument() {
  /* istanbul ignore if */
  if (typeof window === 'undefined') {
    throw new Error('Could not find default container');
  }

  return window.document;
}

function getWindowFromNode(node) {
  if (node.defaultView) {
    // node is document
    return node.defaultView;
  } else if (node.ownerDocument && node.ownerDocument.defaultView) {
    // node is a DOM node
    return node.ownerDocument.defaultView;
  } else if (node.window) {
    // node is window
    return node.window;
  } else if (node.then instanceof Function) {
    throw new Error(`It looks like you passed a Promise object instead of a DOM node. Did you do something like \`fireEvent.click(screen.findBy...\` when you meant to use a \`getBy\` query \`fireEvent.click(screen.getBy...\`, or await the findBy query \`fireEvent.click(await screen.findBy...\`?`);
  } else if (Array.isArray(node)) {
    throw new Error(`It looks like you passed an Array instead of a DOM node. Did you do something like \`fireEvent.click(screen.getAllBy...\` when you meant to use a \`getBy\` query \`fireEvent.click(screen.getBy...\`?`);
  } else if (typeof node.debug === 'function' && typeof node.logTestingPlaygroundURL === 'function') {
    throw new Error(`It looks like you passed a \`screen\` object. Did you do something like \`fireEvent.click(screen, ...\` when you meant to use a query, e.g. \`fireEvent.click(screen.getBy..., \`?`);
  } else {
    // The user passed something unusual to a calling function
    throw new Error(`Unable to find the "window" object for the given node. Please file an issue with the code that's causing you to see this error: https://github.com/testing-library/dom-testing-library/issues/new`);
  }
}

function checkContainerType(container) {
  if (!container || !(typeof container.querySelector === 'function') || !(typeof container.querySelectorAll === 'function')) {
    throw new TypeError(`Expected container to be an Element, a Document or a DocumentFragment but got ${getTypeName(container)}.`);
  }

  function getTypeName(object) {
    if (typeof object === 'object') {
      return object === null ? 'null' : object.constructor.name;
    }

    return typeof object;
  }
}
},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  within: true,
  queries: true,
  queryHelpers: true,
  getDefaultNormalizer: true,
  getRoles: true,
  logRoles: true,
  isInaccessible: true,
  configure: true,
  getConfig: true
};
Object.defineProperty(exports, "configure", {
  enumerable: true,
  get: function () {
    return _config.configure;
  }
});
Object.defineProperty(exports, "getConfig", {
  enumerable: true,
  get: function () {
    return _config.getConfig;
  }
});
Object.defineProperty(exports, "getDefaultNormalizer", {
  enumerable: true,
  get: function () {
    return _matches.getDefaultNormalizer;
  }
});
Object.defineProperty(exports, "getRoles", {
  enumerable: true,
  get: function () {
    return _roleHelpers.getRoles;
  }
});
Object.defineProperty(exports, "isInaccessible", {
  enumerable: true,
  get: function () {
    return _roleHelpers.isInaccessible;
  }
});
Object.defineProperty(exports, "logRoles", {
  enumerable: true,
  get: function () {
    return _roleHelpers.logRoles;
  }
});
exports.queryHelpers = exports.queries = void 0;
Object.defineProperty(exports, "within", {
  enumerable: true,
  get: function () {
    return _getQueriesForElement.getQueriesForElement;
  }
});

var _getQueriesForElement = require("./get-queries-for-element");

Object.keys(_getQueriesForElement).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _getQueriesForElement[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _getQueriesForElement[key];
    }
  });
});

var queries = _interopRequireWildcard(require("./queries"));

exports.queries = queries;
Object.keys(queries).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === queries[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return queries[key];
    }
  });
});

var queryHelpers = _interopRequireWildcard(require("./query-helpers"));

exports.queryHelpers = queryHelpers;
Object.keys(queryHelpers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === queryHelpers[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return queryHelpers[key];
    }
  });
});

var _waitFor = require("./wait-for");

Object.keys(_waitFor).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _waitFor[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _waitFor[key];
    }
  });
});

var _waitForElementToBeRemoved = require("./wait-for-element-to-be-removed");

Object.keys(_waitForElementToBeRemoved).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _waitForElementToBeRemoved[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _waitForElementToBeRemoved[key];
    }
  });
});

var _matches = require("./matches");

var _getNodeText = require("./get-node-text");

Object.keys(_getNodeText).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _getNodeText[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _getNodeText[key];
    }
  });
});

var _events = require("./events");

Object.keys(_events).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _events[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _events[key];
    }
  });
});

var _screen = require("./screen");

Object.keys(_screen).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _screen[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _screen[key];
    }
  });
});

var _roleHelpers = require("./role-helpers");

var _prettyDom = require("./pretty-dom");

Object.keys(_prettyDom).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _prettyDom[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _prettyDom[key];
    }
  });
});

var _config = require("./config");

var _suggestions = require("./suggestions");

Object.keys(_suggestions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _suggestions[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _suggestions[key];
    }
  });
});

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
},{"./config":4,"./events":6,"./get-node-text":7,"./get-queries-for-element":8,"./matches":13,"./pretty-dom":14,"./queries":18,"./query-helpers":25,"./role-helpers":26,"./screen":27,"./suggestions":29,"./wait-for":31,"./wait-for-element-to-be-removed":30}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLabelContent = getLabelContent;
exports.getLabels = getLabels;
exports.getRealLabels = getRealLabels;

var _helpers = require("./helpers");

const labelledNodeNames = ['button', 'meter', 'output', 'progress', 'select', 'textarea', 'input'];

function getTextContent(node) {
  if (labelledNodeNames.includes(node.nodeName.toLowerCase())) {
    return '';
  }

  if (node.nodeType === _helpers.TEXT_NODE) return node.textContent;
  return Array.from(node.childNodes).map(childNode => getTextContent(childNode)).join('');
}

function getLabelContent(element) {
  let textContent;

  if (element.tagName.toLowerCase() === 'label') {
    textContent = getTextContent(element);
  } else {
    textContent = element.value || element.textContent;
  }

  return textContent;
} // Based on https://github.com/eps1lon/dom-accessibility-api/pull/352


function getRealLabels(element) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- types are not aware of older browsers that don't implement `labels`
  if (element.labels !== undefined) {
    var _labels;

    return (_labels = element.labels) != null ? _labels : [];
  }

  if (!isLabelable(element)) return [];
  const labels = element.ownerDocument.querySelectorAll('label');
  return Array.from(labels).filter(label => label.control === element);
}

function isLabelable(element) {
  return /BUTTON|METER|OUTPUT|PROGRESS|SELECT|TEXTAREA/.test(element.tagName) || element.tagName === 'INPUT' && element.getAttribute('type') !== 'hidden';
}

function getLabels(container, element, {
  selector = '*'
} = {}) {
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const labelsId = ariaLabelledBy ? ariaLabelledBy.split(' ') : [];
  return labelsId.length ? labelsId.map(labelId => {
    const labellingElement = container.querySelector(`[id="${labelId}"]`);
    return labellingElement ? {
      content: getLabelContent(labellingElement),
      formControl: null
    } : {
      content: '',
      formControl: null
    };
  }) : Array.from(getRealLabels(element)).map(label => {
    const textToMatch = getLabelContent(label);
    const formControlSelector = 'button, input, meter, output, progress, select, textarea';
    const labelledFormControl = Array.from(label.querySelectorAll(formControlSelector)).filter(formControlElement => formControlElement.matches(selector))[0];
    return {
      content: textToMatch,
      formControl: labelledFormControl
    };
  });
}
},{"./helpers":10}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fuzzyMatches = fuzzyMatches;
exports.getDefaultNormalizer = getDefaultNormalizer;
exports.makeNormalizer = makeNormalizer;
exports.matches = matches;

function assertNotNullOrUndefined(matcher) {
  if (matcher === null || matcher === undefined) {
    throw new Error( // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- implicitly converting `T` to `string`
    `It looks like ${matcher} was passed instead of a matcher. Did you do something like getByText(${matcher})?`);
  }
}

function fuzzyMatches(textToMatch, node, matcher, normalizer) {
  if (typeof textToMatch !== 'string') {
    return false;
  }

  assertNotNullOrUndefined(matcher);
  const normalizedText = normalizer(textToMatch);

  if (typeof matcher === 'string' || typeof matcher === 'number') {
    return normalizedText.toLowerCase().includes(matcher.toString().toLowerCase());
  } else if (typeof matcher === 'function') {
    return matcher(normalizedText, node);
  } else {
    return matcher.test(normalizedText);
  }
}

function matches(textToMatch, node, matcher, normalizer) {
  if (typeof textToMatch !== 'string') {
    return false;
  }

  assertNotNullOrUndefined(matcher);
  const normalizedText = normalizer(textToMatch);

  if (matcher instanceof Function) {
    return matcher(normalizedText, node);
  } else if (matcher instanceof RegExp) {
    return matcher.test(normalizedText);
  } else {
    return normalizedText === String(matcher);
  }
}

function getDefaultNormalizer({
  trim = true,
  collapseWhitespace = true
} = {}) {
  return text => {
    let normalizedText = text;
    normalizedText = trim ? normalizedText.trim() : normalizedText;
    normalizedText = collapseWhitespace ? normalizedText.replace(/\s+/g, ' ') : normalizedText;
    return normalizedText;
  };
}
/**
 * Constructs a normalizer to pass to functions in matches.js
 * @param {boolean|undefined} trim The user-specified value for `trim`, without
 * any defaulting having been applied
 * @param {boolean|undefined} collapseWhitespace The user-specified value for
 * `collapseWhitespace`, without any defaulting having been applied
 * @param {Function|undefined} normalizer The user-specified normalizer
 * @returns {Function} A normalizer
 */


function makeNormalizer({
  trim,
  collapseWhitespace,
  normalizer
}) {
  if (normalizer) {
    // User has specified a custom normalizer
    if (typeof trim !== 'undefined' || typeof collapseWhitespace !== 'undefined') {
      // They've also specified a value for trim or collapseWhitespace
      throw new Error('trim and collapseWhitespace are not supported with a normalizer. ' + 'If you want to use the default trim and collapseWhitespace logic in your normalizer, ' + 'use "getDefaultNormalizer({trim, collapseWhitespace})" and compose that into your normalizer');
    }

    return normalizer;
  } else {
    // No custom normalizer specified. Just use default.
    return getDefaultNormalizer({
      trim,
      collapseWhitespace
    });
  }
}
},{}],14:[function(require,module,exports){
(function (process){(function (){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logDOM = void 0;
exports.prettyDOM = prettyDOM;
exports.prettyFormat = void 0;

var prettyFormat = _interopRequireWildcard(require("pretty-format"));

exports.prettyFormat = prettyFormat;

var _DOMElementFilter = _interopRequireDefault(require("./DOMElementFilter"));

var _getUserCodeFrame = require("./get-user-code-frame");

var _helpers = require("./helpers");

var _shared = require("./shared");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const inNode = () => typeof process !== 'undefined' && process.versions !== undefined && process.versions.node !== undefined;

const {
  DOMCollection
} = prettyFormat.plugins; // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#node_type_constants

const ELEMENT_NODE = 1;
const COMMENT_NODE = 8; // https://github.com/facebook/jest/blob/615084195ae1ae61ddd56162c62bbdda17587569/packages/pretty-format/src/plugins/DOMElement.ts#L50

function filterCommentsAndDefaultIgnoreTagsTags(value) {
  return value.nodeType !== COMMENT_NODE && ( // value.nodeType === ELEMENT_NODE => !value.matches(DEFAULT_IGNORE_TAGS)
  value.nodeType !== ELEMENT_NODE || !value.matches(_shared.DEFAULT_IGNORE_TAGS));
}

function prettyDOM(dom, maxLength, options = {}) {
  if (!dom) {
    dom = (0, _helpers.getDocument)().body;
  }

  if (typeof maxLength !== 'number') {
    maxLength = typeof process !== 'undefined' && process.env.DEBUG_PRINT_LIMIT || 7000;
  }

  if (maxLength === 0) {
    return '';
  }

  if (dom.documentElement) {
    dom = dom.documentElement;
  }

  let domTypeName = typeof dom;

  if (domTypeName === 'object') {
    domTypeName = dom.constructor.name;
  } else {
    // To don't fall with `in` operator
    dom = {};
  }

  if (!('outerHTML' in dom)) {
    throw new TypeError(`Expected an element or document but got ${domTypeName}`);
  }

  const {
    filterNode = filterCommentsAndDefaultIgnoreTagsTags,
    ...prettyFormatOptions
  } = options;
  const debugContent = prettyFormat.format(dom, {
    plugins: [(0, _DOMElementFilter.default)(filterNode), DOMCollection],
    printFunctionName: false,
    highlight: inNode(),
    ...prettyFormatOptions
  });
  return maxLength !== undefined && dom.outerHTML.length > maxLength ? `${debugContent.slice(0, maxLength)}...` : debugContent;
}

const logDOM = (...args) => {
  const userCodeFrame = (0, _getUserCodeFrame.getUserCodeFrame)();

  if (userCodeFrame) {
    console.log(`${prettyDOM(...args)}\n\n${userCodeFrame}`);
  } else {
    console.log(prettyDOM(...args));
  }
};

exports.logDOM = logDOM;
}).call(this)}).call(this,require('_process'))
},{"./DOMElementFilter":3,"./get-user-code-frame":9,"./helpers":10,"./shared":28,"@babel/runtime/helpers/interopRequireDefault":2,"_process":251,"pretty-format":241}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _matches = require("../matches");

Object.keys(_matches).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _matches[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _matches[key];
    }
  });
});

var _getNodeText = require("../get-node-text");

Object.keys(_getNodeText).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _getNodeText[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _getNodeText[key];
    }
  });
});

var _queryHelpers = require("../query-helpers");

Object.keys(_queryHelpers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _queryHelpers[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _queryHelpers[key];
    }
  });
});

var _config = require("../config");

Object.keys(_config).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _config[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _config[key];
    }
  });
});
},{"../config":4,"../get-node-text":7,"../matches":13,"../query-helpers":25}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryByAltText = exports.queryAllByAltText = exports.getByAltText = exports.getAllByAltText = exports.findByAltText = exports.findAllByAltText = void 0;

var _queryHelpers = require("../query-helpers");

var _helpers = require("../helpers");

var _allUtils = require("./all-utils");

// Valid tags are img, input, area and custom elements
const VALID_TAG_REGEXP = /^(img|input|area|.+-.+)$/i;

const queryAllByAltText = (container, alt, options = {}) => {
  (0, _helpers.checkContainerType)(container);
  return (0, _queryHelpers.queryAllByAttribute)('alt', container, alt, options).filter(node => VALID_TAG_REGEXP.test(node.tagName));
};

const getMultipleError = (c, alt) => `Found multiple elements with the alt text: ${alt}`;

const getMissingError = (c, alt) => `Unable to find an element with the alt text: ${alt}`;

const queryAllByAltTextWithSuggestions = (0, _queryHelpers.wrapAllByQueryWithSuggestion)(queryAllByAltText, queryAllByAltText.name, 'queryAll');
exports.queryAllByAltText = queryAllByAltTextWithSuggestions;
const [queryByAltText, getAllByAltText, getByAltText, findAllByAltText, findByAltText] = (0, _allUtils.buildQueries)(queryAllByAltText, getMultipleError, getMissingError);
exports.findByAltText = findByAltText;
exports.findAllByAltText = findAllByAltText;
exports.getByAltText = getByAltText;
exports.getAllByAltText = getAllByAltText;
exports.queryByAltText = queryByAltText;
},{"../helpers":10,"../query-helpers":25,"./all-utils":15}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryByDisplayValue = exports.queryAllByDisplayValue = exports.getByDisplayValue = exports.getAllByDisplayValue = exports.findByDisplayValue = exports.findAllByDisplayValue = void 0;

var _queryHelpers = require("../query-helpers");

var _helpers = require("../helpers");

var _allUtils = require("./all-utils");

const queryAllByDisplayValue = (container, value, {
  exact = true,
  collapseWhitespace,
  trim,
  normalizer
} = {}) => {
  (0, _helpers.checkContainerType)(container);
  const matcher = exact ? _allUtils.matches : _allUtils.fuzzyMatches;
  const matchNormalizer = (0, _allUtils.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });
  return Array.from(container.querySelectorAll(`input,textarea,select`)).filter(node => {
    if (node.tagName === 'SELECT') {
      const selectedOptions = Array.from(node.options).filter(option => option.selected);
      return selectedOptions.some(optionNode => matcher((0, _allUtils.getNodeText)(optionNode), optionNode, value, matchNormalizer));
    } else {
      return matcher(node.value, node, value, matchNormalizer);
    }
  });
};

const getMultipleError = (c, value) => `Found multiple elements with the display value: ${value}.`;

const getMissingError = (c, value) => `Unable to find an element with the display value: ${value}.`;

const queryAllByDisplayValueWithSuggestions = (0, _queryHelpers.wrapAllByQueryWithSuggestion)(queryAllByDisplayValue, queryAllByDisplayValue.name, 'queryAll');
exports.queryAllByDisplayValue = queryAllByDisplayValueWithSuggestions;
const [queryByDisplayValue, getAllByDisplayValue, getByDisplayValue, findAllByDisplayValue, findByDisplayValue] = (0, _allUtils.buildQueries)(queryAllByDisplayValue, getMultipleError, getMissingError);
exports.findByDisplayValue = findByDisplayValue;
exports.findAllByDisplayValue = findAllByDisplayValue;
exports.getByDisplayValue = getByDisplayValue;
exports.getAllByDisplayValue = getAllByDisplayValue;
exports.queryByDisplayValue = queryByDisplayValue;
},{"../helpers":10,"../query-helpers":25,"./all-utils":15}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _labelText = require("./label-text");

Object.keys(_labelText).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _labelText[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _labelText[key];
    }
  });
});

var _placeholderText = require("./placeholder-text");

Object.keys(_placeholderText).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _placeholderText[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _placeholderText[key];
    }
  });
});

var _text = require("./text");

Object.keys(_text).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _text[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _text[key];
    }
  });
});

var _displayValue = require("./display-value");

Object.keys(_displayValue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _displayValue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _displayValue[key];
    }
  });
});

var _altText = require("./alt-text");

Object.keys(_altText).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _altText[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _altText[key];
    }
  });
});

var _title = require("./title");

Object.keys(_title).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _title[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _title[key];
    }
  });
});

var _role = require("./role");

Object.keys(_role).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _role[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _role[key];
    }
  });
});

var _testId = require("./test-id");

Object.keys(_testId).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _testId[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _testId[key];
    }
  });
});
},{"./alt-text":16,"./display-value":17,"./label-text":19,"./placeholder-text":20,"./role":21,"./test-id":22,"./text":23,"./title":24}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryByLabelText = exports.queryAllByLabelText = exports.getByLabelText = exports.getAllByLabelText = exports.findByLabelText = exports.findAllByLabelText = void 0;

var _config = require("../config");

var _helpers = require("../helpers");

var _labelHelpers = require("../label-helpers");

var _allUtils = require("./all-utils");

function queryAllLabels(container) {
  return Array.from(container.querySelectorAll('label,input')).map(node => {
    return {
      node,
      textToMatch: (0, _labelHelpers.getLabelContent)(node)
    };
  }).filter(({
    textToMatch
  }) => textToMatch !== null);
}

const queryAllLabelsByText = (container, text, {
  exact = true,
  trim,
  collapseWhitespace,
  normalizer
} = {}) => {
  const matcher = exact ? _allUtils.matches : _allUtils.fuzzyMatches;
  const matchNormalizer = (0, _allUtils.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });
  const textToMatchByLabels = queryAllLabels(container);
  return textToMatchByLabels.filter(({
    node,
    textToMatch
  }) => matcher(textToMatch, node, text, matchNormalizer)).map(({
    node
  }) => node);
};

const queryAllByLabelText = (container, text, {
  selector = '*',
  exact = true,
  collapseWhitespace,
  trim,
  normalizer
} = {}) => {
  (0, _helpers.checkContainerType)(container);
  const matcher = exact ? _allUtils.matches : _allUtils.fuzzyMatches;
  const matchNormalizer = (0, _allUtils.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });
  const matchingLabelledElements = Array.from(container.querySelectorAll('*')).filter(element => {
    return (0, _labelHelpers.getRealLabels)(element).length || element.hasAttribute('aria-labelledby');
  }).reduce((labelledElements, labelledElement) => {
    const labelList = (0, _labelHelpers.getLabels)(container, labelledElement, {
      selector
    });
    labelList.filter(label => Boolean(label.formControl)).forEach(label => {
      if (matcher(label.content, label.formControl, text, matchNormalizer) && label.formControl) labelledElements.push(label.formControl);
    });
    const labelsValue = labelList.filter(label => Boolean(label.content)).map(label => label.content);
    if (matcher(labelsValue.join(' '), labelledElement, text, matchNormalizer)) labelledElements.push(labelledElement);

    if (labelsValue.length > 1) {
      labelsValue.forEach((labelValue, index) => {
        if (matcher(labelValue, labelledElement, text, matchNormalizer)) labelledElements.push(labelledElement);
        const labelsFiltered = [...labelsValue];
        labelsFiltered.splice(index, 1);

        if (labelsFiltered.length > 1) {
          if (matcher(labelsFiltered.join(' '), labelledElement, text, matchNormalizer)) labelledElements.push(labelledElement);
        }
      });
    }

    return labelledElements;
  }, []).concat((0, _allUtils.queryAllByAttribute)('aria-label', container, text, {
    exact,
    normalizer: matchNormalizer
  }));
  return Array.from(new Set(matchingLabelledElements)).filter(element => element.matches(selector));
}; // the getAll* query would normally look like this:
// const getAllByLabelText = makeGetAllQuery(
//   queryAllByLabelText,
//   (c, text) => `Unable to find a label with the text of: ${text}`,
// )
// however, we can give a more helpful error message than the generic one,
// so we're writing this one out by hand.


const getAllByLabelText = (container, text, ...rest) => {
  const els = queryAllByLabelText(container, text, ...rest);

  if (!els.length) {
    const labels = queryAllLabelsByText(container, text, ...rest);

    if (labels.length) {
      const tagNames = labels.map(label => getTagNameOfElementAssociatedWithLabelViaFor(container, label)).filter(tagName => !!tagName);

      if (tagNames.length) {
        throw (0, _config.getConfig)().getElementError(tagNames.map(tagName => `Found a label with the text of: ${text}, however the element associated with this label (<${tagName} />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <${tagName} />, you can use aria-label or aria-labelledby instead.`).join('\n\n'), container);
      } else {
        throw (0, _config.getConfig)().getElementError(`Found a label with the text of: ${text}, however no form control was found associated to that label. Make sure you're using the "for" attribute or "aria-labelledby" attribute correctly.`, container);
      }
    } else {
      throw (0, _config.getConfig)().getElementError(`Unable to find a label with the text of: ${text}`, container);
    }
  }

  return els;
};

function getTagNameOfElementAssociatedWithLabelViaFor(container, label) {
  const htmlFor = label.getAttribute('for');

  if (!htmlFor) {
    return null;
  }

  const element = container.querySelector(`[id="${htmlFor}"]`);
  return element ? element.tagName.toLowerCase() : null;
} // the reason mentioned above is the same reason we're not using buildQueries


const getMultipleError = (c, text) => `Found multiple elements with the text of: ${text}`;

const queryByLabelText = (0, _allUtils.wrapSingleQueryWithSuggestion)((0, _allUtils.makeSingleQuery)(queryAllByLabelText, getMultipleError), queryAllByLabelText.name, 'query');
exports.queryByLabelText = queryByLabelText;
const getByLabelText = (0, _allUtils.makeSingleQuery)(getAllByLabelText, getMultipleError);
const findAllByLabelText = (0, _allUtils.makeFindQuery)((0, _allUtils.wrapAllByQueryWithSuggestion)(getAllByLabelText, getAllByLabelText.name, 'findAll'));
exports.findAllByLabelText = findAllByLabelText;
const findByLabelText = (0, _allUtils.makeFindQuery)((0, _allUtils.wrapSingleQueryWithSuggestion)(getByLabelText, getAllByLabelText.name, 'find'));
exports.findByLabelText = findByLabelText;
const getAllByLabelTextWithSuggestions = (0, _allUtils.wrapAllByQueryWithSuggestion)(getAllByLabelText, getAllByLabelText.name, 'getAll');
exports.getAllByLabelText = getAllByLabelTextWithSuggestions;
const getByLabelTextWithSuggestions = (0, _allUtils.wrapSingleQueryWithSuggestion)(getByLabelText, getAllByLabelText.name, 'get');
exports.getByLabelText = getByLabelTextWithSuggestions;
const queryAllByLabelTextWithSuggestions = (0, _allUtils.wrapAllByQueryWithSuggestion)(queryAllByLabelText, queryAllByLabelText.name, 'queryAll');
exports.queryAllByLabelText = queryAllByLabelTextWithSuggestions;
},{"../config":4,"../helpers":10,"../label-helpers":12,"./all-utils":15}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryByPlaceholderText = exports.queryAllByPlaceholderText = exports.getByPlaceholderText = exports.getAllByPlaceholderText = exports.findByPlaceholderText = exports.findAllByPlaceholderText = void 0;

var _queryHelpers = require("../query-helpers");

var _helpers = require("../helpers");

var _allUtils = require("./all-utils");

const queryAllByPlaceholderText = (...args) => {
  (0, _helpers.checkContainerType)(args[0]);
  return (0, _allUtils.queryAllByAttribute)('placeholder', ...args);
};

const getMultipleError = (c, text) => `Found multiple elements with the placeholder text of: ${text}`;

const getMissingError = (c, text) => `Unable to find an element with the placeholder text of: ${text}`;

const queryAllByPlaceholderTextWithSuggestions = (0, _queryHelpers.wrapAllByQueryWithSuggestion)(queryAllByPlaceholderText, queryAllByPlaceholderText.name, 'queryAll');
exports.queryAllByPlaceholderText = queryAllByPlaceholderTextWithSuggestions;
const [queryByPlaceholderText, getAllByPlaceholderText, getByPlaceholderText, findAllByPlaceholderText, findByPlaceholderText] = (0, _allUtils.buildQueries)(queryAllByPlaceholderText, getMultipleError, getMissingError);
exports.findByPlaceholderText = findByPlaceholderText;
exports.findAllByPlaceholderText = findAllByPlaceholderText;
exports.getByPlaceholderText = getByPlaceholderText;
exports.getAllByPlaceholderText = getAllByPlaceholderText;
exports.queryByPlaceholderText = queryByPlaceholderText;
},{"../helpers":10,"../query-helpers":25,"./all-utils":15}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryByRole = exports.queryAllByRole = exports.getByRole = exports.getAllByRole = exports.findByRole = exports.findAllByRole = void 0;

var _domAccessibilityApi = require("dom-accessibility-api");

var _ariaQuery = require("aria-query");

var _roleHelpers = require("../role-helpers");

var _queryHelpers = require("../query-helpers");

var _helpers = require("../helpers");

var _allUtils = require("./all-utils");

function queryAllByRole(container, role, {
  exact = true,
  collapseWhitespace,
  hidden = (0, _allUtils.getConfig)().defaultHidden,
  name,
  trim,
  normalizer,
  queryFallbacks = false,
  selected,
  checked,
  pressed,
  current,
  level,
  expanded
} = {}) {
  (0, _helpers.checkContainerType)(container);
  const matcher = exact ? _allUtils.matches : _allUtils.fuzzyMatches;
  const matchNormalizer = (0, _allUtils.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });

  if (selected !== undefined) {
    var _allRoles$get;

    // guard against unknown roles
    if (((_allRoles$get = _ariaQuery.roles.get(role)) == null ? void 0 : _allRoles$get.props['aria-selected']) === undefined) {
      throw new Error(`"aria-selected" is not supported on role "${role}".`);
    }
  }

  if (checked !== undefined) {
    var _allRoles$get2;

    // guard against unknown roles
    if (((_allRoles$get2 = _ariaQuery.roles.get(role)) == null ? void 0 : _allRoles$get2.props['aria-checked']) === undefined) {
      throw new Error(`"aria-checked" is not supported on role "${role}".`);
    }
  }

  if (pressed !== undefined) {
    var _allRoles$get3;

    // guard against unknown roles
    if (((_allRoles$get3 = _ariaQuery.roles.get(role)) == null ? void 0 : _allRoles$get3.props['aria-pressed']) === undefined) {
      throw new Error(`"aria-pressed" is not supported on role "${role}".`);
    }
  }

  if (current !== undefined) {
    var _allRoles$get4;

    /* istanbul ignore next */
    // guard against unknown roles
    // All currently released ARIA versions support `aria-current` on all roles.
    // Leaving this for symetry and forward compatibility
    if (((_allRoles$get4 = _ariaQuery.roles.get(role)) == null ? void 0 : _allRoles$get4.props['aria-current']) === undefined) {
      throw new Error(`"aria-current" is not supported on role "${role}".`);
    }
  }

  if (level !== undefined) {
    // guard against using `level` option with any role other than `heading`
    if (role !== 'heading') {
      throw new Error(`Role "${role}" cannot have "level" property.`);
    }
  }

  if (expanded !== undefined) {
    var _allRoles$get5;

    // guard against unknown roles
    if (((_allRoles$get5 = _ariaQuery.roles.get(role)) == null ? void 0 : _allRoles$get5.props['aria-expanded']) === undefined) {
      throw new Error(`"aria-expanded" is not supported on role "${role}".`);
    }
  }

  const subtreeIsInaccessibleCache = new WeakMap();

  function cachedIsSubtreeInaccessible(element) {
    if (!subtreeIsInaccessibleCache.has(element)) {
      subtreeIsInaccessibleCache.set(element, (0, _roleHelpers.isSubtreeInaccessible)(element));
    }

    return subtreeIsInaccessibleCache.get(element);
  }

  return Array.from(container.querySelectorAll( // Only query elements that can be matched by the following filters
  makeRoleSelector(role, exact, normalizer ? matchNormalizer : undefined))).filter(node => {
    const isRoleSpecifiedExplicitly = node.hasAttribute('role');

    if (isRoleSpecifiedExplicitly) {
      const roleValue = node.getAttribute('role');

      if (queryFallbacks) {
        return roleValue.split(' ').filter(Boolean).some(text => matcher(text, node, role, matchNormalizer));
      } // if a custom normalizer is passed then let normalizer handle the role value


      if (normalizer) {
        return matcher(roleValue, node, role, matchNormalizer);
      } // other wise only send the first word to match


      const [firstWord] = roleValue.split(' ');
      return matcher(firstWord, node, role, matchNormalizer);
    }

    const implicitRoles = (0, _roleHelpers.getImplicitAriaRoles)(node);
    return implicitRoles.some(implicitRole => matcher(implicitRole, node, role, matchNormalizer));
  }).filter(element => {
    if (selected !== undefined) {
      return selected === (0, _roleHelpers.computeAriaSelected)(element);
    }

    if (checked !== undefined) {
      return checked === (0, _roleHelpers.computeAriaChecked)(element);
    }

    if (pressed !== undefined) {
      return pressed === (0, _roleHelpers.computeAriaPressed)(element);
    }

    if (current !== undefined) {
      return current === (0, _roleHelpers.computeAriaCurrent)(element);
    }

    if (expanded !== undefined) {
      return expanded === (0, _roleHelpers.computeAriaExpanded)(element);
    }

    if (level !== undefined) {
      return level === (0, _roleHelpers.computeHeadingLevel)(element);
    } // don't care if aria attributes are unspecified


    return true;
  }).filter(element => {
    if (name === undefined) {
      // Don't care
      return true;
    }

    return (0, _allUtils.matches)((0, _domAccessibilityApi.computeAccessibleName)(element, {
      computedStyleSupportsPseudoElements: (0, _allUtils.getConfig)().computedStyleSupportsPseudoElements
    }), element, name, text => text);
  }).filter(element => {
    return hidden === false ? (0, _roleHelpers.isInaccessible)(element, {
      isSubtreeInaccessible: cachedIsSubtreeInaccessible
    }) === false : true;
  });
}

function makeRoleSelector(role, exact, customNormalizer) {
  var _roleElements$get;

  if (typeof role !== 'string') {
    // For non-string role parameters we can not determine the implicitRoleSelectors.
    return '*';
  }

  const explicitRoleSelector = exact && !customNormalizer ? `*[role~="${role}"]` : '*[role]';
  const roleRelations = (_roleElements$get = _ariaQuery.roleElements.get(role)) != null ? _roleElements$get : new Set();
  const implicitRoleSelectors = new Set(Array.from(roleRelations).map(({
    name
  }) => name)); // Current transpilation config sometimes assumes `...` is always applied to arrays.
  // `...` is equivalent to `Array.prototype.concat` for arrays.
  // If you replace this code with `[explicitRoleSelector, ...implicitRoleSelectors]`, make sure every transpilation target retains the `...` in favor of `Array.prototype.concat`.

  return [explicitRoleSelector].concat(Array.from(implicitRoleSelectors)).join(',');
}

const getMultipleError = (c, role, {
  name
} = {}) => {
  let nameHint = '';

  if (name === undefined) {
    nameHint = '';
  } else if (typeof name === 'string') {
    nameHint = ` and name "${name}"`;
  } else {
    nameHint = ` and name \`${name}\``;
  }

  return `Found multiple elements with the role "${role}"${nameHint}`;
};

const getMissingError = (container, role, {
  hidden = (0, _allUtils.getConfig)().defaultHidden,
  name
} = {}) => {
  if ((0, _allUtils.getConfig)()._disableExpensiveErrorDiagnostics) {
    return `Unable to find role="${role}"`;
  }

  let roles = '';
  Array.from(container.children).forEach(childElement => {
    roles += (0, _roleHelpers.prettyRoles)(childElement, {
      hidden,
      includeName: name !== undefined
    });
  });
  let roleMessage;

  if (roles.length === 0) {
    if (hidden === false) {
      roleMessage = 'There are no accessible roles. But there might be some inaccessible roles. ' + 'If you wish to access them, then set the `hidden` option to `true`. ' + 'Learn more about this here: https://testing-library.com/docs/dom-testing-library/api-queries#byrole';
    } else {
      roleMessage = 'There are no available roles.';
    }
  } else {
    roleMessage = `
Here are the ${hidden === false ? 'accessible' : 'available'} roles:

  ${roles.replace(/\n/g, '\n  ').replace(/\n\s\s\n/g, '\n\n')}
`.trim();
  }

  let nameHint = '';

  if (name === undefined) {
    nameHint = '';
  } else if (typeof name === 'string') {
    nameHint = ` and name "${name}"`;
  } else {
    nameHint = ` and name \`${name}\``;
  }

  return `
Unable to find an ${hidden === false ? 'accessible ' : ''}element with the role "${role}"${nameHint}

${roleMessage}`.trim();
};

const queryAllByRoleWithSuggestions = (0, _queryHelpers.wrapAllByQueryWithSuggestion)(queryAllByRole, queryAllByRole.name, 'queryAll');
exports.queryAllByRole = queryAllByRoleWithSuggestions;
const [queryByRole, getAllByRole, getByRole, findAllByRole, findByRole] = (0, _allUtils.buildQueries)(queryAllByRole, getMultipleError, getMissingError);
exports.findByRole = findByRole;
exports.findAllByRole = findAllByRole;
exports.getByRole = getByRole;
exports.getAllByRole = getAllByRole;
exports.queryByRole = queryByRole;
},{"../helpers":10,"../query-helpers":25,"../role-helpers":26,"./all-utils":15,"aria-query":227,"dom-accessibility-api":234}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryByTestId = exports.queryAllByTestId = exports.getByTestId = exports.getAllByTestId = exports.findByTestId = exports.findAllByTestId = void 0;

var _helpers = require("../helpers");

var _queryHelpers = require("../query-helpers");

var _allUtils = require("./all-utils");

const getTestIdAttribute = () => (0, _allUtils.getConfig)().testIdAttribute;

const queryAllByTestId = (...args) => {
  (0, _helpers.checkContainerType)(args[0]);
  return (0, _allUtils.queryAllByAttribute)(getTestIdAttribute(), ...args);
};

const getMultipleError = (c, id) => `Found multiple elements by: [${getTestIdAttribute()}="${id}"]`;

const getMissingError = (c, id) => `Unable to find an element by: [${getTestIdAttribute()}="${id}"]`;

const queryAllByTestIdWithSuggestions = (0, _queryHelpers.wrapAllByQueryWithSuggestion)(queryAllByTestId, queryAllByTestId.name, 'queryAll');
exports.queryAllByTestId = queryAllByTestIdWithSuggestions;
const [queryByTestId, getAllByTestId, getByTestId, findAllByTestId, findByTestId] = (0, _allUtils.buildQueries)(queryAllByTestId, getMultipleError, getMissingError);
exports.findByTestId = findByTestId;
exports.findAllByTestId = findAllByTestId;
exports.getByTestId = getByTestId;
exports.getAllByTestId = getAllByTestId;
exports.queryByTestId = queryByTestId;
},{"../helpers":10,"../query-helpers":25,"./all-utils":15}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryByText = exports.queryAllByText = exports.getByText = exports.getAllByText = exports.findByText = exports.findAllByText = void 0;

var _queryHelpers = require("../query-helpers");

var _helpers = require("../helpers");

var _shared = require("../shared");

var _allUtils = require("./all-utils");

const queryAllByText = (container, text, {
  selector = '*',
  exact = true,
  collapseWhitespace,
  trim,
  ignore = _shared.DEFAULT_IGNORE_TAGS,
  normalizer
} = {}) => {
  (0, _helpers.checkContainerType)(container);
  const matcher = exact ? _allUtils.matches : _allUtils.fuzzyMatches;
  const matchNormalizer = (0, _allUtils.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });
  let baseArray = [];

  if (typeof container.matches === 'function' && container.matches(selector)) {
    baseArray = [container];
  }

  return [...baseArray, ...Array.from(container.querySelectorAll(selector))] // TODO: `matches` according lib.dom.d.ts can get only `string` but according our code it can handle also boolean :)
  .filter(node => !ignore || !node.matches(ignore)).filter(node => matcher((0, _allUtils.getNodeText)(node), node, text, matchNormalizer));
};

const getMultipleError = (c, text) => `Found multiple elements with the text: ${text}`;

const getMissingError = (c, text) => `Unable to find an element with the text: ${text}. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.`;

const queryAllByTextWithSuggestions = (0, _queryHelpers.wrapAllByQueryWithSuggestion)(queryAllByText, queryAllByText.name, 'queryAll');
exports.queryAllByText = queryAllByTextWithSuggestions;
const [queryByText, getAllByText, getByText, findAllByText, findByText] = (0, _allUtils.buildQueries)(queryAllByText, getMultipleError, getMissingError);
exports.findByText = findByText;
exports.findAllByText = findAllByText;
exports.getByText = getByText;
exports.getAllByText = getAllByText;
exports.queryByText = queryByText;
},{"../helpers":10,"../query-helpers":25,"../shared":28,"./all-utils":15}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryByTitle = exports.queryAllByTitle = exports.getByTitle = exports.getAllByTitle = exports.findByTitle = exports.findAllByTitle = void 0;

var _queryHelpers = require("../query-helpers");

var _helpers = require("../helpers");

var _allUtils = require("./all-utils");

const isSvgTitle = node => {
  var _node$parentElement;

  return node.tagName.toLowerCase() === 'title' && ((_node$parentElement = node.parentElement) == null ? void 0 : _node$parentElement.tagName.toLowerCase()) === 'svg';
};

const queryAllByTitle = (container, text, {
  exact = true,
  collapseWhitespace,
  trim,
  normalizer
} = {}) => {
  (0, _helpers.checkContainerType)(container);
  const matcher = exact ? _allUtils.matches : _allUtils.fuzzyMatches;
  const matchNormalizer = (0, _allUtils.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });
  return Array.from(container.querySelectorAll('[title], svg > title')).filter(node => matcher(node.getAttribute('title'), node, text, matchNormalizer) || isSvgTitle(node) && matcher((0, _allUtils.getNodeText)(node), node, text, matchNormalizer));
};

const getMultipleError = (c, title) => `Found multiple elements with the title: ${title}.`;

const getMissingError = (c, title) => `Unable to find an element with the title: ${title}.`;

const queryAllByTitleWithSuggestions = (0, _queryHelpers.wrapAllByQueryWithSuggestion)(queryAllByTitle, queryAllByTitle.name, 'queryAll');
exports.queryAllByTitle = queryAllByTitleWithSuggestions;
const [queryByTitle, getAllByTitle, getByTitle, findAllByTitle, findByTitle] = (0, _allUtils.buildQueries)(queryAllByTitle, getMultipleError, getMissingError);
exports.findByTitle = findByTitle;
exports.findAllByTitle = findAllByTitle;
exports.getByTitle = getByTitle;
exports.getAllByTitle = getAllByTitle;
exports.queryByTitle = queryByTitle;
},{"../helpers":10,"../query-helpers":25,"./all-utils":15}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildQueries = buildQueries;
exports.getElementError = getElementError;
exports.getMultipleElementsFoundError = getMultipleElementsFoundError;
exports.makeFindQuery = makeFindQuery;
exports.makeGetAllQuery = makeGetAllQuery;
exports.makeSingleQuery = makeSingleQuery;
exports.queryAllByAttribute = queryAllByAttribute;
exports.queryByAttribute = queryByAttribute;
exports.wrapSingleQueryWithSuggestion = exports.wrapAllByQueryWithSuggestion = void 0;

var _suggestions = require("./suggestions");

var _matches = require("./matches");

var _waitFor = require("./wait-for");

var _config = require("./config");

function getElementError(message, container) {
  return (0, _config.getConfig)().getElementError(message, container);
}

function getMultipleElementsFoundError(message, container) {
  return getElementError(`${message}\n\n(If this is intentional, then use the \`*AllBy*\` variant of the query (like \`queryAllByText\`, \`getAllByText\`, or \`findAllByText\`)).`, container);
}

function queryAllByAttribute(attribute, container, text, {
  exact = true,
  collapseWhitespace,
  trim,
  normalizer
} = {}) {
  const matcher = exact ? _matches.matches : _matches.fuzzyMatches;
  const matchNormalizer = (0, _matches.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });
  return Array.from(container.querySelectorAll(`[${attribute}]`)).filter(node => matcher(node.getAttribute(attribute), node, text, matchNormalizer));
}

function queryByAttribute(attribute, container, text, options) {
  const els = queryAllByAttribute(attribute, container, text, options);

  if (els.length > 1) {
    throw getMultipleElementsFoundError(`Found multiple elements by [${attribute}=${text}]`, container);
  }

  return els[0] || null;
} // this accepts a query function and returns a function which throws an error
// if more than one elements is returned, otherwise it returns the first
// element or null


function makeSingleQuery(allQuery, getMultipleError) {
  return (container, ...args) => {
    const els = allQuery(container, ...args);

    if (els.length > 1) {
      const elementStrings = els.map(element => getElementError(null, element).message).join('\n\n');
      throw getMultipleElementsFoundError(`${getMultipleError(container, ...args)}

Here are the matching elements:

${elementStrings}`, container);
    }

    return els[0] || null;
  };
}

function getSuggestionError(suggestion, container) {
  return (0, _config.getConfig)().getElementError(`A better query is available, try this:
${suggestion.toString()}
`, container);
} // this accepts a query function and returns a function which throws an error
// if an empty list of elements is returned


function makeGetAllQuery(allQuery, getMissingError) {
  return (container, ...args) => {
    const els = allQuery(container, ...args);

    if (!els.length) {
      throw (0, _config.getConfig)().getElementError(getMissingError(container, ...args), container);
    }

    return els;
  };
} // this accepts a getter query function and returns a function which calls
// waitFor and passing a function which invokes the getter.


function makeFindQuery(getter) {
  return (container, text, options, waitForOptions) => {
    return (0, _waitFor.waitFor)(() => {
      return getter(container, text, options);
    }, {
      container,
      ...waitForOptions
    });
  };
}

const wrapSingleQueryWithSuggestion = (query, queryAllByName, variant) => (container, ...args) => {
  const element = query(container, ...args);
  const [{
    suggest = (0, _config.getConfig)().throwSuggestions
  } = {}] = args.slice(-1);

  if (element && suggest) {
    const suggestion = (0, _suggestions.getSuggestedQuery)(element, variant);

    if (suggestion && !queryAllByName.endsWith(suggestion.queryName)) {
      throw getSuggestionError(suggestion.toString(), container);
    }
  }

  return element;
};

exports.wrapSingleQueryWithSuggestion = wrapSingleQueryWithSuggestion;

const wrapAllByQueryWithSuggestion = (query, queryAllByName, variant) => (container, ...args) => {
  const els = query(container, ...args);
  const [{
    suggest = (0, _config.getConfig)().throwSuggestions
  } = {}] = args.slice(-1);

  if (els.length && suggest) {
    // get a unique list of all suggestion messages.  We are only going to make a suggestion if
    // all the suggestions are the same
    const uniqueSuggestionMessages = [...new Set(els.map(element => {
      var _getSuggestedQuery;

      return (_getSuggestedQuery = (0, _suggestions.getSuggestedQuery)(element, variant)) == null ? void 0 : _getSuggestedQuery.toString();
    }))];

    if ( // only want to suggest if all the els have the same suggestion.
    uniqueSuggestionMessages.length === 1 && !queryAllByName.endsWith( // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: Can this be null at runtime?
    (0, _suggestions.getSuggestedQuery)(els[0], variant).queryName)) {
      throw getSuggestionError(uniqueSuggestionMessages[0], container);
    }
  }

  return els;
}; // TODO: This deviates from the published declarations
// However, the implementation always required a dyadic (after `container`) not variadic `queryAllBy` considering the implementation of `makeFindQuery`
// This is at least statically true and can be verified by accepting `QueryMethod<Arguments, HTMLElement[]>`


exports.wrapAllByQueryWithSuggestion = wrapAllByQueryWithSuggestion;

function buildQueries(queryAllBy, getMultipleError, getMissingError) {
  const queryBy = wrapSingleQueryWithSuggestion(makeSingleQuery(queryAllBy, getMultipleError), queryAllBy.name, 'query');
  const getAllBy = makeGetAllQuery(queryAllBy, getMissingError);
  const getBy = makeSingleQuery(getAllBy, getMultipleError);
  const getByWithSuggestions = wrapSingleQueryWithSuggestion(getBy, queryAllBy.name, 'get');
  const getAllWithSuggestions = wrapAllByQueryWithSuggestion(getAllBy, queryAllBy.name.replace('query', 'get'), 'getAll');
  const findAllBy = makeFindQuery(wrapAllByQueryWithSuggestion(getAllBy, queryAllBy.name, 'findAll'));
  const findBy = makeFindQuery(wrapSingleQueryWithSuggestion(getBy, queryAllBy.name, 'find'));
  return [queryBy, getAllWithSuggestions, getByWithSuggestions, findAllBy, findBy];
}
},{"./config":4,"./matches":13,"./suggestions":29,"./wait-for":31}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeAriaChecked = computeAriaChecked;
exports.computeAriaCurrent = computeAriaCurrent;
exports.computeAriaExpanded = computeAriaExpanded;
exports.computeAriaPressed = computeAriaPressed;
exports.computeAriaSelected = computeAriaSelected;
exports.computeHeadingLevel = computeHeadingLevel;
exports.getImplicitAriaRoles = getImplicitAriaRoles;
exports.getRoles = getRoles;
exports.isInaccessible = isInaccessible;
exports.isSubtreeInaccessible = isSubtreeInaccessible;
exports.logRoles = void 0;
exports.prettyRoles = prettyRoles;

var _ariaQuery = require("aria-query");

var _domAccessibilityApi = require("dom-accessibility-api");

var _prettyDom = require("./pretty-dom");

var _config = require("./config");

const elementRoleList = buildElementRoleList(_ariaQuery.elementRoles);
/**
 * @param {Element} element -
 * @returns {boolean} - `true` if `element` and its subtree are inaccessible
 */

function isSubtreeInaccessible(element) {
  if (element.hidden === true) {
    return true;
  }

  if (element.getAttribute('aria-hidden') === 'true') {
    return true;
  }

  const window = element.ownerDocument.defaultView;

  if (window.getComputedStyle(element).display === 'none') {
    return true;
  }

  return false;
}
/**
 * Partial implementation https://www.w3.org/TR/wai-aria-1.2/#tree_exclusion
 * which should only be used for elements with a non-presentational role i.e.
 * `role="none"` and `role="presentation"` will not be excluded.
 *
 * Implements aria-hidden semantics (i.e. parent overrides child)
 * Ignores "Child Presentational: True" characteristics
 *
 * @param {Element} element -
 * @param {object} [options] -
 * @param {function (element: Element): boolean} options.isSubtreeInaccessible -
 * can be used to return cached results from previous isSubtreeInaccessible calls
 * @returns {boolean} true if excluded, otherwise false
 */


function isInaccessible(element, options = {}) {
  const {
    isSubtreeInaccessible: isSubtreeInaccessibleImpl = isSubtreeInaccessible
  } = options;
  const window = element.ownerDocument.defaultView; // since visibility is inherited we can exit early

  if (window.getComputedStyle(element).visibility === 'hidden') {
    return true;
  }

  let currentElement = element;

  while (currentElement) {
    if (isSubtreeInaccessibleImpl(currentElement)) {
      return true;
    }

    currentElement = currentElement.parentElement;
  }

  return false;
}

function getImplicitAriaRoles(currentNode) {
  // eslint bug here:
  // eslint-disable-next-line no-unused-vars
  for (const {
    match,
    roles
  } of elementRoleList) {
    if (match(currentNode)) {
      return [...roles];
    }
  }

  return [];
}

function buildElementRoleList(elementRolesMap) {
  function makeElementSelector({
    name,
    attributes
  }) {
    return `${name}${attributes.map(({
      name: attributeName,
      value,
      constraints = []
    }) => {
      const shouldNotExist = constraints.indexOf('undefined') !== -1;

      if (shouldNotExist) {
        return `:not([${attributeName}])`;
      } else if (value) {
        return `[${attributeName}="${value}"]`;
      } else {
        return `[${attributeName}]`;
      }
    }).join('')}`;
  }

  function getSelectorSpecificity({
    attributes = []
  }) {
    return attributes.length;
  }

  function bySelectorSpecificity({
    specificity: leftSpecificity
  }, {
    specificity: rightSpecificity
  }) {
    return rightSpecificity - leftSpecificity;
  }

  function match(element) {
    return node => {
      let {
        attributes = []
      } = element; // https://github.com/testing-library/dom-testing-library/issues/814

      const typeTextIndex = attributes.findIndex(attribute => attribute.value && attribute.name === 'type' && attribute.value === 'text');

      if (typeTextIndex >= 0) {
        // not using splice to not mutate the attributes array
        attributes = [...attributes.slice(0, typeTextIndex), ...attributes.slice(typeTextIndex + 1)];

        if (node.type !== 'text') {
          return false;
        }
      }

      return node.matches(makeElementSelector({ ...element,
        attributes
      }));
    };
  }

  let result = []; // eslint bug here:
  // eslint-disable-next-line no-unused-vars

  for (const [element, roles] of elementRolesMap.entries()) {
    result = [...result, {
      match: match(element),
      roles: Array.from(roles),
      specificity: getSelectorSpecificity(element)
    }];
  }

  return result.sort(bySelectorSpecificity);
}

function getRoles(container, {
  hidden = false
} = {}) {
  function flattenDOM(node) {
    return [node, ...Array.from(node.children).reduce((acc, child) => [...acc, ...flattenDOM(child)], [])];
  }

  return flattenDOM(container).filter(element => {
    return hidden === false ? isInaccessible(element) === false : true;
  }).reduce((acc, node) => {
    let roles = []; // TODO: This violates html-aria which does not allow any role on every element

    if (node.hasAttribute('role')) {
      roles = node.getAttribute('role').split(' ').slice(0, 1);
    } else {
      roles = getImplicitAriaRoles(node);
    }

    return roles.reduce((rolesAcc, role) => Array.isArray(rolesAcc[role]) ? { ...rolesAcc,
      [role]: [...rolesAcc[role], node]
    } : { ...rolesAcc,
      [role]: [node]
    }, acc);
  }, {});
}

function prettyRoles(dom, {
  hidden
}) {
  const roles = getRoles(dom, {
    hidden
  }); // We prefer to skip generic role, we don't recommend it

  return Object.entries(roles).filter(([role]) => role !== 'generic').map(([role, elements]) => {
    const delimiterBar = '-'.repeat(50);
    const elementsString = elements.map(el => {
      const nameString = `Name "${(0, _domAccessibilityApi.computeAccessibleName)(el, {
        computedStyleSupportsPseudoElements: (0, _config.getConfig)().computedStyleSupportsPseudoElements
      })}":\n`;
      const domString = (0, _prettyDom.prettyDOM)(el.cloneNode(false));
      return `${nameString}${domString}`;
    }).join('\n\n');
    return `${role}:\n\n${elementsString}\n\n${delimiterBar}`;
  }).join('\n');
}

const logRoles = (dom, {
  hidden = false
} = {}) => console.log(prettyRoles(dom, {
  hidden
}));
/**
 * @param {Element} element -
 * @returns {boolean | undefined} - false/true if (not)selected, undefined if not selectable
 */


exports.logRoles = logRoles;

function computeAriaSelected(element) {
  // implicit value from html-aam mappings: https://www.w3.org/TR/html-aam-1.0/#html-attribute-state-and-property-mappings
  // https://www.w3.org/TR/html-aam-1.0/#details-id-97
  if (element.tagName === 'OPTION') {
    return element.selected;
  } // explicit value


  return checkBooleanAttribute(element, 'aria-selected');
}
/**
 * @param {Element} element -
 * @returns {boolean | undefined} - false/true if (not)checked, undefined if not checked-able
 */


function computeAriaChecked(element) {
  // implicit value from html-aam mappings: https://www.w3.org/TR/html-aam-1.0/#html-attribute-state-and-property-mappings
  // https://www.w3.org/TR/html-aam-1.0/#details-id-56
  // https://www.w3.org/TR/html-aam-1.0/#details-id-67
  if ('indeterminate' in element && element.indeterminate) {
    return undefined;
  }

  if ('checked' in element) {
    return element.checked;
  } // explicit value


  return checkBooleanAttribute(element, 'aria-checked');
}
/**
 * @param {Element} element -
 * @returns {boolean | undefined} - false/true if (not)pressed, undefined if not press-able
 */


function computeAriaPressed(element) {
  // https://www.w3.org/TR/wai-aria-1.1/#aria-pressed
  return checkBooleanAttribute(element, 'aria-pressed');
}
/**
 * @param {Element} element -
 * @returns {boolean | string | null} -
 */


function computeAriaCurrent(element) {
  var _ref, _checkBooleanAttribut;

  // https://www.w3.org/TR/wai-aria-1.1/#aria-current
  return (_ref = (_checkBooleanAttribut = checkBooleanAttribute(element, 'aria-current')) != null ? _checkBooleanAttribut : element.getAttribute('aria-current')) != null ? _ref : false;
}
/**
 * @param {Element} element -
 * @returns {boolean | undefined} - false/true if (not)expanded, undefined if not expand-able
 */


function computeAriaExpanded(element) {
  // https://www.w3.org/TR/wai-aria-1.1/#aria-expanded
  return checkBooleanAttribute(element, 'aria-expanded');
}

function checkBooleanAttribute(element, attribute) {
  const attributeValue = element.getAttribute(attribute);

  if (attributeValue === 'true') {
    return true;
  }

  if (attributeValue === 'false') {
    return false;
  }

  return undefined;
}
/**
 * @param {Element} element -
 * @returns {number | undefined} - number if implicit heading or aria-level present, otherwise undefined
 */


function computeHeadingLevel(element) {
  // https://w3c.github.io/html-aam/#el-h1-h6
  // https://w3c.github.io/html-aam/#el-h1-h6
  const implicitHeadingLevels = {
    H1: 1,
    H2: 2,
    H3: 3,
    H4: 4,
    H5: 5,
    H6: 6
  }; // explicit aria-level value
  // https://www.w3.org/TR/wai-aria-1.2/#aria-level

  const ariaLevelAttribute = element.getAttribute('aria-level') && Number(element.getAttribute('aria-level'));
  return ariaLevelAttribute || implicitHeadingLevels[element.tagName];
}
},{"./config":4,"./pretty-dom":14,"aria-query":227,"dom-accessibility-api":234}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.screen = void 0;

var _lzString = require("lz-string");

var _getQueriesForElement = require("./get-queries-for-element");

var _helpers = require("./helpers");

var _prettyDom = require("./pretty-dom");

var queries = _interopRequireWildcard(require("./queries"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function unindent(string) {
  // remove white spaces first, to save a few bytes.
  // testing-playground will reformat on load any ways.
  return string.replace(/[ \t]*[\n][ \t]*/g, '\n');
}

function encode(value) {
  return (0, _lzString.compressToEncodedURIComponent)(unindent(value));
}

function getPlaygroundUrl(markup) {
  return `https://testing-playground.com/#markup=${encode(markup)}`;
}

const debug = (element, maxLength, options) => Array.isArray(element) ? element.forEach(el => (0, _prettyDom.logDOM)(el, maxLength, options)) : (0, _prettyDom.logDOM)(element, maxLength, options);

const logTestingPlaygroundURL = (element = (0, _helpers.getDocument)().body) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!element || !('innerHTML' in element)) {
    console.log(`The element you're providing isn't a valid DOM element.`);
    return;
  } // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition


  if (!element.innerHTML) {
    console.log(`The provided element doesn't have any children.`);
    return;
  }

  console.log(`Open this URL in your browser\n\n${getPlaygroundUrl(element.innerHTML)}`);
};

const initialValue = {
  debug,
  logTestingPlaygroundURL
};
const screen = typeof document !== 'undefined' && document.body // eslint-disable-line @typescript-eslint/no-unnecessary-condition
? (0, _getQueriesForElement.getQueriesForElement)(document.body, queries, initialValue) : Object.keys(queries).reduce((helpers, key) => {
  // `key` is for all intents and purposes the type of keyof `helpers`, which itself is the type of `initialValue` plus incoming properties from `queries`
  // if `Object.keys(something)` returned Array<keyof typeof something> this explicit type assertion would not be necessary
  // see https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript
  helpers[key] = () => {
    throw new TypeError('For queries bound to document.body a global document has to be available... Learn more: https://testing-library.com/s/screen-global-error');
  };

  return helpers;
}, initialValue);
exports.screen = screen;
},{"./get-queries-for-element":8,"./helpers":10,"./pretty-dom":14,"./queries":18,"lz-string":239}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_IGNORE_TAGS = void 0;
const DEFAULT_IGNORE_TAGS = 'script, style';
exports.DEFAULT_IGNORE_TAGS = DEFAULT_IGNORE_TAGS;
},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSuggestedQuery = getSuggestedQuery;

var _domAccessibilityApi = require("dom-accessibility-api");

var _matches = require("./matches");

var _getNodeText = require("./get-node-text");

var _config = require("./config");

var _roleHelpers = require("./role-helpers");

var _labelHelpers = require("./label-helpers");

var _shared = require("./shared");

const normalize = (0, _matches.getDefaultNormalizer)();

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function getRegExpMatcher(string) {
  return new RegExp(escapeRegExp(string.toLowerCase()), 'i');
}

function makeSuggestion(queryName, element, content, {
  variant,
  name
}) {
  let warning = '';
  const queryOptions = {};
  const queryArgs = [['Role', 'TestId'].includes(queryName) ? content : getRegExpMatcher(content)];

  if (name) {
    queryOptions.name = getRegExpMatcher(name);
  }

  if (queryName === 'Role' && (0, _roleHelpers.isInaccessible)(element)) {
    queryOptions.hidden = true;
    warning = `Element is inaccessible. This means that the element and all its children are invisible to screen readers.
    If you are using the aria-hidden prop, make sure this is the right choice for your case.
    `;
  }

  if (Object.keys(queryOptions).length > 0) {
    queryArgs.push(queryOptions);
  }

  const queryMethod = `${variant}By${queryName}`;
  return {
    queryName,
    queryMethod,
    queryArgs,
    variant,
    warning,

    toString() {
      if (warning) {
        console.warn(warning);
      }

      let [text, options] = queryArgs;
      text = typeof text === 'string' ? `'${text}'` : text;
      options = options ? `, { ${Object.entries(options).map(([k, v]) => `${k}: ${v}`).join(', ')} }` : '';
      return `${queryMethod}(${text}${options})`;
    }

  };
}

function canSuggest(currentMethod, requestedMethod, data) {
  return data && (!requestedMethod || requestedMethod.toLowerCase() === currentMethod.toLowerCase());
}

function getSuggestedQuery(element, variant = 'get', method) {
  var _element$getAttribute, _getImplicitAriaRoles;

  // don't create suggestions for script and style elements
  if (element.matches(_shared.DEFAULT_IGNORE_TAGS)) {
    return undefined;
  } //We prefer to suggest something else if the role is generic


  const role = (_element$getAttribute = element.getAttribute('role')) != null ? _element$getAttribute : (_getImplicitAriaRoles = (0, _roleHelpers.getImplicitAriaRoles)(element)) == null ? void 0 : _getImplicitAriaRoles[0];

  if (role !== 'generic' && canSuggest('Role', method, role)) {
    return makeSuggestion('Role', element, role, {
      variant,
      name: (0, _domAccessibilityApi.computeAccessibleName)(element, {
        computedStyleSupportsPseudoElements: (0, _config.getConfig)().computedStyleSupportsPseudoElements
      })
    });
  }

  const labelText = (0, _labelHelpers.getLabels)(document, element).map(label => label.content).join(' ');

  if (canSuggest('LabelText', method, labelText)) {
    return makeSuggestion('LabelText', element, labelText, {
      variant
    });
  }

  const placeholderText = element.getAttribute('placeholder');

  if (canSuggest('PlaceholderText', method, placeholderText)) {
    return makeSuggestion('PlaceholderText', element, placeholderText, {
      variant
    });
  }

  const textContent = normalize((0, _getNodeText.getNodeText)(element));

  if (canSuggest('Text', method, textContent)) {
    return makeSuggestion('Text', element, textContent, {
      variant
    });
  }

  if (canSuggest('DisplayValue', method, element.value)) {
    return makeSuggestion('DisplayValue', element, normalize(element.value), {
      variant
    });
  }

  const alt = element.getAttribute('alt');

  if (canSuggest('AltText', method, alt)) {
    return makeSuggestion('AltText', element, alt, {
      variant
    });
  }

  const title = element.getAttribute('title');

  if (canSuggest('Title', method, title)) {
    return makeSuggestion('Title', element, title, {
      variant
    });
  }

  const testId = element.getAttribute((0, _config.getConfig)().testIdAttribute);

  if (canSuggest('TestId', method, testId)) {
    return makeSuggestion('TestId', element, testId, {
      variant
    });
  }

  return undefined;
}
},{"./config":4,"./get-node-text":7,"./label-helpers":12,"./matches":13,"./role-helpers":26,"./shared":28,"dom-accessibility-api":234}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitForElementToBeRemoved = waitForElementToBeRemoved;

var _waitFor = require("./wait-for");

const isRemoved = result => !result || Array.isArray(result) && !result.length; // Check if the element is not present.
// As the name implies, waitForElementToBeRemoved should check `present` --> `removed`


function initialCheck(elements) {
  if (isRemoved(elements)) {
    throw new Error('The element(s) given to waitForElementToBeRemoved are already removed. waitForElementToBeRemoved requires that the element(s) exist(s) before waiting for removal.');
  }
}

async function waitForElementToBeRemoved(callback, options) {
  // created here so we get a nice stacktrace
  const timeoutError = new Error('Timed out in waitForElementToBeRemoved.');

  if (typeof callback !== 'function') {
    initialCheck(callback);
    const elements = Array.isArray(callback) ? callback : [callback];
    const getRemainingElements = elements.map(element => {
      let parent = element.parentElement;
      if (parent === null) return () => null;

      while (parent.parentElement) parent = parent.parentElement;

      return () => parent.contains(element) ? element : null;
    });

    callback = () => getRemainingElements.map(c => c()).filter(Boolean);
  }

  initialCheck(callback());
  return (0, _waitFor.waitFor)(() => {
    let result;

    try {
      result = callback();
    } catch (error) {
      if (error.name === 'TestingLibraryElementError') {
        return undefined;
      }

      throw error;
    }

    if (!isRemoved(result)) {
      throw timeoutError;
    }

    return undefined;
  }, options);
}
/*
eslint
  require-await: "off"
*/
},{"./wait-for":31}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitFor = waitForWrapper;

var _helpers = require("./helpers");

var _config = require("./config");

// This is so the stack trace the developer sees is one that's
// closer to their code (because async stack traces are hard to follow).
function copyStackTrace(target, source) {
  target.stack = source.stack.replace(source.message, target.message);
}

function waitFor(callback, {
  container = (0, _helpers.getDocument)(),
  timeout = (0, _config.getConfig)().asyncUtilTimeout,
  showOriginalStackTrace = (0, _config.getConfig)().showOriginalStackTrace,
  stackTraceError,
  interval = 50,
  onTimeout = error => {
    error.message = (0, _config.getConfig)().getElementError(error.message, container).message;
    return error;
  },
  mutationObserverOptions = {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  }
}) {
  if (typeof callback !== 'function') {
    throw new TypeError('Received `callback` arg must be a function');
  }

  return new Promise(async (resolve, reject) => {
    let lastError, intervalId, observer;
    let finished = false;
    let promiseStatus = 'idle';
    const overallTimeoutTimer = setTimeout(handleTimeout, timeout);
    const usingJestFakeTimers = (0, _helpers.jestFakeTimersAreEnabled)();

    if (usingJestFakeTimers) {
      const {
        unstable_advanceTimersWrapper: advanceTimersWrapper
      } = (0, _config.getConfig)();
      checkCallback(); // this is a dangerous rule to disable because it could lead to an
      // infinite loop. However, eslint isn't smart enough to know that we're
      // setting finished inside `onDone` which will be called when we're done
      // waiting or when we've timed out.
      // eslint-disable-next-line no-unmodified-loop-condition

      while (!finished) {
        if (!(0, _helpers.jestFakeTimersAreEnabled)()) {
          const error = new Error(`Changed from using fake timers to real timers while using waitFor. This is not allowed and will result in very strange behavior. Please ensure you're awaiting all async things your test is doing before changing to real timers. For more info, please go to https://github.com/testing-library/dom-testing-library/issues/830`);
          if (!showOriginalStackTrace) copyStackTrace(error, stackTraceError);
          reject(error);
          return;
        } // we *could* (maybe should?) use `advanceTimersToNextTimer` but it's
        // possible that could make this loop go on forever if someone is using
        // third party code that's setting up recursive timers so rapidly that
        // the user's timer's don't get a chance to resolve. So we'll advance
        // by an interval instead. (We have a test for this case).


        advanceTimersWrapper(() => {
          jest.advanceTimersByTime(interval);
        }); // It's really important that checkCallback is run *before* we flush
        // in-flight promises. To be honest, I'm not sure why, and I can't quite
        // think of a way to reproduce the problem in a test, but I spent
        // an entire day banging my head against a wall on this.

        checkCallback(); // In this rare case, we *need* to wait for in-flight promises
        // to resolve before continuing. We don't need to take advantage
        // of parallelization so we're fine.
        // https://stackoverflow.com/a/59243586/971592
        // eslint-disable-next-line no-await-in-loop

        await advanceTimersWrapper(async () => {
          await new Promise(r => {
            setTimeout(r, 0);
            jest.advanceTimersByTime(0);
          });
        });
      }
    } else {
      try {
        (0, _helpers.checkContainerType)(container);
      } catch (e) {
        reject(e);
        return;
      }

      intervalId = setInterval(checkRealTimersCallback, interval);
      const {
        MutationObserver
      } = (0, _helpers.getWindowFromNode)(container);
      observer = new MutationObserver(checkRealTimersCallback);
      observer.observe(container, mutationObserverOptions);
      checkCallback();
    }

    function onDone(error, result) {
      finished = true;
      clearTimeout(overallTimeoutTimer);

      if (!usingJestFakeTimers) {
        clearInterval(intervalId);
        observer.disconnect();
      }

      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }

    function checkRealTimersCallback() {
      if ((0, _helpers.jestFakeTimersAreEnabled)()) {
        const error = new Error(`Changed from using real timers to fake timers while using waitFor. This is not allowed and will result in very strange behavior. Please ensure you're awaiting all async things your test is doing before changing to fake timers. For more info, please go to https://github.com/testing-library/dom-testing-library/issues/830`);
        if (!showOriginalStackTrace) copyStackTrace(error, stackTraceError);
        return reject(error);
      } else {
        return checkCallback();
      }
    }

    function checkCallback() {
      if (promiseStatus === 'pending') return;

      try {
        const result = (0, _config.runWithExpensiveErrorDiagnosticsDisabled)(callback);

        if (typeof (result == null ? void 0 : result.then) === 'function') {
          promiseStatus = 'pending';
          result.then(resolvedValue => {
            promiseStatus = 'resolved';
            onDone(null, resolvedValue);
          }, rejectedValue => {
            promiseStatus = 'rejected';
            lastError = rejectedValue;
          });
        } else {
          onDone(null, result);
        } // If `callback` throws, wait for the next mutation, interval, or timeout.

      } catch (error) {
        // Save the most recent callback error to reject the promise with it in the event of a timeout
        lastError = error;
      }
    }

    function handleTimeout() {
      let error;

      if (lastError) {
        error = lastError;

        if (!showOriginalStackTrace && error.name === 'TestingLibraryElementError') {
          copyStackTrace(error, stackTraceError);
        }
      } else {
        error = new Error('Timed out in waitFor.');

        if (!showOriginalStackTrace) {
          copyStackTrace(error, stackTraceError);
        }
      }

      onDone(onTimeout(error), null);
    }
  });
}

function waitForWrapper(callback, options) {
  // create the error here so its stack trace is as close to the
  // calling code as possible
  const stackTraceError = new Error('STACK_TRACE_MESSAGE');
  return (0, _config.getConfig)().asyncWrapper(() => waitFor(callback, {
    stackTraceError,
    ...options
  }));
}
/*
eslint
  max-lines-per-function: ["error", {"max": 200}],
*/
},{"./config":4,"./helpers":10}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blur = blur;

var _utils = require("./utils");

function blur(element) {
  if (!(0, _utils.isFocusable)(element)) return;
  const wasActive = (0, _utils.getActiveElement)(element.ownerDocument) === element;
  if (!wasActive) return;
  (0, _utils.eventWrapper)(() => element.blur());
}
},{"./utils":76}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clear = clear;

var _utils = require("./utils");

var _type = require("./type");

function clear(element) {
  var _element$selectionSta, _element$selectionEnd;

  if (!(0, _utils.isElementType)(element, ['input', 'textarea'])) {
    // TODO: support contenteditable
    throw new Error('clear currently only supports input and textarea elements.');
  }

  if ((0, _utils.isDisabled)(element)) {
    return;
  } // TODO: track the selection range ourselves so we don't have to do this input "type" trickery
  // just like cypress does: https://github.com/cypress-io/cypress/blob/8d7f1a0bedc3c45a2ebf1ff50324b34129fdc683/packages/driver/src/dom/selection.ts#L16-L37


  const elementType = element.type;

  if (elementType !== 'textarea') {
    // setSelectionRange is not supported on certain types of inputs, e.g. "number" or "email"
    ;
    element.type = 'text';
  }

  (0, _type.type)(element, '{selectall}{del}', {
    delay: 0,
    initialSelectionStart: (_element$selectionSta = element.selectionStart) != null ? _element$selectionSta :
    /* istanbul ignore next */
    undefined,
    initialSelectionEnd: (_element$selectionEnd = element.selectionEnd) != null ? _element$selectionEnd :
    /* istanbul ignore next */
    undefined
  });

  if (elementType !== 'textarea') {
    ;
    element.type = elementType;
  }
}
},{"./type":57,"./utils":76}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.click = click;
exports.dblClick = dblClick;

var _dom = require("@testing-library/dom");

var _utils = require("./utils");

var _hover = require("./hover");

var _blur = require("./blur");

var _focus = require("./focus");

function getPreviouslyFocusedElement(element) {
  const focusedElement = element.ownerDocument.activeElement;
  const wasAnotherElementFocused = focusedElement && focusedElement !== element.ownerDocument.body && focusedElement !== element;
  return wasAnotherElementFocused ? focusedElement : null;
}

function clickLabel(label, init, {
  clickCount
}) {
  if ((0, _utils.isLabelWithInternallyDisabledControl)(label)) return;

  _dom.fireEvent.pointerDown(label, init);

  _dom.fireEvent.mouseDown(label, (0, _utils.getMouseEventOptions)('mousedown', init, clickCount));

  _dom.fireEvent.pointerUp(label, init);

  _dom.fireEvent.mouseUp(label, (0, _utils.getMouseEventOptions)('mouseup', init, clickCount));

  fireClick(label, (0, _utils.getMouseEventOptions)('click', init, clickCount)); // clicking the label will trigger a click of the label.control
  // however, it will not focus the label.control so we have to do it
  // ourselves.

  if (label.control) (0, _focus.focus)(label.control);
}

function clickBooleanElement(element, init, {
  clickCount
}) {
  _dom.fireEvent.pointerDown(element, init);

  if (!element.disabled) {
    _dom.fireEvent.mouseDown(element, (0, _utils.getMouseEventOptions)('mousedown', init, clickCount));
  }

  (0, _focus.focus)(element);

  _dom.fireEvent.pointerUp(element, init);

  if (!element.disabled) {
    _dom.fireEvent.mouseUp(element, (0, _utils.getMouseEventOptions)('mouseup', init, clickCount));

    fireClick(element, (0, _utils.getMouseEventOptions)('click', init, clickCount));
  }
}

function clickElement(element, init, {
  clickCount
}) {
  const previousElement = getPreviouslyFocusedElement(element);

  _dom.fireEvent.pointerDown(element, init);

  if (!(0, _utils.isDisabled)(element)) {
    const continueDefaultHandling = _dom.fireEvent.mouseDown(element, (0, _utils.getMouseEventOptions)('mousedown', init, clickCount));

    if (continueDefaultHandling) {
      const closestFocusable = findClosest(element, _utils.isFocusable);

      if (previousElement && !closestFocusable) {
        (0, _blur.blur)(previousElement);
      } else if (closestFocusable) {
        (0, _focus.focus)(closestFocusable);
      }
    }
  }

  _dom.fireEvent.pointerUp(element, init);

  if (!(0, _utils.isDisabled)(element)) {
    _dom.fireEvent.mouseUp(element, (0, _utils.getMouseEventOptions)('mouseup', init, clickCount));

    fireClick(element, (0, _utils.getMouseEventOptions)('click', init, clickCount));
    const parentLabel = element.closest('label');
    if (parentLabel != null && parentLabel.control) (0, _focus.focus)(parentLabel.control);
  }
}

function findClosest(element, callback) {
  let el = element;

  do {
    if (callback(el)) {
      return el;
    }

    el = el.parentElement;
  } while (el && el !== element.ownerDocument.body);

  return undefined;
}

function click(element, init, {
  skipHover = false,
  clickCount = 0,
  skipPointerEventsCheck = false
} = {}) {
  if (!skipPointerEventsCheck && !(0, _utils.hasPointerEvents)(element)) {
    throw new Error('unable to click element as it has or inherits pointer-events set to "none".');
  } // We just checked for `pointerEvents`. We can always skip this one in `hover`.


  if (!skipHover) (0, _hover.hover)(element, init, {
    skipPointerEventsCheck: true
  });

  if ((0, _utils.isElementType)(element, 'label')) {
    clickLabel(element, init, {
      clickCount
    });
  } else if ((0, _utils.isElementType)(element, 'input')) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      clickBooleanElement(element, init, {
        clickCount
      });
    } else {
      clickElement(element, init, {
        clickCount
      });
    }
  } else {
    clickElement(element, init, {
      clickCount
    });
  }
}

function fireClick(element, mouseEventOptions) {
  if (mouseEventOptions.button === 2) {
    _dom.fireEvent.contextMenu(element, mouseEventOptions);
  } else {
    _dom.fireEvent.click(element, mouseEventOptions);
  }
}

function dblClick(element, init, {
  skipPointerEventsCheck = false
} = {}) {
  if (!skipPointerEventsCheck && !(0, _utils.hasPointerEvents)(element)) {
    throw new Error('unable to double-click element as it has or inherits pointer-events set to "none".');
  }

  (0, _hover.hover)(element, init, {
    skipPointerEventsCheck
  });
  click(element, init, {
    skipHover: true,
    clickCount: 0,
    skipPointerEventsCheck
  });
  click(element, init, {
    skipHover: true,
    clickCount: 1,
    skipPointerEventsCheck
  });

  _dom.fireEvent.dblClick(element, (0, _utils.getMouseEventOptions)('dblclick', init, 2));
}
},{"./blur":32,"./focus":35,"./hover":36,"./utils":76,"@testing-library/dom":11}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.focus = focus;

var _utils = require("./utils");

function focus(element) {
  if (!(0, _utils.isFocusable)(element)) return;
  const isAlreadyActive = (0, _utils.getActiveElement)(element.ownerDocument) === element;
  if (isAlreadyActive) return;
  (0, _utils.eventWrapper)(() => element.focus());
}
},{"./utils":76}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hover = hover;
exports.unhover = unhover;

var _dom = require("@testing-library/dom");

var _utils = require("./utils");

// includes `element`
function getParentElements(element) {
  const parentElements = [element];
  let currentElement = element;

  while ((currentElement = currentElement.parentElement) != null) {
    parentElements.push(currentElement);
  }

  return parentElements;
}

function hover(element, init, {
  skipPointerEventsCheck = false
} = {}) {
  if (!skipPointerEventsCheck && !(0, _utils.hasPointerEvents)(element)) {
    throw new Error('unable to hover element as it has or inherits pointer-events set to "none".');
  }

  if ((0, _utils.isLabelWithInternallyDisabledControl)(element)) return;
  const parentElements = getParentElements(element).reverse();

  _dom.fireEvent.pointerOver(element, init);

  for (const el of parentElements) {
    _dom.fireEvent.pointerEnter(el, init);
  }

  if (!(0, _utils.isDisabled)(element)) {
    _dom.fireEvent.mouseOver(element, (0, _utils.getMouseEventOptions)('mouseover', init));

    for (const el of parentElements) {
      _dom.fireEvent.mouseEnter(el, (0, _utils.getMouseEventOptions)('mouseenter', init));
    }
  }

  _dom.fireEvent.pointerMove(element, init);

  if (!(0, _utils.isDisabled)(element)) {
    _dom.fireEvent.mouseMove(element, (0, _utils.getMouseEventOptions)('mousemove', init));
  }
}

function unhover(element, init, {
  skipPointerEventsCheck = false
} = {}) {
  if (!skipPointerEventsCheck && !(0, _utils.hasPointerEvents)(element)) {
    throw new Error('unable to unhover element as it has or inherits pointer-events set to "none".');
  }

  if ((0, _utils.isLabelWithInternallyDisabledControl)(element)) return;
  const parentElements = getParentElements(element);

  _dom.fireEvent.pointerMove(element, init);

  if (!(0, _utils.isDisabled)(element)) {
    _dom.fireEvent.mouseMove(element, (0, _utils.getMouseEventOptions)('mousemove', init));
  }

  _dom.fireEvent.pointerOut(element, init);

  for (const el of parentElements) {
    _dom.fireEvent.pointerLeave(el, init);
  }

  if (!(0, _utils.isDisabled)(element)) {
    _dom.fireEvent.mouseOut(element, (0, _utils.getMouseEventOptions)('mouseout', init));

    for (const el of parentElements) {
      _dom.fireEvent.mouseLeave(el, (0, _utils.getMouseEventOptions)('mouseleave', init));
    }
  }
}
},{"./utils":76,"@testing-library/dom":11}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
Object.defineProperty(exports, "specialChars", {
  enumerable: true,
  get: function () {
    return _keyboard.specialCharMap;
  }
});

var _click = require("./click");

var _type = require("./type");

var _clear = require("./clear");

var _tab = require("./tab");

var _hover = require("./hover");

var _upload = require("./upload");

var _selectOptions = require("./select-options");

var _paste = require("./paste");

var _keyboard = require("./keyboard");

const userEvent = {
  click: _click.click,
  dblClick: _click.dblClick,
  type: _type.type,
  clear: _clear.clear,
  tab: _tab.tab,
  hover: _hover.hover,
  unhover: _hover.unhover,
  upload: _upload.upload,
  selectOptions: _selectOptions.selectOptions,
  deselectOptions: _selectOptions.deselectOptions,
  paste: _paste.paste,
  keyboard: _keyboard.keyboard
};
var _default = userEvent;
exports.default = _default;
},{"./clear":33,"./click":34,"./hover":36,"./keyboard":40,"./paste":54,"./select-options":55,"./tab":56,"./type":57,"./upload":59}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getKeyEventProps = getKeyEventProps;
exports.getMouseEventProps = getMouseEventProps;

function getKeyEventProps(keyDef, state) {
  var _keyDef$keyCode, _keyDef$key;

  return {
    key: keyDef.key,
    code: keyDef.code,
    altKey: state.modifiers.alt,
    ctrlKey: state.modifiers.ctrl,
    metaKey: state.modifiers.meta,
    shiftKey: state.modifiers.shift,

    /** @deprecated use code instead */
    keyCode: (_keyDef$keyCode = keyDef.keyCode) != null ? _keyDef$keyCode : // istanbul ignore next
    ((_keyDef$key = keyDef.key) == null ? void 0 : _keyDef$key.length) === 1 ? keyDef.key.charCodeAt(0) : undefined
  };
}

function getMouseEventProps(state) {
  return {
    altKey: state.modifiers.alt,
    ctrlKey: state.modifiers.ctrl,
    metaKey: state.modifiers.meta,
    shiftKey: state.modifiers.shift
  };
}
},{}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNextKeyDef = getNextKeyDef;
var bracketDict;

(function (bracketDict) {
  bracketDict["{"] = "}";
  bracketDict["["] = "]";
})(bracketDict || (bracketDict = {}));

var legacyModifiers;

(function (legacyModifiers) {
  legacyModifiers["alt"] = "alt";
  legacyModifiers["ctrl"] = "ctrl";
  legacyModifiers["meta"] = "meta";
  legacyModifiers["shift"] = "shift";
})(legacyModifiers || (legacyModifiers = {}));

var legacyKeyMap;
/**
 * Get the next key from keyMap
 *
 * Keys can be referenced by `{key}` or `{special}` as well as physical locations per `[code]`.
 * Everything else will be interpreted as a typed character - e.g. `a`.
 * Brackets `{` and `[` can be escaped by doubling - e.g. `foo[[bar` translates to `foo[bar`.
 * Keeping the key pressed can be written as `{key>}`.
 * When keeping the key pressed you can choose how long (how many keydown and keypress) the key is pressed `{key>3}`.
 * You can then release the key per `{key>3/}` or keep it pressed and continue with the next key.
 * Modifiers like `{shift}` imply being kept pressed. This can be turned of per `{shift/}`.
 */

(function (legacyKeyMap) {
  legacyKeyMap["ctrl"] = "Control";
  legacyKeyMap["del"] = "Delete";
  legacyKeyMap["esc"] = "Escape";
  legacyKeyMap["space"] = " ";
})(legacyKeyMap || (legacyKeyMap = {}));

function getNextKeyDef(text, options) {
  var _options$keyboardMap$;

  const {
    type,
    descriptor,
    consumedLength,
    releasePrevious,
    releaseSelf,
    repeat
  } = readNextDescriptor(text);
  const keyDef = (_options$keyboardMap$ = options.keyboardMap.find(def => {
    if (type === '[') {
      var _def$code;

      return ((_def$code = def.code) == null ? void 0 : _def$code.toLowerCase()) === descriptor.toLowerCase();
    } else if (type === '{') {
      var _def$key;

      const key = mapLegacyKey(descriptor);
      return ((_def$key = def.key) == null ? void 0 : _def$key.toLowerCase()) === key.toLowerCase();
    }

    return def.key === descriptor;
  })) != null ? _options$keyboardMap$ : {
    key: 'Unknown',
    code: 'Unknown',
    [type === '[' ? 'code' : 'key']: descriptor
  };
  return {
    keyDef,
    consumedLength,
    releasePrevious,
    releaseSelf,
    repeat
  };
}

function readNextDescriptor(text) {
  let pos = 0;
  const startBracket = text[pos] in bracketDict ? text[pos] : '';
  pos += startBracket.length; // `foo{{bar` is an escaped char at position 3,
  // but `foo{{{>5}bar` should be treated as `{` pressed down for 5 keydowns.

  const startBracketRepeated = startBracket ? text.match(new RegExp(`^\\${startBracket}+`))[0].length : 0;
  const isEscapedChar = startBracketRepeated === 2 || startBracket === '{' && startBracketRepeated > 3;
  const type = isEscapedChar ? '' : startBracket;
  return {
    type,
    ...(type === '' ? readPrintableChar(text, pos) : readTag(text, pos, type))
  };
}

function readPrintableChar(text, pos) {
  const descriptor = text[pos];
  assertDescriptor(descriptor, text, pos);
  pos += descriptor.length;
  return {
    consumedLength: pos,
    descriptor,
    releasePrevious: false,
    releaseSelf: true,
    repeat: 1
  };
}

function readTag(text, pos, startBracket) {
  var _text$slice$match, _text$slice$match$, _text$slice$match2;

  const releasePreviousModifier = text[pos] === '/' ? '/' : '';
  pos += releasePreviousModifier.length;
  const descriptor = (_text$slice$match = text.slice(pos).match(/^\w+/)) == null ? void 0 : _text$slice$match[0];
  assertDescriptor(descriptor, text, pos);
  pos += descriptor.length;
  const repeatModifier = (_text$slice$match$ = (_text$slice$match2 = text.slice(pos).match(/^>\d+/)) == null ? void 0 : _text$slice$match2[0]) != null ? _text$slice$match$ : '';
  pos += repeatModifier.length;
  const releaseSelfModifier = text[pos] === '/' || !repeatModifier && text[pos] === '>' ? text[pos] : '';
  pos += releaseSelfModifier.length;
  const expectedEndBracket = bracketDict[startBracket];
  const endBracket = text[pos] === expectedEndBracket ? expectedEndBracket : '';

  if (!endBracket) {
    throw new Error(getErrorMessage([!repeatModifier && 'repeat modifier', !releaseSelfModifier && 'release modifier', `"${expectedEndBracket}"`].filter(Boolean).join(' or '), text[pos], text));
  }

  pos += endBracket.length;
  return {
    consumedLength: pos,
    descriptor,
    releasePrevious: !!releasePreviousModifier,
    repeat: repeatModifier ? Math.max(Number(repeatModifier.substr(1)), 1) : 1,
    releaseSelf: hasReleaseSelf(startBracket, descriptor, releaseSelfModifier, repeatModifier)
  };
}

function assertDescriptor(descriptor, text, pos) {
  if (!descriptor) {
    throw new Error(getErrorMessage('key descriptor', text[pos], text));
  }
}

function getEnumValue(f, key) {
  return f[key];
}

function hasReleaseSelf(startBracket, descriptor, releaseSelfModifier, repeatModifier) {
  if (releaseSelfModifier) {
    return releaseSelfModifier === '/';
  }

  if (repeatModifier) {
    return false;
  }

  if (startBracket === '{' && getEnumValue(legacyModifiers, descriptor.toLowerCase())) {
    return false;
  }

  return true;
}

function mapLegacyKey(descriptor) {
  var _getEnumValue;

  return (_getEnumValue = getEnumValue(legacyKeyMap, descriptor)) != null ? _getEnumValue : descriptor;
}

function getErrorMessage(expected, found, text) {
  return `Expected ${expected} but found "${found != null ? found : ''}" in "${text}"
    See https://github.com/testing-library/user-event/blob/main/README.md#keyboardtext-options
    for more information about how userEvent parses your input.`;
}
},{}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyboard = keyboard;
exports.keyboardImplementationWrapper = keyboardImplementationWrapper;
Object.defineProperty(exports, "specialCharMap", {
  enumerable: true,
  get: function () {
    return _specialCharMap.specialCharMap;
  }
});

var _dom = require("@testing-library/dom");

var _keyboardImplementation = require("./keyboardImplementation");

var _keyMap = require("./keyMap");

var _specialCharMap = require("./specialCharMap");

function keyboard(text, options) {
  var _options$delay;

  const {
    promise,
    state
  } = keyboardImplementationWrapper(text, options);

  if (((_options$delay = options == null ? void 0 : options.delay) != null ? _options$delay : 0) > 0) {
    return (0, _dom.getConfig)().asyncWrapper(() => promise.then(() => state));
  } else {
    // prevent users from dealing with UnhandledPromiseRejectionWarning in sync call
    promise.catch(console.error);
    return state;
  }
}

function keyboardImplementationWrapper(text, config = {}) {
  const {
    keyboardState: state = createKeyboardState(),
    delay = 0,
    document: doc = document,
    autoModify = false,
    keyboardMap = _keyMap.defaultKeyMap
  } = config;
  const options = {
    delay,
    document: doc,
    autoModify,
    keyboardMap
  };
  return {
    promise: (0, _keyboardImplementation.keyboardImplementation)(text, options, state),
    state,
    releaseAllKeys: () => (0, _keyboardImplementation.releaseAllKeys)(options, state)
  };
}

function createKeyboardState() {
  return {
    activeElement: null,
    pressed: [],
    carryChar: '',
    modifiers: {
      alt: false,
      caps: false,
      ctrl: false,
      meta: false,
      shift: false
    }
  };
}
},{"./keyMap":41,"./keyboardImplementation":42,"./specialCharMap":52,"@testing-library/dom":11}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultKeyMap = void 0;

var _types = require("./types");

/**
 * Mapping for a default US-104-QWERTY keyboard
 */
const defaultKeyMap = [// alphanumeric keys
...'0123456789'.split('').map(c => ({
  code: `Digit${c}`,
  key: c
})), ...')!@#$%^&*('.split('').map((c, i) => ({
  code: `Digit${i}`,
  key: c,
  shiftKey: true
})), ...'abcdefghijklmnopqrstuvwxyz'.split('').map(c => ({
  code: `Key${c.toUpperCase()}`,
  key: c
})), ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => ({
  code: `Key${c}`,
  key: c,
  shiftKey: true
})), // alphanumeric block - functional
{
  code: 'Space',
  key: ' '
}, {
  code: 'AltLeft',
  key: 'Alt',
  location: _types.DOM_KEY_LOCATION.LEFT,
  keyCode: 18
}, {
  code: 'AltRight',
  key: 'Alt',
  location: _types.DOM_KEY_LOCATION.RIGHT,
  keyCode: 18
}, {
  code: 'ShiftLeft',
  key: 'Shift',
  location: _types.DOM_KEY_LOCATION.LEFT,
  keyCode: 16
}, {
  code: 'ShiftRight',
  key: 'Shift',
  location: _types.DOM_KEY_LOCATION.RIGHT,
  keyCode: 16
}, {
  code: 'ControlLeft',
  key: 'Control',
  location: _types.DOM_KEY_LOCATION.LEFT,
  keyCode: 17
}, {
  code: 'ControlRight',
  key: 'Control',
  location: _types.DOM_KEY_LOCATION.RIGHT,
  keyCode: 17
}, {
  code: 'MetaLeft',
  key: 'Meta',
  location: _types.DOM_KEY_LOCATION.LEFT,
  keyCode: 93
}, {
  code: 'MetaRight',
  key: 'Meta',
  location: _types.DOM_KEY_LOCATION.RIGHT,
  keyCode: 93
}, {
  code: 'OSLeft',
  key: 'OS',
  location: _types.DOM_KEY_LOCATION.LEFT,
  keyCode: 91
}, {
  code: 'OSRight',
  key: 'OS',
  location: _types.DOM_KEY_LOCATION.RIGHT,
  keyCode: 91
}, {
  code: 'CapsLock',
  key: 'CapsLock',
  keyCode: 20
}, {
  code: 'Backspace',
  key: 'Backspace',
  keyCode: 8
}, {
  code: 'Enter',
  key: 'Enter',
  keyCode: 13
}, // function
{
  code: 'Escape',
  key: 'Escape',
  keyCode: 27
}, // arrows
{
  code: 'ArrowUp',
  key: 'ArrowUp',
  keyCode: 38
}, {
  code: 'ArrowDown',
  key: 'ArrowDown',
  keyCode: 40
}, {
  code: 'ArrowLeft',
  key: 'ArrowLeft',
  keyCode: 37
}, {
  code: 'ArrowRight',
  key: 'ArrowRight',
  keyCode: 39
}, // control pad
{
  code: 'Home',
  key: 'Home',
  keyCode: 36
}, {
  code: 'End',
  key: 'End',
  keyCode: 35
}, {
  code: 'Delete',
  key: 'Delete',
  keyCode: 46
}, {
  code: 'PageUp',
  key: 'PageUp',
  keyCode: 33
}, {
  code: 'PageDown',
  key: 'PageDown',
  keyCode: 34
} // TODO: add mappings
];
exports.defaultKeyMap = defaultKeyMap;
},{"./types":53}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyboardImplementation = keyboardImplementation;
exports.releaseAllKeys = releaseAllKeys;

var _dom = require("@testing-library/dom");

var _utils = require("../utils");

var _getNextKeyDef = require("./getNextKeyDef");

var plugins = _interopRequireWildcard(require("./plugins"));

var _getEventProps = require("./getEventProps");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function keyboardImplementation(text, options, state) {
  var _state$repeatKey;

  const {
    document
  } = options;

  const getCurrentElement = () => getActive(document);

  const {
    keyDef,
    consumedLength,
    releasePrevious,
    releaseSelf,
    repeat
  } = (_state$repeatKey = state.repeatKey) != null ? _state$repeatKey : (0, _getNextKeyDef.getNextKeyDef)(text, options);
  const replace = applyPlugins(plugins.replaceBehavior, keyDef, getCurrentElement(), options, state);

  if (!replace) {
    const pressed = state.pressed.find(p => p.keyDef === keyDef); // Release the key automatically if it was pressed before.
    // Do not release the key on iterations on `state.repeatKey`.

    if (pressed && !state.repeatKey) {
      keyup(keyDef, getCurrentElement, options, state, pressed.unpreventedDefault);
    }

    if (!releasePrevious) {
      const unpreventedDefault = keydown(keyDef, getCurrentElement, options, state);

      if (unpreventedDefault && hasKeyPress(keyDef, state)) {
        keypress(keyDef, getCurrentElement, options, state);
      } // Release the key only on the last iteration on `state.repeatKey`.


      if (releaseSelf && repeat <= 1) {
        keyup(keyDef, getCurrentElement, options, state, unpreventedDefault);
      }
    }
  }

  if (repeat > 1) {
    state.repeatKey = {
      // don't consume again on the next iteration
      consumedLength: 0,
      keyDef,
      releasePrevious,
      releaseSelf,
      repeat: repeat - 1
    };
  } else {
    delete state.repeatKey;
  }

  if (text.length > consumedLength || repeat > 1) {
    if (options.delay > 0) {
      await (0, _utils.wait)(options.delay);
    }

    return keyboardImplementation(text.slice(consumedLength), options, state);
  }

  return void undefined;
}

function getActive(document) {
  var _getActiveElement;

  return (_getActiveElement = (0, _utils.getActiveElement)(document)) != null ? _getActiveElement :
  /* istanbul ignore next */
  document.body;
}

function releaseAllKeys(options, state) {
  const getCurrentElement = () => getActive(options.document);

  for (const k of state.pressed) {
    keyup(k.keyDef, getCurrentElement, options, state, k.unpreventedDefault);
  }
}

function keydown(keyDef, getCurrentElement, options, state) {
  const element = getCurrentElement(); // clear carried characters when focus is moved

  if (element !== state.activeElement) {
    state.carryValue = undefined;
    state.carryChar = '';
  }

  state.activeElement = element;
  applyPlugins(plugins.preKeydownBehavior, keyDef, element, options, state);

  const unpreventedDefault = _dom.fireEvent.keyDown(element, (0, _getEventProps.getKeyEventProps)(keyDef, state));

  state.pressed.push({
    keyDef,
    unpreventedDefault
  });

  if (unpreventedDefault) {
    // all default behavior like keypress/submit etc is applied to the currentElement
    applyPlugins(plugins.keydownBehavior, keyDef, getCurrentElement(), options, state);
  }

  return unpreventedDefault;
}

function keypress(keyDef, getCurrentElement, options, state) {
  const element = getCurrentElement();

  const unpreventedDefault = _dom.fireEvent.keyPress(element, (0, _getEventProps.getKeyEventProps)(keyDef, state));

  if (unpreventedDefault) {
    applyPlugins(plugins.keypressBehavior, keyDef, getCurrentElement(), options, state);
  }
}

function keyup(keyDef, getCurrentElement, options, state, unprevented) {
  const element = getCurrentElement();
  applyPlugins(plugins.preKeyupBehavior, keyDef, element, options, state);

  const unpreventedDefault = _dom.fireEvent.keyUp(element, (0, _getEventProps.getKeyEventProps)(keyDef, state));

  if (unprevented && unpreventedDefault) {
    applyPlugins(plugins.keyupBehavior, keyDef, getCurrentElement(), options, state);
  }

  state.pressed = state.pressed.filter(k => k.keyDef !== keyDef);
  applyPlugins(plugins.postKeyupBehavior, keyDef, element, options, state);
}

function applyPlugins(pluginCollection, keyDef, element, options, state) {
  const plugin = pluginCollection.find(p => p.matches(keyDef, element, options, state));

  if (plugin) {
    plugin.handle(keyDef, element, options, state);
  }

  return !!plugin;
}

function hasKeyPress(keyDef, state) {
  var _keyDef$key;

  return (((_keyDef$key = keyDef.key) == null ? void 0 : _keyDef$key.length) === 1 || keyDef.key === 'Enter') && !state.modifiers.ctrl && !state.modifiers.alt;
}
},{"../utils":76,"./getEventProps":38,"./getNextKeyDef":39,"./plugins":47,"@testing-library/dom":11}],43:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keydownBehavior = void 0;

var _utils = require("../../utils");

/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-arrowpad-section
 */
const keydownBehavior = [{
  // TODO: implement for contentEditable
  matches: (keyDef, element) => (keyDef.key === 'ArrowLeft' || keyDef.key === 'ArrowRight') && (0, _utils.isElementType)(element, ['input', 'textarea']),
  handle: (keyDef, element) => {
    var _ref;

    const {
      selectionStart,
      selectionEnd
    } = (0, _utils.getSelectionRange)(element);
    const direction = keyDef.key === 'ArrowLeft' ? -1 : 1;
    const newPos = (_ref = selectionStart === selectionEnd ? (selectionStart != null ? selectionStart :
    /* istanbul ignore next */
    0) + direction : direction < 0 ? selectionStart : selectionEnd) != null ? _ref :
    /* istanbul ignore next */
    0;
    (0, _utils.setSelectionRange)(element, newPos, newPos);
  }
}];
exports.keydownBehavior = keydownBehavior;
},{"../../utils":76}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keypressBehavior = void 0;

var _dom = require("@testing-library/dom");

var _shared = require("../shared");

var _utils = require("../../utils");

/**
 * This file should cover the behavior for keys that produce character input
 */
const keypressBehavior = [{
  matches: (keyDef, element) => {
    var _keyDef$key;

    return ((_keyDef$key = keyDef.key) == null ? void 0 : _keyDef$key.length) === 1 && (0, _utils.isElementType)(element, 'input', {
      type: 'time',
      readOnly: false
    });
  },
  handle: (keyDef, element, options, state) => {
    var _state$carryValue;

    let newEntry = keyDef.key;
    const textToBeTyped = ((_state$carryValue = state.carryValue) != null ? _state$carryValue : '') + newEntry;
    const timeNewEntry = (0, _utils.buildTimeValue)(textToBeTyped);

    if ((0, _utils.isValidInputTimeValue)(element, timeNewEntry)) {
      newEntry = timeNewEntry;
    }

    const {
      newValue,
      newSelectionStart
    } = (0, _utils.calculateNewValue)(newEntry, element);
    const prevValue = (0, _utils.getValue)(element); // this check was provided by fireInputEventIfNeeded
    // TODO: verify if it is even needed by this handler

    if (prevValue !== newValue) {
      (0, _shared.fireInputEvent)(element, {
        newValue,
        newSelectionStart,
        eventOverrides: {
          data: keyDef.key,
          inputType: 'insertText'
        }
      });
    }

    (0, _shared.fireChangeForInputTimeIfValid)(element, prevValue, timeNewEntry);
    state.carryValue = textToBeTyped;
  }
}, {
  matches: (keyDef, element) => {
    var _keyDef$key2;

    return ((_keyDef$key2 = keyDef.key) == null ? void 0 : _keyDef$key2.length) === 1 && (0, _utils.isElementType)(element, 'input', {
      type: 'date',
      readOnly: false
    });
  },
  handle: (keyDef, element, options, state) => {
    var _state$carryValue2;

    let newEntry = keyDef.key;
    const textToBeTyped = ((_state$carryValue2 = state.carryValue) != null ? _state$carryValue2 : '') + newEntry;
    const isValidToBeTyped = (0, _utils.isValidDateValue)(element, textToBeTyped);

    if (isValidToBeTyped) {
      newEntry = textToBeTyped;
    }

    const {
      newValue,
      newSelectionStart
    } = (0, _utils.calculateNewValue)(newEntry, element);
    const prevValue = (0, _utils.getValue)(element); // this check was provided by fireInputEventIfNeeded
    // TODO: verify if it is even needed by this handler

    if (prevValue !== newValue) {
      (0, _shared.fireInputEvent)(element, {
        newValue,
        newSelectionStart,
        eventOverrides: {
          data: keyDef.key,
          inputType: 'insertText'
        }
      });
    }

    if (isValidToBeTyped) {
      _dom.fireEvent.change(element, {
        target: {
          value: textToBeTyped
        }
      });
    }

    state.carryValue = textToBeTyped;
  }
}, {
  matches: (keyDef, element) => {
    var _keyDef$key3;

    return ((_keyDef$key3 = keyDef.key) == null ? void 0 : _keyDef$key3.length) === 1 && (0, _utils.isElementType)(element, 'input', {
      type: 'number',
      readOnly: false
    });
  },
  handle: (keyDef, element, options, state) => {
    var _ref, _state$carryValue3, _newValue$match, _newValue$match2;

    if (!/[\d.\-e]/.test(keyDef.key)) {
      return;
    }

    const oldValue = (_ref = (_state$carryValue3 = state.carryValue) != null ? _state$carryValue3 : (0, _utils.getValue)(element)) != null ? _ref :
    /* istanbul ignore next */
    '';
    const {
      newValue,
      newSelectionStart
    } = (0, _utils.calculateNewValue)(keyDef.key, element, oldValue); // the browser allows some invalid input but not others
    // it allows up to two '-' at any place before any 'e' or one directly following 'e'
    // it allows one '.' at any place before e

    const valueParts = newValue.split('e', 2);

    if (Number((_newValue$match = newValue.match(/-/g)) == null ? void 0 : _newValue$match.length) > 2 || Number((_newValue$match2 = newValue.match(/\./g)) == null ? void 0 : _newValue$match2.length) > 1 || valueParts[1] && !/^-?\d*$/.test(valueParts[1])) {
      return;
    }

    (0, _shared.fireInputEvent)(element, {
      newValue,
      newSelectionStart,
      eventOverrides: {
        data: keyDef.key,
        inputType: 'insertText'
      }
    });
    const appliedValue = (0, _utils.getValue)(element);

    if (appliedValue === newValue) {
      state.carryValue = undefined;
    } else {
      state.carryValue = newValue;
    }
  }
}, {
  matches: (keyDef, element) => {
    var _keyDef$key4;

    return ((_keyDef$key4 = keyDef.key) == null ? void 0 : _keyDef$key4.length) === 1 && ((0, _utils.isElementType)(element, ['input', 'textarea'], {
      readOnly: false
    }) && !(0, _utils.isClickableInput)(element) || (0, _utils.isContentEditable)(element)) && (0, _utils.getSpaceUntilMaxLength)(element) !== 0;
  },
  handle: (keyDef, element) => {
    const {
      newValue,
      newSelectionStart
    } = (0, _utils.calculateNewValue)(keyDef.key, element);
    (0, _shared.fireInputEvent)(element, {
      newValue,
      newSelectionStart,
      eventOverrides: {
        data: keyDef.key,
        inputType: 'insertText'
      }
    });
  }
}, {
  matches: (keyDef, element) => keyDef.key === 'Enter' && ((0, _utils.isElementType)(element, 'textarea', {
    readOnly: false
  }) || (0, _utils.isContentEditable)(element)) && (0, _utils.getSpaceUntilMaxLength)(element) !== 0,
  handle: (keyDef, element, options, state) => {
    const {
      newValue,
      newSelectionStart
    } = (0, _utils.calculateNewValue)('\n', element);
    const inputType = (0, _utils.isContentEditable)(element) && !state.modifiers.shift ? 'insertParagraph' : 'insertLineBreak';
    (0, _shared.fireInputEvent)(element, {
      newValue,
      newSelectionStart,
      eventOverrides: {
        inputType
      }
    });
  }
}];
exports.keypressBehavior = keypressBehavior;
},{"../../utils":76,"../shared":51,"@testing-library/dom":11}],45:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keydownBehavior = void 0;

var _utils = require("../../utils");

var _shared = require("../shared");

/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-controlpad-section
 */
const keydownBehavior = [{
  matches: (keyDef, element) => (keyDef.key === 'Home' || keyDef.key === 'End') && ((0, _utils.isElementType)(element, ['input', 'textarea']) || (0, _utils.isContentEditable)(element)),
  handle: (keyDef, element) => {
    // This could probably been improved by collapsing a selection range
    if (keyDef.key === 'Home') {
      (0, _utils.setSelectionRange)(element, 0, 0);
    } else {
      var _getValue$length, _getValue;

      const newPos = (_getValue$length = (_getValue = (0, _utils.getValue)(element)) == null ? void 0 : _getValue.length) != null ? _getValue$length :
      /* istanbul ignore next */
      0;
      (0, _utils.setSelectionRange)(element, newPos, newPos);
    }
  }
}, {
  matches: (keyDef, element) => (keyDef.key === 'PageUp' || keyDef.key === 'PageDown') && (0, _utils.isElementType)(element, ['input']),
  handle: (keyDef, element) => {
    // This could probably been improved by collapsing a selection range
    if (keyDef.key === 'PageUp') {
      (0, _utils.setSelectionRange)(element, 0, 0);
    } else {
      var _getValue$length2, _getValue2;

      const newPos = (_getValue$length2 = (_getValue2 = (0, _utils.getValue)(element)) == null ? void 0 : _getValue2.length) != null ? _getValue$length2 :
      /* istanbul ignore next */
      0;
      (0, _utils.setSelectionRange)(element, newPos, newPos);
    }
  }
}, {
  matches: (keyDef, element) => keyDef.key === 'Delete' && (0, _utils.isEditable)(element) && !(0, _utils.isCursorAtEnd)(element),
  handle: (keDef, element, options, state) => {
    const {
      newValue,
      newSelectionStart
    } = (0, _utils.calculateNewValue)('', element, state.carryValue, undefined, 'forward');
    (0, _shared.fireInputEvent)(element, {
      newValue,
      newSelectionStart,
      eventOverrides: {
        inputType: 'deleteContentForward'
      }
    });
    (0, _shared.carryValue)(element, state, newValue);
  }
}];
exports.keydownBehavior = keydownBehavior;
},{"../../utils":76,"../shared":51}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preKeyupBehavior = exports.preKeydownBehavior = exports.postKeyupBehavior = exports.keyupBehavior = exports.keypressBehavior = exports.keydownBehavior = void 0;

var _dom = require("@testing-library/dom");

var _utils = require("../../utils");

var _getEventProps = require("../getEventProps");

var _shared = require("../shared");

/**
 * This file should contain behavior for functional keys as described here:
 * https://w3c.github.io/uievents-code/#key-alphanumeric-functional
 */
const modifierKeys = {
  Alt: 'alt',
  Control: 'ctrl',
  Shift: 'shift',
  Meta: 'meta'
};
const preKeydownBehavior = [// modifierKeys switch on the modifier BEFORE the keydown event
...Object.entries(modifierKeys).map(([key, modKey]) => ({
  matches: keyDef => keyDef.key === key,
  handle: (keyDef, element, options, state) => {
    state.modifiers[modKey] = true;
  }
})), // AltGraph produces an extra keydown for Control
// The modifier does not change
{
  matches: keyDef => keyDef.key === 'AltGraph',
  handle: (keyDef, element, options, state) => {
    var _options$keyboardMap$;

    const ctrlKeyDef = (_options$keyboardMap$ = options.keyboardMap.find(k => k.key === 'Control')) != null ? _options$keyboardMap$ :
    /* istanbul ignore next */
    {
      key: 'Control',
      code: 'Control'
    };

    _dom.fireEvent.keyDown(element, (0, _getEventProps.getKeyEventProps)(ctrlKeyDef, state));
  }
}];
exports.preKeydownBehavior = preKeydownBehavior;
const keydownBehavior = [{
  matches: keyDef => keyDef.key === 'CapsLock',
  handle: (keyDef, element, options, state) => {
    state.modifiers.caps = !state.modifiers.caps;
  }
}, {
  matches: (keyDef, element) => keyDef.key === 'Backspace' && (0, _utils.isEditable)(element) && !(0, _utils.isCursorAtStart)(element),
  handle: (keyDef, element, options, state) => {
    const {
      newValue,
      newSelectionStart
    } = (0, _utils.calculateNewValue)('', element, state.carryValue, undefined, 'backward');
    (0, _shared.fireInputEvent)(element, {
      newValue,
      newSelectionStart,
      eventOverrides: {
        inputType: 'deleteContentBackward'
      }
    });
    (0, _shared.carryValue)(element, state, newValue);
  }
}];
exports.keydownBehavior = keydownBehavior;
const keypressBehavior = [{
  matches: (keyDef, element) => keyDef.key === 'Enter' && (0, _utils.isElementType)(element, 'input') && ['checkbox', 'radio'].includes(element.type),
  handle: (keyDef, element) => {
    const form = element.form;

    if ((0, _utils.hasFormSubmit)(form)) {
      _dom.fireEvent.submit(form);
    }
  }
}, {
  matches: (keyDef, element) => keyDef.key === 'Enter' && ((0, _utils.isClickableInput)(element) || // Links with href defined should handle Enter the same as a click
  (0, _utils.isElementType)(element, 'a') && Boolean(element.href)),
  handle: (keyDef, element, options, state) => {
    _dom.fireEvent.click(element, (0, _getEventProps.getMouseEventProps)(state));
  }
}, {
  matches: (keyDef, element) => keyDef.key === 'Enter' && (0, _utils.isElementType)(element, 'input'),
  handle: (keyDef, element) => {
    const form = element.form;

    if (form && (form.querySelectorAll('input').length === 1 || (0, _utils.hasFormSubmit)(form))) {
      _dom.fireEvent.submit(form);
    }
  }
}];
exports.keypressBehavior = keypressBehavior;
const preKeyupBehavior = [// modifierKeys switch off the modifier BEFORE the keyup event
...Object.entries(modifierKeys).map(([key, modKey]) => ({
  matches: keyDef => keyDef.key === key,
  handle: (keyDef, element, options, state) => {
    state.modifiers[modKey] = false;
  }
}))];
exports.preKeyupBehavior = preKeyupBehavior;
const keyupBehavior = [{
  matches: (keyDef, element) => keyDef.key === ' ' && (0, _utils.isClickableInput)(element),
  handle: (keyDef, element, options, state) => {
    _dom.fireEvent.click(element, (0, _getEventProps.getMouseEventProps)(state));
  }
}];
exports.keyupBehavior = keyupBehavior;
const postKeyupBehavior = [// AltGraph produces an extra keyup for Control
// The modifier does not change
{
  matches: keyDef => keyDef.key === 'AltGraph',
  handle: (keyDef, element, options, state) => {
    var _options$keyboardMap$2;

    const ctrlKeyDef = (_options$keyboardMap$2 = options.keyboardMap.find(k => k.key === 'Control')) != null ? _options$keyboardMap$2 :
    /* istanbul ignore next */
    {
      key: 'Control',
      code: 'Control'
    };

    _dom.fireEvent.keyUp(element, (0, _getEventProps.getKeyEventProps)(ctrlKeyDef, state));
  }
}];
exports.postKeyupBehavior = postKeyupBehavior;
},{"../../utils":76,"../getEventProps":38,"../shared":51,"@testing-library/dom":11}],47:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceBehavior = exports.preKeyupBehavior = exports.preKeydownBehavior = exports.postKeyupBehavior = exports.keyupBehavior = exports.keypressBehavior = exports.keydownBehavior = void 0;

var _utils = require("../../utils");

var arrowKeys = _interopRequireWildcard(require("./arrow"));

var controlKeys = _interopRequireWildcard(require("./control"));

var characterKeys = _interopRequireWildcard(require("./character"));

var functionalKeys = _interopRequireWildcard(require("./functional"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const replaceBehavior = [{
  matches: (keyDef, element) => keyDef.key === 'selectall' && (0, _utils.isElementType)(element, ['input', 'textarea']),
  handle: (keyDef, element, options, state) => {
    var _state$carryValue;

    (0, _utils.setSelectionRange)(element, 0, ((_state$carryValue = state.carryValue) != null ? _state$carryValue : element.value).length);
  }
}];
exports.replaceBehavior = replaceBehavior;
const preKeydownBehavior = [...functionalKeys.preKeydownBehavior];
exports.preKeydownBehavior = preKeydownBehavior;
const keydownBehavior = [...arrowKeys.keydownBehavior, ...controlKeys.keydownBehavior, ...functionalKeys.keydownBehavior];
exports.keydownBehavior = keydownBehavior;
const keypressBehavior = [...functionalKeys.keypressBehavior, ...characterKeys.keypressBehavior];
exports.keypressBehavior = keypressBehavior;
const preKeyupBehavior = [...functionalKeys.preKeyupBehavior];
exports.preKeyupBehavior = preKeyupBehavior;
const keyupBehavior = [...functionalKeys.keyupBehavior];
exports.keyupBehavior = keyupBehavior;
const postKeyupBehavior = [...functionalKeys.postKeyupBehavior];
exports.postKeyupBehavior = postKeyupBehavior;
},{"../../utils":76,"./arrow":43,"./character":44,"./control":45,"./functional":46}],48:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.carryValue = carryValue;

var _utils = require("../../utils");

function carryValue(element, state, newValue) {
  const value = (0, _utils.getValue)(element);
  state.carryValue = value !== newValue && value === '' && (0, _utils.hasUnreliableEmptyValue)(element) ? newValue : undefined;
}
},{"../../utils":76}],49:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fireChangeForInputTimeIfValid = fireChangeForInputTimeIfValid;

var _dom = require("@testing-library/dom");

var _utils = require("../../utils");

function fireChangeForInputTimeIfValid(el, prevValue, timeNewEntry) {
  if ((0, _utils.isValidInputTimeValue)(el, timeNewEntry) && prevValue !== timeNewEntry) {
    _dom.fireEvent.change(el, {
      target: {
        value: timeNewEntry
      }
    });
  }
}
},{"../../utils":76,"@testing-library/dom":11}],50:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fireInputEvent = fireInputEvent;

var _dom = require("@testing-library/dom");

var _utils = require("../../utils");

function fireInputEvent(element, {
  newValue,
  newSelectionStart,
  eventOverrides
}) {
  // apply the changes before firing the input event, so that input handlers can access the altered dom and selection
  if ((0, _utils.isContentEditable)(element)) {
    applyNative(element, 'textContent', newValue);
  } else
    /* istanbul ignore else */
    if ((0, _utils.isElementType)(element, ['input', 'textarea'])) {
      applyNative(element, 'value', newValue);
    } else {
      // TODO: properly type guard
      throw new Error('Invalid Element');
    }

  setSelectionRangeAfterInput(element, newSelectionStart);

  _dom.fireEvent.input(element, { ...eventOverrides
  });

  setSelectionRangeAfterInputHandler(element, newValue, newSelectionStart);
}

function setSelectionRangeAfterInput(element, newSelectionStart) {
  (0, _utils.setSelectionRange)(element, newSelectionStart, newSelectionStart);
}

function setSelectionRangeAfterInputHandler(element, newValue, newSelectionStart) {
  const value = (0, _utils.getValue)(element); // don't apply this workaround on elements that don't necessarily report the visible value - e.g. number
  // TODO: this could probably be only applied when there is keyboardState.carryValue

  const isUnreliableValue = value === '' && (0, _utils.hasUnreliableEmptyValue)(element);

  if (!isUnreliableValue && value === newValue) {
    const {
      selectionStart
    } = (0, _utils.getSelectionRange)(element);

    if (selectionStart === value.length) {
      // The value was changed as expected, but the cursor was moved to the end
      // TODO: this could probably be only applied when we work around a framework setter on the element in applyNative
      (0, _utils.setSelectionRange)(element, newSelectionStart, newSelectionStart);
    }
  }
}

const initial = Symbol('initial input value/textContent');
const onBlur = Symbol('onBlur');

/**
 * React tracks the changes on element properties.
 * This workaround tries to alter the DOM element without React noticing,
 * so that it later picks up the change.
 *
 * @see https://github.com/facebook/react/blob/148f8e497c7d37a3c7ab99f01dec2692427272b1/packages/react-dom/src/client/inputValueTracking.js#L51-L104
 */
function applyNative(element, propName, propValue) {
  const descriptor = Object.getOwnPropertyDescriptor(element, propName);
  const nativeDescriptor = Object.getOwnPropertyDescriptor(element.constructor.prototype, propName);

  if (descriptor && nativeDescriptor) {
    Object.defineProperty(element, propName, nativeDescriptor);
  } // Keep track of the initial value to determine if a change event should be dispatched.
  // CONSTRAINT: We can not determine what happened between focus event and our first API call.


  if (element[initial] === undefined) {
    element[initial] = String(element[propName]);
  }

  element[propName] = propValue; // Add an event listener for the blur event to the capture phase on the window.
  // CONSTRAINT: Currently there is no cross-platform solution to unshift the event handler stack.
  // Our change event might occur after other event handlers on the blur event have been processed.

  if (!element[onBlur]) {
    var _element$ownerDocumen;

    (_element$ownerDocumen = element.ownerDocument.defaultView) == null ? void 0 : _element$ownerDocumen.addEventListener('blur', element[onBlur] = () => {
      const initV = element[initial]; // eslint-disable-next-line @typescript-eslint/no-dynamic-delete

      delete element[onBlur]; // eslint-disable-next-line @typescript-eslint/no-dynamic-delete

      delete element[initial];

      if (String(element[propName]) !== initV) {
        _dom.fireEvent.change(element);
      }
    }, {
      capture: true,
      once: true
    });
  }

  if (descriptor) {
    Object.defineProperty(element, propName, descriptor);
  }
}
},{"../../utils":76,"@testing-library/dom":11}],51:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _carryValue = require("./carryValue");

Object.keys(_carryValue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _carryValue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _carryValue[key];
    }
  });
});

var _fireChangeForInputTimeIfValid = require("./fireChangeForInputTimeIfValid");

Object.keys(_fireChangeForInputTimeIfValid).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _fireChangeForInputTimeIfValid[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _fireChangeForInputTimeIfValid[key];
    }
  });
});

var _fireInputEvent = require("./fireInputEvent");

Object.keys(_fireInputEvent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _fireInputEvent[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _fireInputEvent[key];
    }
  });
});
},{"./carryValue":48,"./fireChangeForInputTimeIfValid":49,"./fireInputEvent":50}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.specialCharMap = void 0;

/**
 * @deprecated This list of strings with special meaning is no longer necessary
 * as we've introduced a standardized way to describe any keystroke for `userEvent`.
 * @see https://testing-library.com/docs/ecosystem-user-event#keyboardtext-options
 */
const specialCharMap = {
  arrowLeft: '{arrowleft}',
  arrowRight: '{arrowright}',
  arrowDown: '{arrowdown}',
  arrowUp: '{arrowup}',
  enter: '{enter}',
  escape: '{esc}',
  delete: '{del}',
  backspace: '{backspace}',
  home: '{home}',
  end: '{end}',
  selectAll: '{selectall}',
  space: '{space}',
  whitespace: ' ',
  pageUp: '{pageUp}',
  pageDown: '{pageDown}'
};
exports.specialCharMap = specialCharMap;
},{}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DOM_KEY_LOCATION = void 0;

/**
 * @internal Do not create/alter this by yourself as this type might be subject to changes.
 */
let DOM_KEY_LOCATION;
exports.DOM_KEY_LOCATION = DOM_KEY_LOCATION;

(function (DOM_KEY_LOCATION) {
  DOM_KEY_LOCATION[DOM_KEY_LOCATION["STANDARD"] = 0] = "STANDARD";
  DOM_KEY_LOCATION[DOM_KEY_LOCATION["LEFT"] = 1] = "LEFT";
  DOM_KEY_LOCATION[DOM_KEY_LOCATION["RIGHT"] = 2] = "RIGHT";
  DOM_KEY_LOCATION[DOM_KEY_LOCATION["NUMPAD"] = 3] = "NUMPAD";
})(DOM_KEY_LOCATION || (exports.DOM_KEY_LOCATION = DOM_KEY_LOCATION = {}));
},{}],54:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.paste = paste;

var _dom = require("@testing-library/dom");

var _utils = require("./utils");

function isSupportedElement(element) {
  return (0, _utils.isElementType)(element, 'input') && Boolean(_utils.editableInputTypes[element.type]) || (0, _utils.isElementType)(element, 'textarea');
}

function paste(element, text, init, {
  initialSelectionStart,
  initialSelectionEnd
} = {}) {
  // TODO: implement for contenteditable
  if (!isSupportedElement(element)) {
    throw new TypeError(`The given ${element.tagName} element is currently unsupported.
      A PR extending this implementation would be very much welcome at https://github.com/testing-library/user-event`);
  }

  if ((0, _utils.isDisabled)(element)) {
    return;
  }

  (0, _utils.eventWrapper)(() => element.focus()); // by default, a new element has it's selection start and end at 0
  // but most of the time when people call "paste", they expect it to paste
  // at the end of the current input value. So, if the selection start
  // and end are both the default of 0, then we'll go ahead and change
  // them to the length of the current value.
  // the only time it would make sense to pass the initialSelectionStart or
  // initialSelectionEnd is if you have an input with a value and want to
  // explicitely start typing with the cursor at 0. Not super common.

  if (element.selectionStart === 0 && element.selectionEnd === 0) {
    (0, _utils.setSelectionRange)(element, initialSelectionStart != null ? initialSelectionStart : element.value.length, initialSelectionEnd != null ? initialSelectionEnd : element.value.length);
  }

  _dom.fireEvent.paste(element, init);

  if (element.readOnly) {
    return;
  }

  text = text.substr(0, (0, _utils.getSpaceUntilMaxLength)(element));
  const {
    newValue,
    newSelectionStart
  } = (0, _utils.calculateNewValue)(text, element);

  _dom.fireEvent.input(element, {
    inputType: 'insertFromPaste',
    target: {
      value: newValue
    }
  });

  (0, _utils.setSelectionRange)(element, // TODO: investigate why the selection caused by invalid parameters was expected
  {
    newSelectionStart,
    selectionEnd: newSelectionStart
  }, {});
}
},{"./utils":76,"@testing-library/dom":11}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectOptions = exports.deselectOptions = void 0;

var _dom = require("@testing-library/dom");

var _utils = require("./utils");

var _click = require("./click");

var _focus = require("./focus");

var _hover = require("./hover");

function selectOptionsBase(newValue, select, values, init, {
  skipPointerEventsCheck = false
} = {}) {
  if (!newValue && !select.multiple) {
    throw (0, _dom.getConfig)().getElementError(`Unable to deselect an option in a non-multiple select. Use selectOptions to change the selection instead.`, select);
  }

  const valArray = Array.isArray(values) ? values : [values];
  const allOptions = Array.from(select.querySelectorAll('option, [role="option"]'));
  const selectedOptions = valArray.map(val => {
    if (typeof val !== 'string' && allOptions.includes(val)) {
      return val;
    } else {
      const matchingOption = allOptions.find(o => o.value === val || o.innerHTML === val);

      if (matchingOption) {
        return matchingOption;
      } else {
        throw (0, _dom.getConfig)().getElementError(`Value "${String(val)}" not found in options`, select);
      }
    }
  }).filter(option => !(0, _utils.isDisabled)(option));
  if ((0, _utils.isDisabled)(select) || !selectedOptions.length) return;

  if ((0, _utils.isElementType)(select, 'select')) {
    if (select.multiple) {
      for (const option of selectedOptions) {
        const withPointerEvents = skipPointerEventsCheck ? true : (0, _utils.hasPointerEvents)(option); // events fired for multiple select are weird. Can't use hover...

        if (withPointerEvents) {
          _dom.fireEvent.pointerOver(option, init);

          _dom.fireEvent.pointerEnter(select, init);

          _dom.fireEvent.mouseOver(option);

          _dom.fireEvent.mouseEnter(select);

          _dom.fireEvent.pointerMove(option, init);

          _dom.fireEvent.mouseMove(option, init);

          _dom.fireEvent.pointerDown(option, init);

          _dom.fireEvent.mouseDown(option, init);
        }

        (0, _focus.focus)(select);

        if (withPointerEvents) {
          _dom.fireEvent.pointerUp(option, init);

          _dom.fireEvent.mouseUp(option, init);
        }

        selectOption(option);

        if (withPointerEvents) {
          _dom.fireEvent.click(option, init);
        }
      }
    } else if (selectedOptions.length === 1) {
      const withPointerEvents = skipPointerEventsCheck ? true : (0, _utils.hasPointerEvents)(select); // the click to open the select options

      if (withPointerEvents) {
        (0, _click.click)(select, init, {
          skipPointerEventsCheck
        });
      } else {
        (0, _focus.focus)(select);
      }

      selectOption(selectedOptions[0]);

      if (withPointerEvents) {
        // the browser triggers another click event on the select for the click on the option
        // this second click has no 'down' phase
        _dom.fireEvent.pointerOver(select, init);

        _dom.fireEvent.pointerEnter(select, init);

        _dom.fireEvent.mouseOver(select);

        _dom.fireEvent.mouseEnter(select);

        _dom.fireEvent.pointerUp(select, init);

        _dom.fireEvent.mouseUp(select, init);

        _dom.fireEvent.click(select, init);
      }
    } else {
      throw (0, _dom.getConfig)().getElementError(`Cannot select multiple options on a non-multiple select`, select);
    }
  } else if (select.getAttribute('role') === 'listbox') {
    selectedOptions.forEach(option => {
      (0, _hover.hover)(option, init, {
        skipPointerEventsCheck
      });
      (0, _click.click)(option, init, {
        skipPointerEventsCheck
      });
      (0, _hover.unhover)(option, init, {
        skipPointerEventsCheck
      });
    });
  } else {
    throw (0, _dom.getConfig)().getElementError(`Cannot select options on elements that are neither select nor listbox elements`, select);
  }

  function selectOption(option) {
    option.selected = newValue;
    (0, _dom.fireEvent)(select, (0, _dom.createEvent)('input', select, {
      bubbles: true,
      cancelable: false,
      composed: true,
      ...init
    }));

    _dom.fireEvent.change(select, init);
  }
}

const selectOptions = selectOptionsBase.bind(null, true);
exports.selectOptions = selectOptions;
const deselectOptions = selectOptionsBase.bind(null, false);
exports.deselectOptions = deselectOptions;
},{"./click":34,"./focus":35,"./hover":36,"./utils":76,"@testing-library/dom":11}],56:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tab = tab;

var _dom = require("@testing-library/dom");

var _utils = require("./utils");

var _focus = require("./focus");

var _blur = require("./blur");

function getNextElement(currentIndex, shift, elements, focusTrap) {
  if ((0, _utils.isDocument)(focusTrap) && (currentIndex === 0 && shift || currentIndex === elements.length - 1 && !shift)) {
    return focusTrap.body;
  }

  const nextIndex = shift ? currentIndex - 1 : currentIndex + 1;
  const defaultIndex = shift ? elements.length - 1 : 0;
  return elements[nextIndex] || elements[defaultIndex];
}

function tab({
  shift = false,
  focusTrap
} = {}) {
  var _focusTrap$ownerDocum, _focusTrap;

  const doc = (_focusTrap$ownerDocum = (_focusTrap = focusTrap) == null ? void 0 : _focusTrap.ownerDocument) != null ? _focusTrap$ownerDocum : document;
  const previousElement = (0, _utils.getActiveElement)(doc);

  if (!focusTrap) {
    focusTrap = doc;
  }

  const focusableElements = focusTrap.querySelectorAll(_utils.FOCUSABLE_SELECTOR);
  const enabledElements = Array.from(focusableElements).filter(el => el === previousElement || el.getAttribute('tabindex') !== '-1' && !(0, _utils.isDisabled)(el) && // Hidden elements are not tabable
  (0, _utils.isVisible)(el));
  if (enabledElements.length === 0) return;
  const orderedElements = enabledElements.map((el, idx) => ({
    el,
    idx
  })).sort((a, b) => {
    // tabindex has no effect if the active element has tabindex="-1"
    if (previousElement && previousElement.getAttribute('tabindex') === '-1') {
      return a.idx - b.idx;
    }

    const tabIndexA = Number(a.el.getAttribute('tabindex'));
    const tabIndexB = Number(b.el.getAttribute('tabindex'));
    const diff = tabIndexA - tabIndexB;
    return diff === 0 ? a.idx - b.idx : diff;
  }).map(({
    el
  }) => el); // TODO: verify/remove type casts

  const checkedRadio = {};
  let prunedElements = [];
  orderedElements.forEach(currentElement => {
    // For radio groups keep only the active radio
    // If there is no active radio, keep only the checked radio
    // If there is no checked radio, treat like everything else
    const el = currentElement;

    if (el.type === 'radio' && el.name) {
      // If the active element is part of the group, add only that
      const prev = previousElement;

      if (prev && prev.type === el.type && prev.name === el.name) {
        if (el === prev) {
          prunedElements.push(el);
        }

        return;
      } // If we stumble upon a checked radio, remove the others


      if (el.checked) {
        prunedElements = prunedElements.filter(e => e.type !== el.type || e.name !== el.name);
        prunedElements.push(el);
        checkedRadio[el.name] = el;
        return;
      } // If we already found the checked one, skip


      if (typeof checkedRadio[el.name] !== 'undefined') {
        return;
      }
    }

    prunedElements.push(el);
  });
  const index = prunedElements.findIndex(el => el === previousElement);
  const nextElement = getNextElement(index, shift, prunedElements, focusTrap);
  const shiftKeyInit = {
    key: 'Shift',
    keyCode: 16,
    shiftKey: true
  };
  const tabKeyInit = {
    key: 'Tab',
    keyCode: 9,
    shiftKey: shift
  };
  let continueToTab = true; // not sure how to make it so there's no previous element...
  // istanbul ignore else

  if (previousElement) {
    // preventDefault on the shift key makes no difference
    if (shift) _dom.fireEvent.keyDown(previousElement, { ...shiftKeyInit
    });
    continueToTab = _dom.fireEvent.keyDown(previousElement, { ...tabKeyInit
    });
  }

  const keyUpTarget = !continueToTab && previousElement ? previousElement : nextElement;

  if (continueToTab) {
    if (nextElement === doc.body) {
      /* istanbul ignore else */
      if (previousElement) {
        (0, _blur.blur)(previousElement);
      }
    } else {
      (0, _focus.focus)(nextElement);
    }
  }

  _dom.fireEvent.keyUp(keyUpTarget, { ...tabKeyInit
  });

  if (shift) {
    _dom.fireEvent.keyUp(keyUpTarget, { ...shiftKeyInit,
      shiftKey: false
    });
  }
}
/*
eslint
  complexity: "off",
  max-statements: "off",
*/
},{"./blur":32,"./focus":35,"./utils":76,"@testing-library/dom":11}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.type = type;

var _dom = require("@testing-library/dom");

var _typeImplementation = require("./typeImplementation");

// this needs to be wrapped in the event/asyncWrapper for React's act and angular's change detection
// depending on whether it will be async.
function type(element, text, {
  delay = 0,
  ...options
} = {}) {
  // we do not want to wrap in the asyncWrapper if we're not
  // going to actually be doing anything async, so we only wrap
  // if the delay is greater than 0
  if (delay > 0) {
    return (0, _dom.getConfig)().asyncWrapper(() => (0, _typeImplementation.typeImplementation)(element, text, {
      delay,
      ...options
    }));
  } else {
    return void (0, _typeImplementation.typeImplementation)(element, text, {
      delay,
      ...options
    }) // prevents users from dealing with UnhandledPromiseRejectionWarning
    .catch(console.error);
  }
}
},{"./typeImplementation":58,"@testing-library/dom":11}],58:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typeImplementation = typeImplementation;

var _utils = require("../utils");

var _click = require("../click");

var _keyboard = require("../keyboard");

async function typeImplementation(element, text, {
  delay,
  skipClick = false,
  skipAutoClose = false,
  initialSelectionStart = undefined,
  initialSelectionEnd = undefined
}) {
  // TODO: properly type guard
  // we use this workaround for now to prevent changing behavior
  if (element.disabled) return;
  if (!skipClick) (0, _click.click)(element); // The focused element could change between each event, so get the currently active element each time

  const currentElement = () => (0, _utils.getActiveElement)(element.ownerDocument); // by default, a new element has its selection start and end at 0
  // but most of the time when people call "type", they expect it to type
  // at the end of the current input value. So, if the selection start
  // and end are both the default of 0, then we'll go ahead and change
  // them to the length of the current value.
  // the only time it would make sense to pass the initialSelectionStart or
  // initialSelectionEnd is if you have an input with a value and want to
  // explicitly start typing with the cursor at 0. Not super common.


  const value = (0, _utils.getValue)(currentElement());
  const {
    selectionStart,
    selectionEnd
  } = (0, _utils.getSelectionRange)(element);

  if (value != null && (selectionStart === null || selectionStart === 0) && (selectionEnd === null || selectionEnd === 0)) {
    (0, _utils.setSelectionRange)(currentElement(), initialSelectionStart != null ? initialSelectionStart : value.length, initialSelectionEnd != null ? initialSelectionEnd : value.length);
  }

  const {
    promise,
    releaseAllKeys
  } = (0, _keyboard.keyboardImplementationWrapper)(text, {
    delay,
    document: element.ownerDocument
  });

  if (delay > 0) {
    await promise;
  }

  if (!skipAutoClose) {
    releaseAllKeys();
  } // eslint-disable-next-line consistent-return -- we need to return the internal Promise so that it is catchable if we don't await


  return promise;
}
},{"../click":34,"../keyboard":40,"../utils":76}],59:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upload = upload;

var _dom = require("@testing-library/dom");

var _click = require("./click");

var _blur = require("./blur");

var _focus = require("./focus");

var _utils = require("./utils");

function upload(element, fileOrFiles, init, {
  applyAccept = false
} = {}) {
  var _input$files;

  const input = (0, _utils.isElementType)(element, 'label') ? element.control : element;

  if (!input || !(0, _utils.isElementType)(input, 'input', {
    type: 'file'
  })) {
    throw new TypeError(`The ${input === element ? 'given' : 'associated'} ${input == null ? void 0 : input.tagName} element does not accept file uploads`);
  }

  if ((0, _utils.isDisabled)(element)) return;
  (0, _click.click)(element, init == null ? void 0 : init.clickInit);
  const files = (Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]).filter(file => !applyAccept || isAcceptableFile(file, input.accept)).slice(0, input.multiple ? undefined : 1); // blur fires when the file selector pops up

  (0, _blur.blur)(element); // focus fires when they make their selection

  (0, _focus.focus)(element); // do not fire an input event if the file selection does not change

  if (files.length === ((_input$files = input.files) == null ? void 0 : _input$files.length) && files.every((f, i) => {
    var _input$files2;

    return f === ((_input$files2 = input.files) == null ? void 0 : _input$files2.item(i));
  })) {
    return;
  } // the event fired in the browser isn't actually an "input" or "change" event
  // but a new Event with a type set to "input" and "change"
  // Kinda odd...


  const inputFiles = { ...files,
    length: files.length,
    item: index => files[index],

    [Symbol.iterator]() {
      let i = 0;
      return {
        next: () => ({
          done: i >= files.length,
          value: files[i++]
        })
      };
    }

  };
  (0, _dom.fireEvent)(input, (0, _dom.createEvent)('input', input, {
    target: {
      files: inputFiles
    },
    bubbles: true,
    cancelable: false,
    composed: true
  }));

  _dom.fireEvent.change(input, {
    target: {
      files: inputFiles
    },
    ...(init == null ? void 0 : init.changeInit)
  });
}

function isAcceptableFile(file, accept) {
  if (!accept) {
    return true;
  }

  const wildcards = ['audio/*', 'image/*', 'video/*'];
  return accept.split(',').some(acceptToken => {
    if (acceptToken.startsWith('.')) {
      // tokens starting with a dot represent a file extension
      return file.name.endsWith(acceptToken);
    } else if (wildcards.includes(acceptToken)) {
      return file.type.startsWith(acceptToken.substr(0, acceptToken.length - 1));
    }

    return file.type === acceptToken;
  });
}
},{"./blur":32,"./click":34,"./focus":35,"./utils":76,"@testing-library/dom":11}],60:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMouseEventOptions = getMouseEventOptions;

function isMousePressEvent(event) {
  return event === 'mousedown' || event === 'mouseup' || event === 'click' || event === 'dblclick';
} // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons


const BUTTONS_NAMES = {
  none: 0,
  primary: 1,
  secondary: 2,
  auxiliary: 4
}; // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button

const BUTTON_NAMES = {
  primary: 0,
  auxiliary: 1,
  secondary: 2
};

function translateButtonNumber(value, from) {
  var _Object$entries$find;

  const [mapIn, mapOut] = from === 'button' ? [BUTTON_NAMES, BUTTONS_NAMES] : [BUTTONS_NAMES, BUTTON_NAMES];
  const name = (_Object$entries$find = Object.entries(mapIn).find(([, i]) => i === value)) == null ? void 0 : _Object$entries$find[0]; // istanbul ignore next

  return name && Object.prototype.hasOwnProperty.call(mapOut, name) ? mapOut[name] : 0;
}

function convertMouseButtons(event, init, property) {
  if (!isMousePressEvent(event)) {
    return 0;
  }

  if (typeof init[property] === 'number') {
    return init[property];
  } else if (property === 'button' && typeof init.buttons === 'number') {
    return translateButtonNumber(init.buttons, 'buttons');
  } else if (property === 'buttons' && typeof init.button === 'number') {
    return translateButtonNumber(init.button, 'button');
  }

  return property != 'button' && isMousePressEvent(event) ? 1 : 0;
}

function getMouseEventOptions(event, init, clickCount = 0) {
  var _init;

  init = (_init = init) != null ? _init : {};
  return { ...init,
    // https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail
    detail: event === 'mousedown' || event === 'mouseup' || event === 'click' ? 1 + clickCount : clickCount,
    buttons: convertMouseButtons(event, init, 'buttons'),
    button: convertMouseButtons(event, init, 'button')
  };
}
},{}],61:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isClickableInput = isClickableInput;

var _isElementType = require("../misc/isElementType");

const CLICKABLE_INPUT_TYPES = ['button', 'color', 'file', 'image', 'reset', 'submit', 'checkbox', 'radio'];

function isClickableInput(element) {
  return (0, _isElementType.isElementType)(element, 'button') || (0, _isElementType.isElementType)(element, 'input') && CLICKABLE_INPUT_TYPES.includes(element.type);
}
},{"../misc/isElementType":82}],62:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildTimeValue = buildTimeValue;

function buildTimeValue(value) {
  const onlyDigitsValue = value.replace(/\D/g, '');

  if (onlyDigitsValue.length < 2) {
    return value;
  }

  const firstDigit = parseInt(onlyDigitsValue[0], 10);
  const secondDigit = parseInt(onlyDigitsValue[1], 10);

  if (firstDigit >= 3 || firstDigit === 2 && secondDigit >= 4) {
    let index;

    if (firstDigit >= 3) {
      index = 1;
    } else {
      index = 2;
    }

    return build(onlyDigitsValue, index);
  }

  if (value.length === 2) {
    return value;
  }

  return build(onlyDigitsValue, 2);
}

function build(onlyDigitsValue, index) {
  const hours = onlyDigitsValue.slice(0, index);
  const validHours = Math.min(parseInt(hours, 10), 23);
  const minuteCharacters = onlyDigitsValue.slice(index);
  const parsedMinutes = parseInt(minuteCharacters, 10);
  const validMinutes = Math.min(parsedMinutes, 59);
  return `${validHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}`;
}
},{}],63:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateNewValue = calculateNewValue;

var _selectionRange = require("./selectionRange");

var _getValue2 = require("./getValue");

var _isValidDateValue = require("./isValidDateValue");

var _isValidInputTimeValue = require("./isValidInputTimeValue");

function calculateNewValue(newEntry, element, value = (() => {
  var _getValue;

  return (_getValue = (0, _getValue2.getValue)(element)) != null ? _getValue :
  /* istanbul ignore next */
  '';
})(), selectionRange = (0, _selectionRange.getSelectionRange)(element), deleteContent) {
  const selectionStart = selectionRange.selectionStart === null ? value.length : selectionRange.selectionStart;
  const selectionEnd = selectionRange.selectionEnd === null ? value.length : selectionRange.selectionEnd;
  const prologEnd = Math.max(0, selectionStart === selectionEnd && deleteContent === 'backward' ? selectionStart - 1 : selectionStart);
  const prolog = value.substring(0, prologEnd);
  const epilogStart = Math.min(value.length, selectionStart === selectionEnd && deleteContent === 'forward' ? selectionEnd + 1 : selectionEnd);
  const epilog = value.substring(epilogStart, value.length);
  let newValue = `${prolog}${newEntry}${epilog}`;
  const newSelectionStart = prologEnd + newEntry.length;

  if (element.type === 'date' && !(0, _isValidDateValue.isValidDateValue)(element, newValue)) {
    newValue = value;
  }

  if (element.type === 'time' && !(0, _isValidInputTimeValue.isValidInputTimeValue)(element, newValue)) {
    if ((0, _isValidInputTimeValue.isValidInputTimeValue)(element, newEntry)) {
      newValue = newEntry;
    } else {
      newValue = value;
    }
  }

  return {
    newValue,
    newSelectionStart
  };
}
},{"./getValue":65,"./isValidDateValue":69,"./isValidInputTimeValue":70,"./selectionRange":72}],64:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isCursorAtEnd = isCursorAtEnd;
exports.isCursorAtStart = isCursorAtStart;

var _selectionRange = require("./selectionRange");

var _getValue2 = require("./getValue");

function isCursorAtEnd(element) {
  var _getValue;

  const {
    selectionStart,
    selectionEnd
  } = (0, _selectionRange.getSelectionRange)(element);
  return selectionStart === selectionEnd && (selectionStart != null ? selectionStart :
  /* istanbul ignore next */
  0) === ((_getValue = (0, _getValue2.getValue)(element)) != null ? _getValue :
  /* istanbul ignore next */
  '').length;
}

function isCursorAtStart(element) {
  const {
    selectionStart,
    selectionEnd
  } = (0, _selectionRange.getSelectionRange)(element);
  return selectionStart === selectionEnd && (selectionStart != null ? selectionStart :
  /* istanbul ignore next */
  0) === 0;
}
},{"./getValue":65,"./selectionRange":72}],65:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getValue = getValue;

var _isContentEditable = require("./isContentEditable");

function getValue(element) {
  // istanbul ignore if
  if (!element) {
    return null;
  }

  if ((0, _isContentEditable.isContentEditable)(element)) {
    return element.textContent;
  }

  return element.value;
}
},{"./isContentEditable":67}],66:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasUnreliableEmptyValue = hasUnreliableEmptyValue;

var _isElementType = require("../misc/isElementType");

var unreliableValueInputTypes;
/**
 * Check if an empty IDL value on the element could mean a derivation of displayed value and IDL value
 */

(function (unreliableValueInputTypes) {
  unreliableValueInputTypes["number"] = "number";
})(unreliableValueInputTypes || (unreliableValueInputTypes = {}));

function hasUnreliableEmptyValue(element) {
  return (0, _isElementType.isElementType)(element, 'input') && Boolean(unreliableValueInputTypes[element.type]);
}
},{"../misc/isElementType":82}],67:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isContentEditable = isContentEditable;

//jsdom is not supporting isContentEditable
function isContentEditable(element) {
  return element.hasAttribute('contenteditable') && (element.getAttribute('contenteditable') == 'true' || element.getAttribute('contenteditable') == '');
}
},{}],68:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.editableInputTypes = void 0;
exports.isEditable = isEditable;
exports.isEditableInput = isEditableInput;

var _isElementType = require("../misc/isElementType");

var _isContentEditable = require("./isContentEditable");

function isEditable(element) {
  return isEditableInput(element) || (0, _isElementType.isElementType)(element, 'textarea', {
    readOnly: false
  }) || (0, _isContentEditable.isContentEditable)(element);
}

let editableInputTypes;
exports.editableInputTypes = editableInputTypes;

(function (editableInputTypes) {
  editableInputTypes["text"] = "text";
  editableInputTypes["date"] = "date";
  editableInputTypes["datetime-local"] = "datetime-local";
  editableInputTypes["email"] = "email";
  editableInputTypes["month"] = "month";
  editableInputTypes["number"] = "number";
  editableInputTypes["password"] = "password";
  editableInputTypes["search"] = "search";
  editableInputTypes["tel"] = "tel";
  editableInputTypes["time"] = "time";
  editableInputTypes["url"] = "url";
  editableInputTypes["week"] = "week";
})(editableInputTypes || (exports.editableInputTypes = editableInputTypes = {}));

function isEditableInput(element) {
  return (0, _isElementType.isElementType)(element, 'input', {
    readOnly: false
  }) && Boolean(editableInputTypes[element.type]);
}
},{"../misc/isElementType":82,"./isContentEditable":67}],69:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidDateValue = isValidDateValue;

function isValidDateValue(element, value) {
  const clone = element.cloneNode();
  clone.value = value;
  return clone.value === value;
}
},{}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidInputTimeValue = isValidInputTimeValue;

function isValidInputTimeValue(element, timeValue) {
  const clone = element.cloneNode();
  clone.value = timeValue;
  return clone.value === timeValue;
}
},{}],71:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSpaceUntilMaxLength = getSpaceUntilMaxLength;

var _isElementType = require("../misc/isElementType");

var _getValue = require("./getValue");

var maxLengthSupportedTypes;

(function (maxLengthSupportedTypes) {
  maxLengthSupportedTypes["email"] = "email";
  maxLengthSupportedTypes["password"] = "password";
  maxLengthSupportedTypes["search"] = "search";
  maxLengthSupportedTypes["telephone"] = "telephone";
  maxLengthSupportedTypes["text"] = "text";
  maxLengthSupportedTypes["url"] = "url";
})(maxLengthSupportedTypes || (maxLengthSupportedTypes = {}));

function getSpaceUntilMaxLength(element) {
  const value = (0, _getValue.getValue)(element);
  /* istanbul ignore if */

  if (value === null) {
    return undefined;
  }

  const maxLength = getSanitizedMaxLength(element);
  return maxLength ? maxLength - value.length : undefined;
} // can't use .maxLength property because of a jsdom bug:
// https://github.com/jsdom/jsdom/issues/2927


function getSanitizedMaxLength(element) {
  var _element$getAttribute;

  if (!supportsMaxLength(element)) {
    return undefined;
  }

  const attr = (_element$getAttribute = element.getAttribute('maxlength')) != null ? _element$getAttribute : '';
  return /^\d+$/.test(attr) && Number(attr) >= 0 ? Number(attr) : undefined;
}

function supportsMaxLength(element) {
  return (0, _isElementType.isElementType)(element, 'textarea') || (0, _isElementType.isElementType)(element, 'input') && Boolean(maxLengthSupportedTypes[element.type]);
}
},{"../misc/isElementType":82,"./getValue":65}],72:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSelectionRange = getSelectionRange;
exports.hasSelectionSupport = hasSelectionSupport;
exports.setSelectionRange = setSelectionRange;

var _isElementType = require("../misc/isElementType");

// https://github.com/jsdom/jsdom/blob/c2fb8ff94917a4d45e2398543f5dd2a8fed0bdab/lib/jsdom/living/nodes/HTMLInputElement-impl.js#L45
var selectionSupportType;

(function (selectionSupportType) {
  selectionSupportType["text"] = "text";
  selectionSupportType["search"] = "search";
  selectionSupportType["url"] = "url";
  selectionSupportType["tel"] = "tel";
  selectionSupportType["password"] = "password";
})(selectionSupportType || (selectionSupportType = {}));

const InputSelection = Symbol('inputSelection');

function hasSelectionSupport(element) {
  return (0, _isElementType.isElementType)(element, 'textarea') || (0, _isElementType.isElementType)(element, 'input') && Boolean(selectionSupportType[element.type]);
}

function getSelectionRange(element) {
  if (hasSelectionSupport(element)) {
    return {
      selectionStart: element.selectionStart,
      selectionEnd: element.selectionEnd
    };
  }

  if ((0, _isElementType.isElementType)(element, 'input')) {
    var _InputSelection;

    return (_InputSelection = element[InputSelection]) != null ? _InputSelection : {
      selectionStart: null,
      selectionEnd: null
    };
  }

  const selection = element.ownerDocument.getSelection(); // there should be no editing if the focusNode is outside of element
  // TODO: properly handle selection ranges

  if (selection != null && selection.rangeCount && element.contains(selection.focusNode)) {
    const range = selection.getRangeAt(0);
    return {
      selectionStart: range.startOffset,
      selectionEnd: range.endOffset
    };
  } else {
    return {
      selectionStart: null,
      selectionEnd: null
    };
  }
}

function setSelectionRange(element, newSelectionStart, newSelectionEnd) {
  const {
    selectionStart,
    selectionEnd
  } = getSelectionRange(element);

  if (selectionStart === newSelectionStart && selectionEnd === newSelectionEnd) {
    return;
  }

  if (hasSelectionSupport(element)) {
    element.setSelectionRange(newSelectionStart, newSelectionEnd);
  }

  if ((0, _isElementType.isElementType)(element, 'input')) {
    ;
    element[InputSelection] = {
      selectionStart: newSelectionStart,
      selectionEnd: newSelectionEnd
    };
  } // Moving the selection inside <input> or <textarea> does not alter the document Selection.


  if ((0, _isElementType.isElementType)(element, 'input') || (0, _isElementType.isElementType)(element, 'textarea')) {
    return;
  }

  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element); // istanbul ignore else

  if (element.firstChild) {
    range.setStart(element.firstChild, newSelectionStart);
    range.setEnd(element.firstChild, newSelectionEnd);
  }

  const selection = element.ownerDocument.getSelection(); // istanbul ignore else

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
},{"../misc/isElementType":82}],73:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getActiveElement = getActiveElement;

var _isDisabled = require("../misc/isDisabled");

function getActiveElement(document) {
  const activeElement = document.activeElement;

  if (activeElement != null && activeElement.shadowRoot) {
    return getActiveElement(activeElement.shadowRoot);
  } else {
    // Browser does not yield disabled elements as document.activeElement - jsdom does
    if ((0, _isDisabled.isDisabled)(activeElement)) {
      return document.ownerDocument ? // TODO: verify behavior in ShadowRoot

      /* istanbul ignore next */
      document.ownerDocument.body : document.body;
    }

    return activeElement;
  }
}
},{"../misc/isDisabled":80}],74:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFocusable = isFocusable;

var _isLabelWithInternallyDisabledControl = require("../misc/isLabelWithInternallyDisabledControl");

var _selector = require("./selector");

function isFocusable(element) {
  return !(0, _isLabelWithInternallyDisabledControl.isLabelWithInternallyDisabledControl)(element) && element.matches(_selector.FOCUSABLE_SELECTOR);
}
},{"../misc/isLabelWithInternallyDisabledControl":83,"./selector":75}],75:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FOCUSABLE_SELECTOR = void 0;
const FOCUSABLE_SELECTOR = ['input:not([type=hidden]):not([disabled])', 'button:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[contenteditable=""]', '[contenteditable="true"]', 'a[href]', '[tabindex]:not([disabled])'].join(', ');
exports.FOCUSABLE_SELECTOR = FOCUSABLE_SELECTOR;
},{}],76:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getMouseEventOptions = require("./click/getMouseEventOptions");

Object.keys(_getMouseEventOptions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _getMouseEventOptions[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _getMouseEventOptions[key];
    }
  });
});

var _isClickableInput = require("./click/isClickableInput");

Object.keys(_isClickableInput).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isClickableInput[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isClickableInput[key];
    }
  });
});

var _buildTimeValue = require("./edit/buildTimeValue");

Object.keys(_buildTimeValue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _buildTimeValue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _buildTimeValue[key];
    }
  });
});

var _calculateNewValue = require("./edit/calculateNewValue");

Object.keys(_calculateNewValue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _calculateNewValue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _calculateNewValue[key];
    }
  });
});

var _cursorPosition = require("./edit/cursorPosition");

Object.keys(_cursorPosition).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _cursorPosition[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _cursorPosition[key];
    }
  });
});

var _getValue = require("./edit/getValue");

Object.keys(_getValue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _getValue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _getValue[key];
    }
  });
});

var _hasUnreliableEmptyValue = require("./edit/hasUnreliableEmptyValue");

Object.keys(_hasUnreliableEmptyValue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _hasUnreliableEmptyValue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _hasUnreliableEmptyValue[key];
    }
  });
});

var _isContentEditable = require("./edit/isContentEditable");

Object.keys(_isContentEditable).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isContentEditable[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isContentEditable[key];
    }
  });
});

var _isEditable = require("./edit/isEditable");

Object.keys(_isEditable).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isEditable[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isEditable[key];
    }
  });
});

var _isValidDateValue = require("./edit/isValidDateValue");

Object.keys(_isValidDateValue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isValidDateValue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isValidDateValue[key];
    }
  });
});

var _isValidInputTimeValue = require("./edit/isValidInputTimeValue");

Object.keys(_isValidInputTimeValue).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isValidInputTimeValue[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isValidInputTimeValue[key];
    }
  });
});

var _maxLength = require("./edit/maxLength");

Object.keys(_maxLength).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _maxLength[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _maxLength[key];
    }
  });
});

var _selectionRange = require("./edit/selectionRange");

Object.keys(_selectionRange).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _selectionRange[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _selectionRange[key];
    }
  });
});

var _getActiveElement = require("./focus/getActiveElement");

Object.keys(_getActiveElement).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _getActiveElement[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _getActiveElement[key];
    }
  });
});

var _isFocusable = require("./focus/isFocusable");

Object.keys(_isFocusable).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isFocusable[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isFocusable[key];
    }
  });
});

var _selector = require("./focus/selector");

Object.keys(_selector).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _selector[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _selector[key];
    }
  });
});

var _eventWrapper = require("./misc/eventWrapper");

Object.keys(_eventWrapper).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _eventWrapper[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _eventWrapper[key];
    }
  });
});

var _isElementType = require("./misc/isElementType");

Object.keys(_isElementType).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isElementType[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isElementType[key];
    }
  });
});

var _isLabelWithInternallyDisabledControl = require("./misc/isLabelWithInternallyDisabledControl");

Object.keys(_isLabelWithInternallyDisabledControl).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isLabelWithInternallyDisabledControl[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isLabelWithInternallyDisabledControl[key];
    }
  });
});

var _isVisible = require("./misc/isVisible");

Object.keys(_isVisible).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isVisible[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isVisible[key];
    }
  });
});

var _isDisabled = require("./misc/isDisabled");

Object.keys(_isDisabled).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isDisabled[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isDisabled[key];
    }
  });
});

var _isDocument = require("./misc/isDocument");

Object.keys(_isDocument).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isDocument[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isDocument[key];
    }
  });
});

var _wait = require("./misc/wait");

Object.keys(_wait).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _wait[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _wait[key];
    }
  });
});

var _hasPointerEvents = require("./misc/hasPointerEvents");

Object.keys(_hasPointerEvents).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _hasPointerEvents[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _hasPointerEvents[key];
    }
  });
});

var _hasFormSubmit = require("./misc/hasFormSubmit");

Object.keys(_hasFormSubmit).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _hasFormSubmit[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _hasFormSubmit[key];
    }
  });
});
},{"./click/getMouseEventOptions":60,"./click/isClickableInput":61,"./edit/buildTimeValue":62,"./edit/calculateNewValue":63,"./edit/cursorPosition":64,"./edit/getValue":65,"./edit/hasUnreliableEmptyValue":66,"./edit/isContentEditable":67,"./edit/isEditable":68,"./edit/isValidDateValue":69,"./edit/isValidInputTimeValue":70,"./edit/maxLength":71,"./edit/selectionRange":72,"./focus/getActiveElement":73,"./focus/isFocusable":74,"./focus/selector":75,"./misc/eventWrapper":77,"./misc/hasFormSubmit":78,"./misc/hasPointerEvents":79,"./misc/isDisabled":80,"./misc/isDocument":81,"./misc/isElementType":82,"./misc/isLabelWithInternallyDisabledControl":83,"./misc/isVisible":84,"./misc/wait":85}],77:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eventWrapper = eventWrapper;

var _dom = require("@testing-library/dom");

function eventWrapper(cb) {
  let result;
  (0, _dom.getConfig)().eventWrapper(() => {
    result = cb();
  });
  return result;
}
},{"@testing-library/dom":11}],78:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasFormSubmit = void 0;

const hasFormSubmit = form => !!(form && (form.querySelector('input[type="submit"]') || form.querySelector('button[type="submit"]')));

exports.hasFormSubmit = hasFormSubmit;
},{}],79:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasPointerEvents = hasPointerEvents;

var _helpers = require("@testing-library/dom/dist/helpers");

function hasPointerEvents(element) {
  const window = (0, _helpers.getWindowFromNode)(element);

  for (let el = element; (_el = el) != null && _el.ownerDocument; el = el.parentElement) {
    var _el;

    const pointerEvents = window.getComputedStyle(el).pointerEvents;

    if (pointerEvents && !['inherit', 'unset'].includes(pointerEvents)) {
      return pointerEvents !== 'none';
    }
  }

  return true;
}
},{"@testing-library/dom/dist/helpers":10}],80:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDisabled = isDisabled;

// This should probably be extended with checking the element type
// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
function isDisabled(element) {
  return Boolean(element && element.disabled);
}
},{}],81:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDocument = isDocument;

function isDocument(el) {
  return el.nodeType === el.DOCUMENT_NODE;
}
},{}],82:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isElementType = isElementType;

function isElementType(element, tag, props) {
  if (element.namespaceURI && element.namespaceURI !== 'http://www.w3.org/1999/xhtml') {
    return false;
  }

  tag = Array.isArray(tag) ? tag : [tag]; // tagName is uppercase in HTMLDocument and lowercase in XMLDocument

  if (!tag.includes(element.tagName.toLowerCase())) {
    return false;
  }

  if (props) {
    return Object.entries(props).every(([k, v]) => element[k] === v);
  }

  return true;
}
},{}],83:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLabelWithInternallyDisabledControl = isLabelWithInternallyDisabledControl;

var _isDisabled = require("./isDisabled");

var _isElementType = require("./isElementType");

// Absolutely NO events fire on label elements that contain their control
// if that control is disabled. NUTS!
// no joke. There are NO events for: <label><input disabled /><label>
function isLabelWithInternallyDisabledControl(element) {
  if (!(0, _isElementType.isElementType)(element, 'label')) {
    return false;
  }

  const control = element.control;
  return Boolean(control && element.contains(control) && (0, _isDisabled.isDisabled)(control));
}
},{"./isDisabled":80,"./isElementType":82}],84:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isVisible = isVisible;

var _helpers = require("@testing-library/dom/dist/helpers");

function isVisible(element) {
  const window = (0, _helpers.getWindowFromNode)(element);

  for (let el = element; (_el = el) != null && _el.ownerDocument; el = el.parentElement) {
    var _el;

    const display = window.getComputedStyle(el).display;

    if (display === 'none') {
      return false;
    }
  }

  return true;
}
},{"@testing-library/dom/dist/helpers":10}],85:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wait = wait;

function wait(time) {
  return new Promise(resolve => setTimeout(() => resolve(), time));
}
},{}],86:[function(require,module,exports){
'use strict';

module.exports = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

},{}],87:[function(require,module,exports){
'use strict';

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			overline: [53, 55],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles, {
		rgbToAnsi256: {
			value: (red, green, blue) => {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16 +
					(36 * Math.round(red / 255 * 5)) +
					(6 * Math.round(green / 255 * 5)) +
					Math.round(blue / 255 * 5);
			},
			enumerable: false
		},
		hexToRgb: {
			value: hex => {
				const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let {colorString} = matches.groups;

				if (colorString.length === 3) {
					colorString = colorString.split('').map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF
				];
			},
			enumerable: false
		},
		hexToAnsi256: {
			value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
			enumerable: false
		}
	});

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});

},{}],88:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var properties = [['aria-activedescendant', {
  'type': 'id'
}], ['aria-atomic', {
  'type': 'boolean'
}], ['aria-autocomplete', {
  'type': 'token',
  'values': ['inline', 'list', 'both', 'none']
}], ['aria-busy', {
  'type': 'boolean'
}], ['aria-checked', {
  'type': 'tristate'
}], ['aria-colcount', {
  type: 'integer'
}], ['aria-colindex', {
  type: 'integer'
}], ['aria-colspan', {
  type: 'integer'
}], ['aria-controls', {
  'type': 'idlist'
}], ['aria-current', {
  type: 'token',
  values: ['page', 'step', 'location', 'date', 'time', true, false]
}], ['aria-describedby', {
  'type': 'idlist'
}], ['aria-details', {
  'type': 'id'
}], ['aria-disabled', {
  'type': 'boolean'
}], ['aria-dropeffect', {
  'type': 'tokenlist',
  'values': ['copy', 'execute', 'link', 'move', 'none', 'popup']
}], ['aria-errormessage', {
  'type': 'id'
}], ['aria-expanded', {
  'type': 'boolean',
  'allowundefined': true
}], ['aria-flowto', {
  'type': 'idlist'
}], ['aria-grabbed', {
  'type': 'boolean',
  'allowundefined': true
}], ['aria-haspopup', {
  'type': 'token',
  'values': [false, true, 'menu', 'listbox', 'tree', 'grid', 'dialog']
}], ['aria-hidden', {
  'type': 'boolean',
  'allowundefined': true
}], ['aria-invalid', {
  'type': 'token',
  'values': ['grammar', false, 'spelling', true]
}], ['aria-keyshortcuts', {
  type: 'string'
}], ['aria-label', {
  'type': 'string'
}], ['aria-labelledby', {
  'type': 'idlist'
}], ['aria-level', {
  'type': 'integer'
}], ['aria-live', {
  'type': 'token',
  'values': ['assertive', 'off', 'polite']
}], ['aria-modal', {
  type: 'boolean'
}], ['aria-multiline', {
  'type': 'boolean'
}], ['aria-multiselectable', {
  'type': 'boolean'
}], ['aria-orientation', {
  'type': 'token',
  'values': ['vertical', 'undefined', 'horizontal']
}], ['aria-owns', {
  'type': 'idlist'
}], ['aria-placeholder', {
  type: 'string'
}], ['aria-posinset', {
  'type': 'integer'
}], ['aria-pressed', {
  'type': 'tristate'
}], ['aria-readonly', {
  'type': 'boolean'
}], ['aria-relevant', {
  'type': 'tokenlist',
  'values': ['additions', 'all', 'removals', 'text']
}], ['aria-required', {
  'type': 'boolean'
}], ['aria-roledescription', {
  type: 'string'
}], ['aria-rowcount', {
  type: 'integer'
}], ['aria-rowindex', {
  type: 'integer'
}], ['aria-rowspan', {
  type: 'integer'
}], ['aria-selected', {
  'type': 'boolean',
  'allowundefined': true
}], ['aria-setsize', {
  'type': 'integer'
}], ['aria-sort', {
  'type': 'token',
  'values': ['ascending', 'descending', 'none', 'other']
}], ['aria-valuemax', {
  'type': 'number'
}], ['aria-valuemin', {
  'type': 'number'
}], ['aria-valuenow', {
  'type': 'number'
}], ['aria-valuetext', {
  'type': 'string'
}]];
var ariaPropsMap = {
  entries: function entries() {
    return properties;
  },
  get: function get(key) {
    var item = properties.find(function (tuple) {
      return tuple[0] === key ? true : false;
    });
    return item && item[1];
  },
  has: function has(key) {
    return !!this.get(key);
  },
  keys: function keys() {
    return properties.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          key = _ref2[0];

      return key;
    });
  },
  values: function values() {
    return properties.map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          values = _ref4[1];

      return values;
    });
  }
};
var _default = ariaPropsMap;
exports.default = _default;
},{}],89:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var dom = [['a', {
  reserved: false
}], ['abbr', {
  reserved: false
}], ['acronym', {
  reserved: false
}], ['address', {
  reserved: false
}], ['applet', {
  reserved: false
}], ['area', {
  reserved: false
}], ['article', {
  reserved: false
}], ['aside', {
  reserved: false
}], ['audio', {
  reserved: false
}], ['b', {
  reserved: false
}], ['base', {
  reserved: true
}], ['bdi', {
  reserved: false
}], ['bdo', {
  reserved: false
}], ['big', {
  reserved: false
}], ['blink', {
  reserved: false
}], ['blockquote', {
  reserved: false
}], ['body', {
  reserved: false
}], ['br', {
  reserved: false
}], ['button', {
  reserved: false
}], ['canvas', {
  reserved: false
}], ['caption', {
  reserved: false
}], ['center', {
  reserved: false
}], ['cite', {
  reserved: false
}], ['code', {
  reserved: false
}], ['col', {
  reserved: true
}], ['colgroup', {
  reserved: true
}], ['content', {
  reserved: false
}], ['data', {
  reserved: false
}], ['datalist', {
  reserved: false
}], ['dd', {
  reserved: false
}], ['del', {
  reserved: false
}], ['details', {
  reserved: false
}], ['dfn', {
  reserved: false
}], ['dialog', {
  reserved: false
}], ['dir', {
  reserved: false
}], ['div', {
  reserved: false
}], ['dl', {
  reserved: false
}], ['dt', {
  reserved: false
}], ['em', {
  reserved: false
}], ['embed', {
  reserved: false
}], ['fieldset', {
  reserved: false
}], ['figcaption', {
  reserved: false
}], ['figure', {
  reserved: false
}], ['font', {
  reserved: false
}], ['footer', {
  reserved: false
}], ['form', {
  reserved: false
}], ['frame', {
  reserved: false
}], ['frameset', {
  reserved: false
}], ['h1', {
  reserved: false
}], ['h2', {
  reserved: false
}], ['h3', {
  reserved: false
}], ['h4', {
  reserved: false
}], ['h5', {
  reserved: false
}], ['h6', {
  reserved: false
}], ['head', {
  reserved: true
}], ['header', {
  reserved: false
}], ['hgroup', {
  reserved: false
}], ['hr', {
  reserved: false
}], ['html', {
  reserved: true
}], ['i', {
  reserved: false
}], ['iframe', {
  reserved: false
}], ['img', {
  reserved: false
}], ['input', {
  reserved: false
}], ['ins', {
  reserved: false
}], ['kbd', {
  reserved: false
}], ['keygen', {
  reserved: false
}], ['label', {
  reserved: false
}], ['legend', {
  reserved: false
}], ['li', {
  reserved: false
}], ['link', {
  reserved: true
}], ['main', {
  reserved: false
}], ['map', {
  reserved: false
}], ['mark', {
  reserved: false
}], ['marquee', {
  reserved: false
}], ['menu', {
  reserved: false
}], ['menuitem', {
  reserved: false
}], ['meta', {
  reserved: true
}], ['meter', {
  reserved: false
}], ['nav', {
  reserved: false
}], ['noembed', {
  reserved: true
}], ['noscript', {
  reserved: true
}], ['object', {
  reserved: false
}], ['ol', {
  reserved: false
}], ['optgroup', {
  reserved: false
}], ['option', {
  reserved: false
}], ['output', {
  reserved: false
}], ['p', {
  reserved: false
}], ['param', {
  reserved: true
}], ['picture', {
  reserved: true
}], ['pre', {
  reserved: false
}], ['progress', {
  reserved: false
}], ['q', {
  reserved: false
}], ['rp', {
  reserved: false
}], ['rt', {
  reserved: false
}], ['rtc', {
  reserved: false
}], ['ruby', {
  reserved: false
}], ['s', {
  reserved: false
}], ['samp', {
  reserved: false
}], ['script', {
  reserved: true
}], ['section', {
  reserved: false
}], ['select', {
  reserved: false
}], ['small', {
  reserved: false
}], ['source', {
  reserved: true
}], ['spacer', {
  reserved: false
}], ['span', {
  reserved: false
}], ['strike', {
  reserved: false
}], ['strong', {
  reserved: false
}], ['style', {
  reserved: true
}], ['sub', {
  reserved: false
}], ['summary', {
  reserved: false
}], ['sup', {
  reserved: false
}], ['table', {
  reserved: false
}], ['tbody', {
  reserved: false
}], ['td', {
  reserved: false
}], ['textarea', {
  reserved: false
}], ['tfoot', {
  reserved: false
}], ['th', {
  reserved: false
}], ['thead', {
  reserved: false
}], ['time', {
  reserved: false
}], ['title', {
  reserved: true
}], ['tr', {
  reserved: false
}], ['track', {
  reserved: true
}], ['tt', {
  reserved: false
}], ['u', {
  reserved: false
}], ['ul', {
  reserved: false
}], ['var', {
  reserved: false
}], ['video', {
  reserved: false
}], ['wbr', {
  reserved: false
}], ['xmp', {
  reserved: false
}]];
var domMap = {
  entries: function entries() {
    return dom;
  },
  get: function get(key) {
    var item = dom.find(function (tuple) {
      return tuple[0] === key ? true : false;
    });
    return item && item[1];
  },
  has: function has(key) {
    return !!this.get(key);
  },
  keys: function keys() {
    return dom.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          key = _ref2[0];

      return key;
    });
  },
  values: function values() {
    return dom.map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          values = _ref4[1];

      return values;
    });
  }
};
var _default = domMap;
exports.default = _default;
},{}],90:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rolesMap = _interopRequireDefault(require("./rolesMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var elementRoles = [];

var keys = _rolesMap.default.keys();

for (var i = 0; i < keys.length; i++) {
  var _key = keys[i];

  var role = _rolesMap.default.get(_key);

  if (role) {
    var concepts = [].concat(role.baseConcepts, role.relatedConcepts);

    for (var k = 0; k < concepts.length; k++) {
      var relation = concepts[k];

      if (relation.module === 'HTML') {
        var concept = relation.concept;

        if (concept) {
          (function () {
            var conceptStr = JSON.stringify(concept);
            var elementRoleRelation = elementRoles.find(function (relation) {
              return JSON.stringify(relation[0]) === conceptStr;
            });
            var roles = void 0;

            if (elementRoleRelation) {
              roles = elementRoleRelation[1];
            } else {
              roles = [];
            }

            var isUnique = true;

            for (var _i = 0; _i < roles.length; _i++) {
              if (roles[_i] === _key) {
                isUnique = false;
                break;
              }
            }

            if (isUnique) {
              roles.push(_key);
            }

            elementRoles.push([concept, roles]);
          })();
        }
      }
    }
  }
}

var elementRoleMap = {
  entries: function entries() {
    return elementRoles;
  },
  get: function get(key) {
    var item = elementRoles.find(function (tuple) {
      return JSON.stringify(tuple[0]) === JSON.stringify(key) ? true : false;
    });
    return item && item[1];
  },
  has: function has(key) {
    return !!this.get(key);
  },
  keys: function keys() {
    return elementRoles.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          key = _ref2[0];

      return key;
    });
  },
  values: function values() {
    return elementRoles.map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          values = _ref4[1];

      return values;
    });
  }
};
var _default = elementRoleMap;
exports.default = _default;
},{"./rolesMap":229}],91:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var commandRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'menuitem'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget']]
};
var _default = commandRole;
exports.default = _default;
},{}],92:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var compositeRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-activedescendant': null,
    'aria-disabled': null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget']]
};
var _default = compositeRole;
exports.default = _default;
},{}],93:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var inputRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null
  },
  relatedConcepts: [{
    concept: {
      name: 'input'
    },
    module: 'XForms'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget']]
};
var _default = inputRole;
exports.default = _default;
},{}],94:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var landmarkRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = landmarkRole;
exports.default = _default;
},{}],95:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var rangeRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-valuemax': null,
    'aria-valuemin': null,
    'aria-valuenow': null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = rangeRole;
exports.default = _default;
},{}],96:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var roletypeRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: [],
  prohibitedProps: [],
  props: {
    'aria-atomic': null,
    'aria-busy': null,
    'aria-controls': null,
    'aria-current': null,
    'aria-describedby': null,
    'aria-details': null,
    'aria-dropeffect': null,
    'aria-flowto': null,
    'aria-grabbed': null,
    'aria-hidden': null,
    'aria-keyshortcuts': null,
    'aria-label': null,
    'aria-labelledby': null,
    'aria-live': null,
    'aria-owns': null,
    'aria-relevant': null,
    'aria-roledescription': null
  },
  relatedConcepts: [{
    concept: {
      name: 'rel'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'role'
    },
    module: 'XHTML'
  }, {
    concept: {
      name: 'type'
    },
    module: 'Dublin Core'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: []
};
var _default = roletypeRole;
exports.default = _default;
},{}],97:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var sectionRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: [],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'frontmatter'
    },
    module: 'DTB'
  }, {
    concept: {
      name: 'level'
    },
    module: 'DTB'
  }, {
    concept: {
      name: 'level'
    },
    module: 'SMIL'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = sectionRole;
exports.default = _default;
},{}],98:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var sectionheadRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = sectionheadRole;
exports.default = _default;
},{}],99:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var selectRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-orientation': null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite'], ['roletype', 'structure', 'section', 'group']]
};
var _default = selectRole;
exports.default = _default;
},{}],100:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var structureRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: [],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype']]
};
var _default = structureRole;
exports.default = _default;
},{}],101:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var widgetRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: [],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype']]
};
var _default = widgetRole;
exports.default = _default;
},{}],102:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var windowRole = {
  abstract: true,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-modal': null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype']]
};
var _default = windowRole;
exports.default = _default;
},{}],103:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commandRole = _interopRequireDefault(require("./abstract/commandRole"));

var _compositeRole = _interopRequireDefault(require("./abstract/compositeRole"));

var _inputRole = _interopRequireDefault(require("./abstract/inputRole"));

var _landmarkRole = _interopRequireDefault(require("./abstract/landmarkRole"));

var _rangeRole = _interopRequireDefault(require("./abstract/rangeRole"));

var _roletypeRole = _interopRequireDefault(require("./abstract/roletypeRole"));

var _sectionRole = _interopRequireDefault(require("./abstract/sectionRole"));

var _sectionheadRole = _interopRequireDefault(require("./abstract/sectionheadRole"));

var _selectRole = _interopRequireDefault(require("./abstract/selectRole"));

var _structureRole = _interopRequireDefault(require("./abstract/structureRole"));

var _widgetRole = _interopRequireDefault(require("./abstract/widgetRole"));

var _windowRole = _interopRequireDefault(require("./abstract/windowRole"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ariaAbstractRoles = [['command', _commandRole.default], ['composite', _compositeRole.default], ['input', _inputRole.default], ['landmark', _landmarkRole.default], ['range', _rangeRole.default], ['roletype', _roletypeRole.default], ['section', _sectionRole.default], ['sectionhead', _sectionheadRole.default], ['select', _selectRole.default], ['structure', _structureRole.default], ['widget', _widgetRole.default], ['window', _windowRole.default]];
var _default = ariaAbstractRoles;
exports.default = _default;
},{"./abstract/commandRole":91,"./abstract/compositeRole":92,"./abstract/inputRole":93,"./abstract/landmarkRole":94,"./abstract/rangeRole":95,"./abstract/roletypeRole":96,"./abstract/sectionRole":97,"./abstract/sectionheadRole":98,"./abstract/selectRole":99,"./abstract/structureRole":100,"./abstract/widgetRole":101,"./abstract/windowRole":102}],104:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _docAbstractRole = _interopRequireDefault(require("./dpub/docAbstractRole"));

var _docAcknowledgmentsRole = _interopRequireDefault(require("./dpub/docAcknowledgmentsRole"));

var _docAfterwordRole = _interopRequireDefault(require("./dpub/docAfterwordRole"));

var _docAppendixRole = _interopRequireDefault(require("./dpub/docAppendixRole"));

var _docBacklinkRole = _interopRequireDefault(require("./dpub/docBacklinkRole"));

var _docBiblioentryRole = _interopRequireDefault(require("./dpub/docBiblioentryRole"));

var _docBibliographyRole = _interopRequireDefault(require("./dpub/docBibliographyRole"));

var _docBibliorefRole = _interopRequireDefault(require("./dpub/docBibliorefRole"));

var _docChapterRole = _interopRequireDefault(require("./dpub/docChapterRole"));

var _docColophonRole = _interopRequireDefault(require("./dpub/docColophonRole"));

var _docConclusionRole = _interopRequireDefault(require("./dpub/docConclusionRole"));

var _docCoverRole = _interopRequireDefault(require("./dpub/docCoverRole"));

var _docCreditRole = _interopRequireDefault(require("./dpub/docCreditRole"));

var _docCreditsRole = _interopRequireDefault(require("./dpub/docCreditsRole"));

var _docDedicationRole = _interopRequireDefault(require("./dpub/docDedicationRole"));

var _docEndnoteRole = _interopRequireDefault(require("./dpub/docEndnoteRole"));

var _docEndnotesRole = _interopRequireDefault(require("./dpub/docEndnotesRole"));

var _docEpigraphRole = _interopRequireDefault(require("./dpub/docEpigraphRole"));

var _docEpilogueRole = _interopRequireDefault(require("./dpub/docEpilogueRole"));

var _docErrataRole = _interopRequireDefault(require("./dpub/docErrataRole"));

var _docExampleRole = _interopRequireDefault(require("./dpub/docExampleRole"));

var _docFootnoteRole = _interopRequireDefault(require("./dpub/docFootnoteRole"));

var _docForewordRole = _interopRequireDefault(require("./dpub/docForewordRole"));

var _docGlossaryRole = _interopRequireDefault(require("./dpub/docGlossaryRole"));

var _docGlossrefRole = _interopRequireDefault(require("./dpub/docGlossrefRole"));

var _docIndexRole = _interopRequireDefault(require("./dpub/docIndexRole"));

var _docIntroductionRole = _interopRequireDefault(require("./dpub/docIntroductionRole"));

var _docNoterefRole = _interopRequireDefault(require("./dpub/docNoterefRole"));

var _docNoticeRole = _interopRequireDefault(require("./dpub/docNoticeRole"));

var _docPagebreakRole = _interopRequireDefault(require("./dpub/docPagebreakRole"));

var _docPagelistRole = _interopRequireDefault(require("./dpub/docPagelistRole"));

var _docPartRole = _interopRequireDefault(require("./dpub/docPartRole"));

var _docPrefaceRole = _interopRequireDefault(require("./dpub/docPrefaceRole"));

var _docPrologueRole = _interopRequireDefault(require("./dpub/docPrologueRole"));

var _docPullquoteRole = _interopRequireDefault(require("./dpub/docPullquoteRole"));

var _docQnaRole = _interopRequireDefault(require("./dpub/docQnaRole"));

var _docSubtitleRole = _interopRequireDefault(require("./dpub/docSubtitleRole"));

var _docTipRole = _interopRequireDefault(require("./dpub/docTipRole"));

var _docTocRole = _interopRequireDefault(require("./dpub/docTocRole"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ariaDpubRoles = [['doc-abstract', _docAbstractRole.default], ['doc-acknowledgments', _docAcknowledgmentsRole.default], ['doc-afterword', _docAfterwordRole.default], ['doc-appendix', _docAppendixRole.default], ['doc-backlink', _docBacklinkRole.default], ['doc-biblioentry', _docBiblioentryRole.default], ['doc-bibliography', _docBibliographyRole.default], ['doc-biblioref', _docBibliorefRole.default], ['doc-chapter', _docChapterRole.default], ['doc-colophon', _docColophonRole.default], ['doc-conclusion', _docConclusionRole.default], ['doc-cover', _docCoverRole.default], ['doc-credit', _docCreditRole.default], ['doc-credits', _docCreditsRole.default], ['doc-dedication', _docDedicationRole.default], ['doc-endnote', _docEndnoteRole.default], ['doc-endnotes', _docEndnotesRole.default], ['doc-epigraph', _docEpigraphRole.default], ['doc-epilogue', _docEpilogueRole.default], ['doc-errata', _docErrataRole.default], ['doc-example', _docExampleRole.default], ['doc-footnote', _docFootnoteRole.default], ['doc-foreword', _docForewordRole.default], ['doc-glossary', _docGlossaryRole.default], ['doc-glossref', _docGlossrefRole.default], ['doc-index', _docIndexRole.default], ['doc-introduction', _docIntroductionRole.default], ['doc-noteref', _docNoterefRole.default], ['doc-notice', _docNoticeRole.default], ['doc-pagebreak', _docPagebreakRole.default], ['doc-pagelist', _docPagelistRole.default], ['doc-part', _docPartRole.default], ['doc-preface', _docPrefaceRole.default], ['doc-prologue', _docPrologueRole.default], ['doc-pullquote', _docPullquoteRole.default], ['doc-qna', _docQnaRole.default], ['doc-subtitle', _docSubtitleRole.default], ['doc-tip', _docTipRole.default], ['doc-toc', _docTocRole.default]];
var _default = ariaDpubRoles;
exports.default = _default;
},{"./dpub/docAbstractRole":106,"./dpub/docAcknowledgmentsRole":107,"./dpub/docAfterwordRole":108,"./dpub/docAppendixRole":109,"./dpub/docBacklinkRole":110,"./dpub/docBiblioentryRole":111,"./dpub/docBibliographyRole":112,"./dpub/docBibliorefRole":113,"./dpub/docChapterRole":114,"./dpub/docColophonRole":115,"./dpub/docConclusionRole":116,"./dpub/docCoverRole":117,"./dpub/docCreditRole":118,"./dpub/docCreditsRole":119,"./dpub/docDedicationRole":120,"./dpub/docEndnoteRole":121,"./dpub/docEndnotesRole":122,"./dpub/docEpigraphRole":123,"./dpub/docEpilogueRole":124,"./dpub/docErrataRole":125,"./dpub/docExampleRole":126,"./dpub/docFootnoteRole":127,"./dpub/docForewordRole":128,"./dpub/docGlossaryRole":129,"./dpub/docGlossrefRole":130,"./dpub/docIndexRole":131,"./dpub/docIntroductionRole":132,"./dpub/docNoterefRole":133,"./dpub/docNoticeRole":134,"./dpub/docPagebreakRole":135,"./dpub/docPagelistRole":136,"./dpub/docPartRole":137,"./dpub/docPrefaceRole":138,"./dpub/docPrologueRole":139,"./dpub/docPullquoteRole":140,"./dpub/docQnaRole":141,"./dpub/docSubtitleRole":142,"./dpub/docTipRole":143,"./dpub/docTocRole":144}],105:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _alertRole = _interopRequireDefault(require("./literal/alertRole"));

var _alertdialogRole = _interopRequireDefault(require("./literal/alertdialogRole"));

var _applicationRole = _interopRequireDefault(require("./literal/applicationRole"));

var _articleRole = _interopRequireDefault(require("./literal/articleRole"));

var _bannerRole = _interopRequireDefault(require("./literal/bannerRole"));

var _blockquoteRole = _interopRequireDefault(require("./literal/blockquoteRole"));

var _buttonRole = _interopRequireDefault(require("./literal/buttonRole"));

var _captionRole = _interopRequireDefault(require("./literal/captionRole"));

var _cellRole = _interopRequireDefault(require("./literal/cellRole"));

var _checkboxRole = _interopRequireDefault(require("./literal/checkboxRole"));

var _codeRole = _interopRequireDefault(require("./literal/codeRole"));

var _columnheaderRole = _interopRequireDefault(require("./literal/columnheaderRole"));

var _comboboxRole = _interopRequireDefault(require("./literal/comboboxRole"));

var _complementaryRole = _interopRequireDefault(require("./literal/complementaryRole"));

var _contentinfoRole = _interopRequireDefault(require("./literal/contentinfoRole"));

var _definitionRole = _interopRequireDefault(require("./literal/definitionRole"));

var _deletionRole = _interopRequireDefault(require("./literal/deletionRole"));

var _dialogRole = _interopRequireDefault(require("./literal/dialogRole"));

var _directoryRole = _interopRequireDefault(require("./literal/directoryRole"));

var _documentRole = _interopRequireDefault(require("./literal/documentRole"));

var _emphasisRole = _interopRequireDefault(require("./literal/emphasisRole"));

var _feedRole = _interopRequireDefault(require("./literal/feedRole"));

var _figureRole = _interopRequireDefault(require("./literal/figureRole"));

var _formRole = _interopRequireDefault(require("./literal/formRole"));

var _genericRole = _interopRequireDefault(require("./literal/genericRole"));

var _gridRole = _interopRequireDefault(require("./literal/gridRole"));

var _gridcellRole = _interopRequireDefault(require("./literal/gridcellRole"));

var _groupRole = _interopRequireDefault(require("./literal/groupRole"));

var _headingRole = _interopRequireDefault(require("./literal/headingRole"));

var _imgRole = _interopRequireDefault(require("./literal/imgRole"));

var _insertionRole = _interopRequireDefault(require("./literal/insertionRole"));

var _linkRole = _interopRequireDefault(require("./literal/linkRole"));

var _listRole = _interopRequireDefault(require("./literal/listRole"));

var _listboxRole = _interopRequireDefault(require("./literal/listboxRole"));

var _listitemRole = _interopRequireDefault(require("./literal/listitemRole"));

var _logRole = _interopRequireDefault(require("./literal/logRole"));

var _mainRole = _interopRequireDefault(require("./literal/mainRole"));

var _marqueeRole = _interopRequireDefault(require("./literal/marqueeRole"));

var _mathRole = _interopRequireDefault(require("./literal/mathRole"));

var _menuRole = _interopRequireDefault(require("./literal/menuRole"));

var _menubarRole = _interopRequireDefault(require("./literal/menubarRole"));

var _menuitemRole = _interopRequireDefault(require("./literal/menuitemRole"));

var _menuitemcheckboxRole = _interopRequireDefault(require("./literal/menuitemcheckboxRole"));

var _menuitemradioRole = _interopRequireDefault(require("./literal/menuitemradioRole"));

var _meterRole = _interopRequireDefault(require("./literal/meterRole"));

var _navigationRole = _interopRequireDefault(require("./literal/navigationRole"));

var _noneRole = _interopRequireDefault(require("./literal/noneRole"));

var _noteRole = _interopRequireDefault(require("./literal/noteRole"));

var _optionRole = _interopRequireDefault(require("./literal/optionRole"));

var _paragraphRole = _interopRequireDefault(require("./literal/paragraphRole"));

var _presentationRole = _interopRequireDefault(require("./literal/presentationRole"));

var _progressbarRole = _interopRequireDefault(require("./literal/progressbarRole"));

var _radioRole = _interopRequireDefault(require("./literal/radioRole"));

var _radiogroupRole = _interopRequireDefault(require("./literal/radiogroupRole"));

var _regionRole = _interopRequireDefault(require("./literal/regionRole"));

var _rowRole = _interopRequireDefault(require("./literal/rowRole"));

var _rowgroupRole = _interopRequireDefault(require("./literal/rowgroupRole"));

var _rowheaderRole = _interopRequireDefault(require("./literal/rowheaderRole"));

var _scrollbarRole = _interopRequireDefault(require("./literal/scrollbarRole"));

var _searchRole = _interopRequireDefault(require("./literal/searchRole"));

var _searchboxRole = _interopRequireDefault(require("./literal/searchboxRole"));

var _separatorRole = _interopRequireDefault(require("./literal/separatorRole"));

var _sliderRole = _interopRequireDefault(require("./literal/sliderRole"));

var _spinbuttonRole = _interopRequireDefault(require("./literal/spinbuttonRole"));

var _statusRole = _interopRequireDefault(require("./literal/statusRole"));

var _strongRole = _interopRequireDefault(require("./literal/strongRole"));

var _subscriptRole = _interopRequireDefault(require("./literal/subscriptRole"));

var _superscriptRole = _interopRequireDefault(require("./literal/superscriptRole"));

var _switchRole = _interopRequireDefault(require("./literal/switchRole"));

var _tabRole = _interopRequireDefault(require("./literal/tabRole"));

var _tableRole = _interopRequireDefault(require("./literal/tableRole"));

var _tablistRole = _interopRequireDefault(require("./literal/tablistRole"));

var _tabpanelRole = _interopRequireDefault(require("./literal/tabpanelRole"));

var _termRole = _interopRequireDefault(require("./literal/termRole"));

var _textboxRole = _interopRequireDefault(require("./literal/textboxRole"));

var _timeRole = _interopRequireDefault(require("./literal/timeRole"));

var _timerRole = _interopRequireDefault(require("./literal/timerRole"));

var _toolbarRole = _interopRequireDefault(require("./literal/toolbarRole"));

var _tooltipRole = _interopRequireDefault(require("./literal/tooltipRole"));

var _treeRole = _interopRequireDefault(require("./literal/treeRole"));

var _treegridRole = _interopRequireDefault(require("./literal/treegridRole"));

var _treeitemRole = _interopRequireDefault(require("./literal/treeitemRole"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ariaLiteralRoles = [['alert', _alertRole.default], ['alertdialog', _alertdialogRole.default], ['application', _applicationRole.default], ['article', _articleRole.default], ['banner', _bannerRole.default], ['blockquote', _blockquoteRole.default], ['button', _buttonRole.default], ['caption', _captionRole.default], ['cell', _cellRole.default], ['checkbox', _checkboxRole.default], ['code', _codeRole.default], ['columnheader', _columnheaderRole.default], ['combobox', _comboboxRole.default], ['complementary', _complementaryRole.default], ['contentinfo', _contentinfoRole.default], ['definition', _definitionRole.default], ['deletion', _deletionRole.default], ['dialog', _dialogRole.default], ['directory', _directoryRole.default], ['document', _documentRole.default], ['emphasis', _emphasisRole.default], ['feed', _feedRole.default], ['figure', _figureRole.default], ['form', _formRole.default], ['generic', _genericRole.default], ['grid', _gridRole.default], ['gridcell', _gridcellRole.default], ['group', _groupRole.default], ['heading', _headingRole.default], ['img', _imgRole.default], ['insertion', _insertionRole.default], ['link', _linkRole.default], ['list', _listRole.default], ['listbox', _listboxRole.default], ['listitem', _listitemRole.default], ['log', _logRole.default], ['main', _mainRole.default], ['marquee', _marqueeRole.default], ['math', _mathRole.default], ['menu', _menuRole.default], ['menubar', _menubarRole.default], ['menuitem', _menuitemRole.default], ['menuitemcheckbox', _menuitemcheckboxRole.default], ['menuitemradio', _menuitemradioRole.default], ['meter', _meterRole.default], ['navigation', _navigationRole.default], ['none', _noneRole.default], ['note', _noteRole.default], ['option', _optionRole.default], ['paragraph', _paragraphRole.default], ['presentation', _presentationRole.default], ['progressbar', _progressbarRole.default], ['radio', _radioRole.default], ['radiogroup', _radiogroupRole.default], ['region', _regionRole.default], ['row', _rowRole.default], ['rowgroup', _rowgroupRole.default], ['rowheader', _rowheaderRole.default], ['scrollbar', _scrollbarRole.default], ['search', _searchRole.default], ['searchbox', _searchboxRole.default], ['separator', _separatorRole.default], ['slider', _sliderRole.default], ['spinbutton', _spinbuttonRole.default], ['status', _statusRole.default], ['strong', _strongRole.default], ['subscript', _subscriptRole.default], ['superscript', _superscriptRole.default], ['switch', _switchRole.default], ['tab', _tabRole.default], ['table', _tableRole.default], ['tablist', _tablistRole.default], ['tabpanel', _tabpanelRole.default], ['term', _termRole.default], ['textbox', _textboxRole.default], ['time', _timeRole.default], ['timer', _timerRole.default], ['toolbar', _toolbarRole.default], ['tooltip', _tooltipRole.default], ['tree', _treeRole.default], ['treegrid', _treegridRole.default], ['treeitem', _treeitemRole.default]];
var _default = ariaLiteralRoles;
exports.default = _default;
},{"./literal/alertRole":145,"./literal/alertdialogRole":146,"./literal/applicationRole":147,"./literal/articleRole":148,"./literal/bannerRole":149,"./literal/blockquoteRole":150,"./literal/buttonRole":151,"./literal/captionRole":152,"./literal/cellRole":153,"./literal/checkboxRole":154,"./literal/codeRole":155,"./literal/columnheaderRole":156,"./literal/comboboxRole":157,"./literal/complementaryRole":158,"./literal/contentinfoRole":159,"./literal/definitionRole":160,"./literal/deletionRole":161,"./literal/dialogRole":162,"./literal/directoryRole":163,"./literal/documentRole":164,"./literal/emphasisRole":165,"./literal/feedRole":166,"./literal/figureRole":167,"./literal/formRole":168,"./literal/genericRole":169,"./literal/gridRole":170,"./literal/gridcellRole":171,"./literal/groupRole":172,"./literal/headingRole":173,"./literal/imgRole":174,"./literal/insertionRole":175,"./literal/linkRole":176,"./literal/listRole":177,"./literal/listboxRole":178,"./literal/listitemRole":179,"./literal/logRole":180,"./literal/mainRole":181,"./literal/marqueeRole":182,"./literal/mathRole":183,"./literal/menuRole":184,"./literal/menubarRole":185,"./literal/menuitemRole":186,"./literal/menuitemcheckboxRole":187,"./literal/menuitemradioRole":188,"./literal/meterRole":189,"./literal/navigationRole":190,"./literal/noneRole":191,"./literal/noteRole":192,"./literal/optionRole":193,"./literal/paragraphRole":194,"./literal/presentationRole":195,"./literal/progressbarRole":196,"./literal/radioRole":197,"./literal/radiogroupRole":198,"./literal/regionRole":199,"./literal/rowRole":200,"./literal/rowgroupRole":201,"./literal/rowheaderRole":202,"./literal/scrollbarRole":203,"./literal/searchRole":204,"./literal/searchboxRole":205,"./literal/separatorRole":206,"./literal/sliderRole":207,"./literal/spinbuttonRole":208,"./literal/statusRole":209,"./literal/strongRole":210,"./literal/subscriptRole":211,"./literal/superscriptRole":212,"./literal/switchRole":213,"./literal/tabRole":214,"./literal/tableRole":215,"./literal/tablistRole":216,"./literal/tabpanelRole":217,"./literal/termRole":218,"./literal/textboxRole":219,"./literal/timeRole":220,"./literal/timerRole":221,"./literal/toolbarRole":222,"./literal/tooltipRole":223,"./literal/treeRole":224,"./literal/treegridRole":225,"./literal/treeitemRole":226}],106:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docAbstractRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'abstract [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = docAbstractRole;
exports.default = _default;
},{}],107:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docAcknowledgmentsRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'acknowledgments [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docAcknowledgmentsRole;
exports.default = _default;
},{}],108:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docAfterwordRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'afterword [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docAfterwordRole;
exports.default = _default;
},{}],109:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docAppendixRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'appendix [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docAppendixRole;
exports.default = _default;
},{}],110:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docBacklinkRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'content'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'referrer [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'command', 'link']]
};
var _default = docBacklinkRole;
exports.default = _default;
},{}],111:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docBiblioentryRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'EPUB biblioentry [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: ['doc-bibliography'],
  requiredContextRole: ['doc-bibliography'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'listitem']]
};
var _default = docBiblioentryRole;
exports.default = _default;
},{}],112:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docBibliographyRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'bibliography [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['doc-biblioentry']],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docBibliographyRole;
exports.default = _default;
},{}],113:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docBibliorefRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'biblioref [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'command', 'link']]
};
var _default = docBibliorefRole;
exports.default = _default;
},{}],114:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docChapterRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'chapter [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docChapterRole;
exports.default = _default;
},{}],115:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docColophonRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'colophon [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = docColophonRole;
exports.default = _default;
},{}],116:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docConclusionRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'conclusion [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docConclusionRole;
exports.default = _default;
},{}],117:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docCoverRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'cover [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'img']]
};
var _default = docCoverRole;
exports.default = _default;
},{}],118:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docCreditRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'credit [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = docCreditRole;
exports.default = _default;
},{}],119:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docCreditsRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'credits [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docCreditsRole;
exports.default = _default;
},{}],120:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docDedicationRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'dedication [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = docDedicationRole;
exports.default = _default;
},{}],121:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docEndnoteRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'rearnote [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: ['doc-endnotes'],
  requiredContextRole: ['doc-endnotes'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'listitem']]
};
var _default = docEndnoteRole;
exports.default = _default;
},{}],122:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docEndnotesRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'rearnotes [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['doc-endnote']],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docEndnotesRole;
exports.default = _default;
},{}],123:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docEpigraphRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'epigraph [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = docEpigraphRole;
exports.default = _default;
},{}],124:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docEpilogueRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'epilogue [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docEpilogueRole;
exports.default = _default;
},{}],125:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docErrataRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'errata [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docErrataRole;
exports.default = _default;
},{}],126:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docExampleRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = docExampleRole;
exports.default = _default;
},{}],127:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docFootnoteRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'footnote [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = docFootnoteRole;
exports.default = _default;
},{}],128:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docForewordRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'foreword [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docForewordRole;
exports.default = _default;
},{}],129:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docGlossaryRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'glossary [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['definition'], ['term']],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docGlossaryRole;
exports.default = _default;
},{}],130:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docGlossrefRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'glossref [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'command', 'link']]
};
var _default = docGlossrefRole;
exports.default = _default;
},{}],131:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docIndexRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'index [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark', 'navigation']]
};
var _default = docIndexRole;
exports.default = _default;
},{}],132:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docIntroductionRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'introduction [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docIntroductionRole;
exports.default = _default;
},{}],133:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docNoterefRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'noteref [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'command', 'link']]
};
var _default = docNoterefRole;
exports.default = _default;
},{}],134:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docNoticeRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'notice [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'note']]
};
var _default = docNoticeRole;
exports.default = _default;
},{}],135:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docPagebreakRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'pagebreak [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'separator']]
};
var _default = docPagebreakRole;
exports.default = _default;
},{}],136:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docPagelistRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'page-list [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark', 'navigation']]
};
var _default = docPagelistRole;
exports.default = _default;
},{}],137:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docPartRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'part [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docPartRole;
exports.default = _default;
},{}],138:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docPrefaceRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'preface [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docPrefaceRole;
exports.default = _default;
},{}],139:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docPrologueRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'prologue [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = docPrologueRole;
exports.default = _default;
},{}],140:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docPullquoteRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'pullquote [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['none']]
};
var _default = docPullquoteRole;
exports.default = _default;
},{}],141:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docQnaRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'qna [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = docQnaRole;
exports.default = _default;
},{}],142:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docSubtitleRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'subtitle [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'sectionhead']]
};
var _default = docSubtitleRole;
exports.default = _default;
},{}],143:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docTipRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'help [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'note']]
};
var _default = docTipRole;
exports.default = _default;
},{}],144:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docTocRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'toc [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark', 'navigation']]
};
var _default = docTocRole;
exports.default = _default;
},{}],145:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var alertRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-atomic': 'true',
    'aria-live': 'assertive'
  },
  relatedConcepts: [{
    concept: {
      name: 'alert'
    },
    module: 'XForms'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = alertRole;
exports.default = _default;
},{}],146:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var alertdialogRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'alert'
    },
    module: 'XForms'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'alert'], ['roletype', 'window', 'dialog']]
};
var _default = alertdialogRole;
exports.default = _default;
},{}],147:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var applicationRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-activedescendant': null,
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'Device Independence Delivery Unit'
    }
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = applicationRole;
exports.default = _default;
},{}],148:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var articleRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-posinset': null,
    'aria-setsize': null
  },
  relatedConcepts: [{
    concept: {
      name: 'article'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'document']]
};
var _default = articleRole;
exports.default = _default;
},{}],149:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var bannerRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      constraints: ['direct descendant of document'],
      name: 'header'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = bannerRole;
exports.default = _default;
},{}],150:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var blockquoteRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = blockquoteRole;
exports.default = _default;
},{}],151:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var buttonRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-pressed': null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'aria-pressed'
      }, {
        name: 'type',
        value: 'checkbox'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'aria-expanded',
        value: 'false'
      }],
      name: 'summary'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'aria-expanded',
        value: 'true'
      }],
      constraints: ['direct descendant of details element with the open attribute defined'],
      name: 'summary'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'type',
        value: 'button'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'type',
        value: 'image'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'type',
        value: 'reset'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'type',
        value: 'submit'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'button'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'trigger'
    },
    module: 'XForms'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'command']]
};
var _default = buttonRole;
exports.default = _default;
},{}],152:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var captionRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: ['figure', 'grid', 'table'],
  requiredContextRole: ['figure', 'grid', 'table'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = captionRole;
exports.default = _default;
},{}],153:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var cellRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-colindex': null,
    'aria-colspan': null,
    'aria-rowindex': null,
    'aria-rowspan': null
  },
  relatedConcepts: [{
    concept: {
      constraints: ['descendant of table'],
      name: 'td'
    },
    module: 'HTML'
  }],
  requireContextRole: ['row'],
  requiredContextRole: ['row'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = cellRole;
exports.default = _default;
},{}],154:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var checkboxRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-checked': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-invalid': null,
    'aria-readonly': null,
    'aria-required': null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: 'type',
        value: 'checkbox'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'option'
    },
    module: 'ARIA'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-checked': null
  },
  superClass: [['roletype', 'widget', 'input']]
};
var _default = checkboxRole;
exports.default = _default;
},{}],155:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var codeRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = codeRole;
exports.default = _default;
},{}],156:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var columnheaderRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-sort': null
  },
  relatedConcepts: [{
    attributes: [{
      name: 'scope',
      value: 'col'
    }],
    concept: {
      name: 'th'
    },
    module: 'HTML'
  }],
  requireContextRole: ['row'],
  requiredContextRole: ['row'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'cell'], ['roletype', 'structure', 'section', 'cell', 'gridcell'], ['roletype', 'widget', 'gridcell'], ['roletype', 'structure', 'sectionhead']]
};
var _default = columnheaderRole;
exports.default = _default;
},{}],157:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var comboboxRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-activedescendant': null,
    'aria-autocomplete': null,
    'aria-errormessage': null,
    'aria-invalid': null,
    'aria-readonly': null,
    'aria-required': null,
    'aria-expanded': 'false',
    'aria-haspopup': 'listbox'
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'list'
      }, {
        name: 'type',
        value: 'email'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'list'
      }, {
        name: 'type',
        value: 'search'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'list'
      }, {
        name: 'type',
        value: 'tel'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'list'
      }, {
        name: 'type',
        value: 'text'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'list'
      }, {
        name: 'type',
        value: 'url'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'list'
      }, {
        name: 'type',
        value: 'url'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'multiple'
      }, {
        constraints: ['undefined'],
        name: 'size'
      }],
      name: 'select'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'multiple'
      }, {
        name: 'size',
        value: 1
      }],
      name: 'select'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'select'
    },
    module: 'XForms'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-controls': null,
    'aria-expanded': 'false'
  },
  superClass: [['roletype', 'widget', 'input']]
};
var _default = comboboxRole;
exports.default = _default;
},{}],158:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var complementaryRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'aside'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = complementaryRole;
exports.default = _default;
},{}],159:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var contentinfoRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      constraints: ['direct descendant of document'],
      name: 'footer'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = contentinfoRole;
exports.default = _default;
},{}],160:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var definitionRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'dd'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = definitionRole;
exports.default = _default;
},{}],161:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var deletionRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = deletionRole;
exports.default = _default;
},{}],162:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var dialogRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'dialog'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'window']]
};
var _default = dialogRole;
exports.default = _default;
},{}],163:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var directoryRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    module: 'DAISY Guide'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'list']]
};
var _default = directoryRole;
exports.default = _default;
},{}],164:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var documentRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'Device Independence Delivery Unit'
    }
  }, {
    concept: {
      name: 'body'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = documentRole;
exports.default = _default;
},{}],165:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var emphasisRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = emphasisRole;
exports.default = _default;
},{}],166:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var feedRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['article']],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'list']]
};
var _default = feedRole;
exports.default = _default;
},{}],167:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var figureRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'figure'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = figureRole;
exports.default = _default;
},{}],168:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var formRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'aria-label'
      }],
      name: 'form'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'aria-labelledby'
      }],
      name: 'form'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'name'
      }],
      name: 'form'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = formRole;
exports.default = _default;
},{}],169:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var genericRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'span'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'div'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = genericRole;
exports.default = _default;
},{}],170:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var gridRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-multiselectable': null,
    'aria-readonly': null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: 'role',
        value: 'grid'
      }],
      name: 'table'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['row'], ['row', 'rowgroup']],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite'], ['roletype', 'structure', 'section', 'table']]
};
var _default = gridRole;
exports.default = _default;
},{}],171:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var gridcellRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-invalid': null,
    'aria-readonly': null,
    'aria-required': null,
    'aria-selected': null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: 'role',
        value: 'gridcell'
      }],
      name: 'td'
    },
    module: 'HTML'
  }],
  requireContextRole: ['row'],
  requiredContextRole: ['row'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'cell'], ['roletype', 'widget']]
};
var _default = gridcellRole;
exports.default = _default;
},{}],172:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var groupRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-activedescendant': null,
    'aria-disabled': null
  },
  relatedConcepts: [{
    concept: {
      name: 'details'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'fieldset'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'optgroup'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = groupRole;
exports.default = _default;
},{}],173:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var headingRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-level': '2'
  },
  relatedConcepts: [{
    concept: {
      name: 'h1'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'h2'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'h3'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'h4'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'h5'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'h6'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-level': '2'
  },
  superClass: [['roletype', 'structure', 'sectionhead']]
};
var _default = headingRole;
exports.default = _default;
},{}],174:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var imgRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'alt'
      }],
      name: 'img'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'alt'
      }],
      name: 'img'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'imggroup'
    },
    module: 'DTB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = imgRole;
exports.default = _default;
},{}],175:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var insertionRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = insertionRole;
exports.default = _default;
},{}],176:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var linkRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-expanded': null,
    'aria-haspopup': null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: 'href'
      }],
      name: 'a'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'href'
      }],
      name: 'area'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'href'
      }],
      name: 'link'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'command']]
};
var _default = linkRole;
exports.default = _default;
},{}],177:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var listRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'menu'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'ol'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'ul'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['listitem']],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = listRole;
exports.default = _default;
},{}],178:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var listboxRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-expanded': null,
    'aria-invalid': null,
    'aria-multiselectable': null,
    'aria-readonly': null,
    'aria-required': null,
    'aria-orientation': 'vertical'
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ['>1'],
        name: 'size'
      }, {
        name: 'multiple'
      }],
      name: 'select'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['>1'],
        name: 'size'
      }],
      name: 'select'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        name: 'multiple'
      }],
      name: 'select'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'datalist'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'list'
    },
    module: 'ARIA'
  }, {
    concept: {
      name: 'select'
    },
    module: 'XForms'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['option', 'group'], ['option']],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite', 'select'], ['roletype', 'structure', 'section', 'group', 'select']]
};
var _default = listboxRole;
exports.default = _default;
},{}],179:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var listitemRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-level': null,
    'aria-posinset': null,
    'aria-setsize': null
  },
  relatedConcepts: [{
    concept: {
      constraints: ['direct descendant of ol, ul or menu'],
      name: 'li'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'item'
    },
    module: 'XForms'
  }],
  requireContextRole: ['directory', 'list'],
  requiredContextRole: ['directory', 'list'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = listitemRole;
exports.default = _default;
},{}],180:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var logRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-live': 'polite'
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = logRole;
exports.default = _default;
},{}],181:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var mainRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'main'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = mainRole;
exports.default = _default;
},{}],182:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var marqueeRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = marqueeRole;
exports.default = _default;
},{}],183:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var mathRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'math'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = mathRole;
exports.default = _default;
},{}],184:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var menuRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-orientation': 'vertical'
  },
  relatedConcepts: [{
    concept: {
      name: 'MENU'
    },
    module: 'JAPI'
  }, {
    concept: {
      name: 'list'
    },
    module: 'ARIA'
  }, {
    concept: {
      name: 'select'
    },
    module: 'XForms'
  }, {
    concept: {
      name: 'sidebar'
    },
    module: 'DTB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['menuitem', 'group'], ['menuitemradio', 'group'], ['menuitemcheckbox', 'group'], ['menuitem'], ['menuitemcheckbox'], ['menuitemradio']],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite', 'select'], ['roletype', 'structure', 'section', 'group', 'select']]
};
var _default = menuRole;
exports.default = _default;
},{}],185:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var menubarRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-orientation': 'horizontal'
  },
  relatedConcepts: [{
    concept: {
      name: 'toolbar'
    },
    module: 'ARIA'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['menuitem', 'group'], ['menuitemradio', 'group'], ['menuitemcheckbox', 'group'], ['menuitem'], ['menuitemcheckbox'], ['menuitemradio']],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite', 'select', 'menu'], ['roletype', 'structure', 'section', 'group', 'select', 'menu']]
};
var _default = menubarRole;
exports.default = _default;
},{}],186:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var menuitemRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-posinset': null,
    'aria-setsize': null
  },
  relatedConcepts: [{
    concept: {
      name: 'MENU_ITEM'
    },
    module: 'JAPI'
  }, {
    concept: {
      name: 'listitem'
    },
    module: 'ARIA'
  }, {
    concept: {
      name: 'menuitem'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'option'
    },
    module: 'ARIA'
  }],
  requireContextRole: ['group', 'menu', 'menubar'],
  requiredContextRole: ['group', 'menu', 'menubar'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'command']]
};
var _default = menuitemRole;
exports.default = _default;
},{}],187:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var menuitemcheckboxRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'menuitem'
    },
    module: 'ARIA'
  }],
  requireContextRole: ['group', 'menu', 'menubar'],
  requiredContextRole: ['group', 'menu', 'menubar'],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-checked': null
  },
  superClass: [['roletype', 'widget', 'input', 'checkbox'], ['roletype', 'widget', 'command', 'menuitem']]
};
var _default = menuitemcheckboxRole;
exports.default = _default;
},{}],188:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var menuitemradioRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'menuitem'
    },
    module: 'ARIA'
  }],
  requireContextRole: ['group', 'menu', 'menubar'],
  requiredContextRole: ['group', 'menu', 'menubar'],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-checked': null
  },
  superClass: [['roletype', 'widget', 'input', 'checkbox', 'menuitemcheckbox'], ['roletype', 'widget', 'command', 'menuitem', 'menuitemcheckbox'], ['roletype', 'widget', 'input', 'radio']]
};
var _default = menuitemradioRole;
exports.default = _default;
},{}],189:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var meterRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-valuetext': null,
    'aria-valuemax': '100',
    'aria-valuemin': '0'
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-valuenow': null
  },
  superClass: [['roletype', 'structure', 'range']]
};
var _default = meterRole;
exports.default = _default;
},{}],190:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var navigationRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'nav'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = navigationRole;
exports.default = _default;
},{}],191:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var noneRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: [],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: []
};
var _default = noneRole;
exports.default = _default;
},{}],192:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var noteRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = noteRole;
exports.default = _default;
},{}],193:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var optionRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-checked': null,
    'aria-posinset': null,
    'aria-setsize': null,
    'aria-selected': 'false'
  },
  relatedConcepts: [{
    concept: {
      name: 'item'
    },
    module: 'XForms'
  }, {
    concept: {
      name: 'listitem'
    },
    module: 'ARIA'
  }, {
    concept: {
      name: 'option'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-selected': 'false'
  },
  superClass: [['roletype', 'widget', 'input']]
};
var _default = optionRole;
exports.default = _default;
},{}],194:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var paragraphRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = paragraphRole;
exports.default = _default;
},{}],195:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var presentationRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = presentationRole;
exports.default = _default;
},{}],196:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var progressbarRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-valuetext': null
  },
  relatedConcepts: [{
    concept: {
      name: 'progress'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'status'
    },
    module: 'ARIA'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'range'], ['roletype', 'widget']]
};
var _default = progressbarRole;
exports.default = _default;
},{}],197:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var radioRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-checked': null,
    'aria-posinset': null,
    'aria-setsize': null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: 'type',
        value: 'radio'
      }],
      name: 'input'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-checked': null
  },
  superClass: [['roletype', 'widget', 'input']]
};
var _default = radioRole;
exports.default = _default;
},{}],198:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var radiogroupRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-invalid': null,
    'aria-readonly': null,
    'aria-required': null
  },
  relatedConcepts: [{
    concept: {
      name: 'list'
    },
    module: 'ARIA'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['radio']],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite', 'select'], ['roletype', 'structure', 'section', 'group', 'select']]
};
var _default = radiogroupRole;
exports.default = _default;
},{}],199:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regionRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'aria-label'
      }],
      name: 'section'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['set'],
        name: 'aria-labelledby'
      }],
      name: 'section'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'Device Independence Glossart perceivable unit'
    }
  }, {
    concept: {
      name: 'frame'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = regionRole;
exports.default = _default;
},{}],200:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var rowRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-colindex': null,
    'aria-expanded': null,
    'aria-level': null,
    'aria-posinset': null,
    'aria-rowindex': null,
    'aria-selected': null,
    'aria-setsize': null
  },
  relatedConcepts: [{
    concept: {
      name: 'tr'
    },
    module: 'HTML'
  }],
  requireContextRole: ['grid', 'rowgroup', 'table', 'treegrid'],
  requiredContextRole: ['grid', 'rowgroup', 'table', 'treegrid'],
  requiredOwnedElements: [['cell'], ['columnheader'], ['gridcell'], ['rowheader']],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'group'], ['roletype', 'widget']]
};
var _default = rowRole;
exports.default = _default;
},{}],201:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var rowgroupRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'tbody'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'tfoot'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'thead'
    },
    module: 'HTML'
  }],
  requireContextRole: ['grid', 'table', 'treegrid'],
  requiredContextRole: ['grid', 'table', 'treegrid'],
  requiredOwnedElements: [['row']],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = rowgroupRole;
exports.default = _default;
},{}],202:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var rowheaderRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-sort': null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: 'scope',
        value: 'row'
      }],
      name: 'th'
    },
    module: 'HTML'
  }],
  requireContextRole: ['row'],
  requiredContextRole: ['row'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'cell'], ['roletype', 'structure', 'section', 'cell', 'gridcell'], ['roletype', 'widget', 'gridcell'], ['roletype', 'structure', 'sectionhead']]
};
var _default = rowheaderRole;
exports.default = _default;
},{}],203:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var scrollbarRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-valuetext': null,
    'aria-orientation': 'vertical',
    'aria-valuemax': '100',
    'aria-valuemin': '0'
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-controls': null,
    'aria-valuenow': null
  },
  superClass: [['roletype', 'structure', 'range'], ['roletype', 'widget']]
};
var _default = scrollbarRole;
exports.default = _default;
},{}],204:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var searchRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'landmark']]
};
var _default = searchRole;
exports.default = _default;
},{}],205:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var searchboxRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'list'
      }, {
        name: 'type',
        value: 'search'
      }],
      name: 'input'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'input', 'textbox']]
};
var _default = searchboxRole;
exports.default = _default;
},{}],206:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var separatorRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-orientation': 'horizontal',
    'aria-valuemax': '100',
    'aria-valuemin': '0',
    'aria-valuenow': null,
    'aria-valuetext': null
  },
  relatedConcepts: [{
    concept: {
      name: 'hr'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure']]
};
var _default = separatorRole;
exports.default = _default;
},{}],207:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var sliderRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-haspopup': null,
    'aria-invalid': null,
    'aria-readonly': null,
    'aria-valuetext': null,
    'aria-orientation': 'horizontal',
    'aria-valuemax': '100',
    'aria-valuemin': '0'
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: 'type',
        value: 'range'
      }],
      name: 'input'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-valuenow': null
  },
  superClass: [['roletype', 'widget', 'input'], ['roletype', 'structure', 'range']]
};
var _default = sliderRole;
exports.default = _default;
},{}],208:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var spinbuttonRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-invalid': null,
    'aria-readonly': null,
    'aria-required': null,
    'aria-valuetext': null,
    'aria-valuenow': '0'
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: 'type',
        value: 'number'
      }],
      name: 'input'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite'], ['roletype', 'widget', 'input'], ['roletype', 'structure', 'range']]
};
var _default = spinbuttonRole;
exports.default = _default;
},{}],209:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var statusRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-atomic': 'true',
    'aria-live': 'polite'
  },
  relatedConcepts: [{
    concept: {
      name: 'output'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = statusRole;
exports.default = _default;
},{}],210:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var strongRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = strongRole;
exports.default = _default;
},{}],211:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var subscriptRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = subscriptRole;
exports.default = _default;
},{}],212:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var superscriptRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['prohibited'],
  prohibitedProps: ['aria-label', 'aria-labelledby'],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = superscriptRole;
exports.default = _default;
},{}],213:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var switchRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'button'
    },
    module: 'ARIA'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-checked': null
  },
  superClass: [['roletype', 'widget', 'input', 'checkbox']]
};
var _default = switchRole;
exports.default = _default;
},{}],214:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var tabRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: true,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-disabled': null,
    'aria-expanded': null,
    'aria-haspopup': null,
    'aria-posinset': null,
    'aria-setsize': null,
    'aria-selected': 'false'
  },
  relatedConcepts: [],
  requireContextRole: ['tablist'],
  requiredContextRole: ['tablist'],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'sectionhead'], ['roletype', 'widget']]
};
var _default = tabRole;
exports.default = _default;
},{}],215:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var tableRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-colcount': null,
    'aria-rowcount': null
  },
  relatedConcepts: [{
    concept: {
      name: 'table'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['row'], ['row', 'rowgroup']],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = tableRole;
exports.default = _default;
},{}],216:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var tablistRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-level': null,
    'aria-multiselectable': null,
    'aria-orientation': 'horizontal'
  },
  relatedConcepts: [{
    module: 'DAISY',
    concept: {
      name: 'guide'
    }
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['tab']],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite']]
};
var _default = tablistRole;
exports.default = _default;
},{}],217:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var tabpanelRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = tabpanelRole;
exports.default = _default;
},{}],218:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var termRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: 'dfn'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'dt'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = termRole;
exports.default = _default;
},{}],219:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var textboxRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-activedescendant': null,
    'aria-autocomplete': null,
    'aria-errormessage': null,
    'aria-haspopup': null,
    'aria-invalid': null,
    'aria-multiline': null,
    'aria-placeholder': null,
    'aria-readonly': null,
    'aria-required': null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'type'
      }, {
        constraints: ['undefined'],
        name: 'list'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'list'
      }, {
        name: 'type',
        value: 'email'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'list'
      }, {
        name: 'type',
        value: 'tel'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'list'
      }, {
        name: 'type',
        value: 'text'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      attributes: [{
        constraints: ['undefined'],
        name: 'list'
      }, {
        name: 'type',
        value: 'url'
      }],
      name: 'input'
    },
    module: 'HTML'
  }, {
    concept: {
      name: 'input'
    },
    module: 'XForms'
  }, {
    concept: {
      name: 'textarea'
    },
    module: 'HTML'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'input']]
};
var _default = textboxRole;
exports.default = _default;
},{}],220:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var timeRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = timeRole;
exports.default = _default;
},{}],221:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var timerRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'status']]
};
var _default = timerRole;
exports.default = _default;
},{}],222:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var toolbarRole = {
  abstract: false,
  accessibleNameRequired: false,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-orientation': 'horizontal'
  },
  relatedConcepts: [{
    concept: {
      name: 'menubar'
    },
    module: 'ARIA'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section', 'group']]
};
var _default = toolbarRole;
exports.default = _default;
},{}],223:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var tooltipRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'structure', 'section']]
};
var _default = tooltipRole;
exports.default = _default;
},{}],224:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var treeRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-invalid': null,
    'aria-multiselectable': null,
    'aria-required': null,
    'aria-orientation': 'vertical'
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['treeitem', 'group'], ['treeitem']],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite', 'select'], ['roletype', 'structure', 'section', 'group', 'select']]
};
var _default = treeRole;
exports.default = _default;
},{}],225:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var treegridRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author'],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [['row'], ['row', 'rowgroup']],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'composite', 'grid'], ['roletype', 'structure', 'section', 'table', 'grid'], ['roletype', 'widget', 'composite', 'select', 'tree'], ['roletype', 'structure', 'section', 'group', 'select', 'tree']]
};
var _default = treegridRole;
exports.default = _default;
},{}],226:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var treeitemRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-expanded': null,
    'aria-haspopup': null
  },
  relatedConcepts: [],
  requireContextRole: ['group', 'tree'],
  requiredContextRole: ['group', 'tree'],
  requiredOwnedElements: [],
  requiredProps: {
    'aria-selected': null
  },
  superClass: [['roletype', 'structure', 'section', 'listitem'], ['roletype', 'widget', 'input', 'option']]
};
var _default = treeitemRole;
exports.default = _default;
},{}],227:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.roleElements = exports.elementRoles = exports.roles = exports.dom = exports.aria = void 0;

var _ariaPropsMap = _interopRequireDefault(require("./ariaPropsMap"));

var _domMap = _interopRequireDefault(require("./domMap"));

var _rolesMap = _interopRequireDefault(require("./rolesMap"));

var _elementRoleMap = _interopRequireDefault(require("./elementRoleMap"));

var _roleElementMap = _interopRequireDefault(require("./roleElementMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var aria = _ariaPropsMap.default;
exports.aria = aria;
var dom = _domMap.default;
exports.dom = dom;
var roles = _rolesMap.default;
exports.roles = roles;
var elementRoles = _elementRoleMap.default;
exports.elementRoles = elementRoles;
var roleElements = _roleElementMap.default;
exports.roleElements = roleElements;
},{"./ariaPropsMap":88,"./domMap":89,"./elementRoleMap":90,"./roleElementMap":228,"./rolesMap":229}],228:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rolesMap = _interopRequireDefault(require("./rolesMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var roleElement = [];

var keys = _rolesMap.default.keys();

var _loop = function _loop(i) {
  var key = keys[i];

  var role = _rolesMap.default.get(key);

  if (role) {
    var concepts = [].concat(role.baseConcepts, role.relatedConcepts);

    for (var k = 0; k < concepts.length; k++) {
      var relation = concepts[k];

      if (relation.module === 'HTML') {
        var concept = relation.concept;

        if (concept) {
          var roleElementRelation = roleElement.find(function (item) {
            return item[0] === key;
          });
          var relationConcepts = void 0;

          if (roleElementRelation) {
            relationConcepts = roleElementRelation[1];
          } else {
            relationConcepts = [];
          }

          relationConcepts.push(concept);
          roleElement.push([key, relationConcepts]);
        }
      }
    }
  }
};

for (var i = 0; i < keys.length; i++) {
  _loop(i);
}

var roleElementMap = {
  entries: function entries() {
    return roleElement;
  },
  get: function get(key) {
    var item = roleElement.find(function (tuple) {
      return tuple[0] === key ? true : false;
    });
    return item && item[1];
  },
  has: function has(key) {
    return !!this.get(key);
  },
  keys: function keys() {
    return roleElement.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          key = _ref2[0];

      return key;
    });
  },
  values: function values() {
    return roleElement.map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          values = _ref4[1];

      return values;
    });
  }
};
var _default = roleElementMap;
exports.default = _default;
},{"./rolesMap":229}],229:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ariaAbstractRoles = _interopRequireDefault(require("./etc/roles/ariaAbstractRoles"));

var _ariaLiteralRoles = _interopRequireDefault(require("./etc/roles/ariaLiteralRoles"));

var _ariaDpubRoles = _interopRequireDefault(require("./etc/roles/ariaDpubRoles"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var roles = [].concat(_ariaAbstractRoles.default, _ariaLiteralRoles.default, _ariaDpubRoles.default);
roles.forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      roleDefinition = _ref2[1];

  // Conglomerate the properties
  var _iterator = _createForOfIteratorHelper(roleDefinition.superClass),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var superClassIter = _step.value;

      var _iterator2 = _createForOfIteratorHelper(superClassIter),
          _step2;

      try {
        var _loop = function _loop() {
          var superClassName = _step2.value;
          var superClassRoleTuple = roles.find(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 1),
                name = _ref4[0];

            return name === superClassName;
          });

          if (superClassRoleTuple) {
            var superClassDefinition = superClassRoleTuple[1];

            for (var _i2 = 0, _Object$keys = Object.keys(superClassDefinition.props); _i2 < _Object$keys.length; _i2++) {
              var prop = _Object$keys[_i2];

              if ( // $FlowIssue Accessing the hasOwnProperty on the Object prototype is fine.
              !Object.prototype.hasOwnProperty.call(roleDefinition.props, prop)) {
                Object.assign(roleDefinition.props, _defineProperty({}, prop, superClassDefinition.props[prop]));
              }
            }
          }
        };

        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
});
var rolesMap = {
  entries: function entries() {
    return roles;
  },
  get: function get(key) {
    var item = roles.find(function (tuple) {
      return tuple[0] === key ? true : false;
    });
    return item && item[1];
  },
  has: function has(key) {
    return !!this.get(key);
  },
  keys: function keys() {
    return roles.map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 1),
          key = _ref6[0];

      return key;
    });
  },
  values: function values() {
    return roles.map(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2),
          values = _ref8[1];

      return values;
    });
  }
};
var _default = rolesMap;
exports.default = _default;
},{"./etc/roles/ariaAbstractRoles":103,"./etc/roles/ariaDpubRoles":104,"./etc/roles/ariaLiteralRoles":105}],230:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.computeAccessibleDescription = computeAccessibleDescription;

var _accessibleNameAndDescription = require("./accessible-name-and-description");

var _util = require("./util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @param root
 * @param options
 * @returns
 */
function computeAccessibleDescription(root) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var description = (0, _util.queryIdRefs)(root, "aria-describedby").map(function (element) {
    return (0, _accessibleNameAndDescription.computeTextAlternative)(element, _objectSpread(_objectSpread({}, options), {}, {
      compute: "description"
    }));
  }).join(" "); // TODO: Technically we need to make sure that node wasn't used for the accessible name
  //       This causes `description_1.0_combobox-focusable-manual` to fail
  //
  // https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation
  // says for so many elements to use the `title` that we assume all elements are considered

  if (description === "") {
    var title = root.getAttribute("title");
    description = title === null ? "" : title;
  }

  return description;
}

},{"./accessible-name-and-description":231,"./util":238}],231:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.computeTextAlternative = computeTextAlternative;

var _array = _interopRequireDefault(require("./polyfills/array.from"));

var _SetLike = _interopRequireDefault(require("./polyfills/SetLike"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * implements https://w3c.github.io/accname/
 */

/**
 *
 * @param {string} string -
 * @returns {FlatString} -
 */
function asFlatString(s) {
  return s.trim().replace(/\s\s+/g, " ");
}
/**
 *
 * @param node -
 * @param options - These are not optional to prevent accidentally calling it without options in `computeAccessibleName`
 * @returns {boolean} -
 */


function isHidden(node, getComputedStyleImplementation) {
  if (!(0, _util.isElement)(node)) {
    return false;
  }

  if (node.hasAttribute("hidden") || node.getAttribute("aria-hidden") === "true") {
    return true;
  }

  var style = getComputedStyleImplementation(node);
  return style.getPropertyValue("display") === "none" || style.getPropertyValue("visibility") === "hidden";
}
/**
 * @param {Node} node -
 * @returns {boolean} - As defined in step 2E of https://w3c.github.io/accname/#mapping_additional_nd_te
 */


function isControl(node) {
  return (0, _util.hasAnyConcreteRoles)(node, ["button", "combobox", "listbox", "textbox"]) || hasAbstractRole(node, "range");
}

function hasAbstractRole(node, role) {
  if (!(0, _util.isElement)(node)) {
    return false;
  }

  switch (role) {
    case "range":
      return (0, _util.hasAnyConcreteRoles)(node, ["meter", "progressbar", "scrollbar", "slider", "spinbutton"]);

    default:
      throw new TypeError("No knowledge about abstract role '".concat(role, "'. This is likely a bug :("));
  }
}
/**
 * element.querySelectorAll but also considers owned tree
 * @param element
 * @param selectors
 */


function querySelectorAllSubtree(element, selectors) {
  var elements = (0, _array.default)(element.querySelectorAll(selectors));
  (0, _util.queryIdRefs)(element, "aria-owns").forEach(function (root) {
    // babel transpiles this assuming an iterator
    elements.push.apply(elements, (0, _array.default)(root.querySelectorAll(selectors)));
  });
  return elements;
}

function querySelectedOptions(listbox) {
  if ((0, _util.isHTMLSelectElement)(listbox)) {
    // IE11 polyfill
    return listbox.selectedOptions || querySelectorAllSubtree(listbox, "[selected]");
  }

  return querySelectorAllSubtree(listbox, '[aria-selected="true"]');
}

function isMarkedPresentational(node) {
  return (0, _util.hasAnyConcreteRoles)(node, ["none", "presentation"]);
}
/**
 * Elements specifically listed in html-aam
 *
 * We don't need this for `label` or `legend` elements.
 * Their implicit roles already allow "naming from content".
 *
 * sources:
 *
 * - https://w3c.github.io/html-aam/#table-element
 */


function isNativeHostLanguageTextAlternativeElement(node) {
  return (0, _util.isHTMLTableCaptionElement)(node);
}
/**
 * https://w3c.github.io/aria/#namefromcontent
 */


function allowsNameFromContent(node) {
  return (0, _util.hasAnyConcreteRoles)(node, ["button", "cell", "checkbox", "columnheader", "gridcell", "heading", "label", "legend", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "row", "rowheader", "switch", "tab", "tooltip", "treeitem"]);
}
/**
 * TODO https://github.com/eps1lon/dom-accessibility-api/issues/100
 */


function isDescendantOfNativeHostLanguageTextAlternativeElement( // eslint-disable-next-line @typescript-eslint/no-unused-vars -- not implemented yet
node) {
  return false;
}
/**
 * TODO https://github.com/eps1lon/dom-accessibility-api/issues/101
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- not implemented yet


function computeTooltipAttributeValue(node) {
  return null;
}

function getValueOfTextbox(element) {
  if ((0, _util.isHTMLInputElement)(element) || (0, _util.isHTMLTextAreaElement)(element)) {
    return element.value;
  } // https://github.com/eps1lon/dom-accessibility-api/issues/4


  return element.textContent || "";
}

function getTextualContent(declaration) {
  var content = declaration.getPropertyValue("content");

  if (/^["'].*["']$/.test(content)) {
    return content.slice(1, -1);
  }

  return "";
}
/**
 * https://html.spec.whatwg.org/multipage/forms.html#category-label
 * TODO: form-associated custom elements
 * @param element
 */


function isLabelableElement(element) {
  var localName = (0, _util.getLocalName)(element);
  return localName === "button" || localName === "input" && element.getAttribute("type") !== "hidden" || localName === "meter" || localName === "output" || localName === "progress" || localName === "select" || localName === "textarea";
}
/**
 * > [...], then the first such descendant in tree order is the label element's labeled control.
 * -- https://html.spec.whatwg.org/multipage/forms.html#labeled-control
 * @param element
 */


function findLabelableElement(element) {
  if (isLabelableElement(element)) {
    return element;
  }

  var labelableElement = null;
  element.childNodes.forEach(function (childNode) {
    if (labelableElement === null && (0, _util.isElement)(childNode)) {
      var descendantLabelableElement = findLabelableElement(childNode);

      if (descendantLabelableElement !== null) {
        labelableElement = descendantLabelableElement;
      }
    }
  });
  return labelableElement;
}
/**
 * Polyfill of HTMLLabelElement.control
 * https://html.spec.whatwg.org/multipage/forms.html#labeled-control
 * @param label
 */


function getControlOfLabel(label) {
  if (label.control !== undefined) {
    return label.control;
  }

  var htmlFor = label.getAttribute("for");

  if (htmlFor !== null) {
    return label.ownerDocument.getElementById(htmlFor);
  }

  return findLabelableElement(label);
}
/**
 * Polyfill of HTMLInputElement.labels
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/labels
 * @param element
 */


function getLabels(element) {
  var labelsProperty = element.labels;

  if (labelsProperty === null) {
    return labelsProperty;
  }

  if (labelsProperty !== undefined) {
    return (0, _array.default)(labelsProperty);
  } // polyfill


  if (!isLabelableElement(element)) {
    return null;
  }

  var document = element.ownerDocument;
  return (0, _array.default)(document.querySelectorAll("label")).filter(function (label) {
    return getControlOfLabel(label) === element;
  });
}
/**
 * Gets the contents of a slot used for computing the accname
 * @param slot
 */


function getSlotContents(slot) {
  // Computing the accessible name for elements containing slots is not
  // currently defined in the spec. This implementation reflects the
  // behavior of NVDA 2020.2/Firefox 81 and iOS VoiceOver/Safari 13.6.
  var assignedNodes = slot.assignedNodes();

  if (assignedNodes.length === 0) {
    // if no nodes are assigned to the slot, it displays the default content
    return (0, _array.default)(slot.childNodes);
  }

  return assignedNodes;
}
/**
 * implements https://w3c.github.io/accname/#mapping_additional_nd_te
 * @param root
 * @param options
 * @returns
 */


function computeTextAlternative(root) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var consultedNodes = new _SetLike.default();
  var window = (0, _util.safeWindow)(root);
  var _options$compute = options.compute,
      compute = _options$compute === void 0 ? "name" : _options$compute,
      _options$computedStyl = options.computedStyleSupportsPseudoElements,
      computedStyleSupportsPseudoElements = _options$computedStyl === void 0 ? options.getComputedStyle !== undefined : _options$computedStyl,
      _options$getComputedS = options.getComputedStyle,
      getComputedStyle = _options$getComputedS === void 0 ? window.getComputedStyle.bind(window) : _options$getComputedS,
      _options$hidden = options.hidden,
      hidden = _options$hidden === void 0 ? false : _options$hidden; // 2F.i

  function computeMiscTextAlternative(node, context) {
    var accumulatedText = "";

    if ((0, _util.isElement)(node) && computedStyleSupportsPseudoElements) {
      var pseudoBefore = getComputedStyle(node, "::before");
      var beforeContent = getTextualContent(pseudoBefore);
      accumulatedText = "".concat(beforeContent, " ").concat(accumulatedText);
    } // FIXME: Including aria-owns is not defined in the spec
    // But it is required in the web-platform-test


    var childNodes = (0, _util.isHTMLSlotElement)(node) ? getSlotContents(node) : (0, _array.default)(node.childNodes).concat((0, _util.queryIdRefs)(node, "aria-owns"));
    childNodes.forEach(function (child) {
      var result = computeTextAlternative(child, {
        isEmbeddedInLabel: context.isEmbeddedInLabel,
        isReferenced: false,
        recursion: true
      }); // TODO: Unclear why display affects delimiter
      // see https://github.com/w3c/accname/issues/3

      var display = (0, _util.isElement)(child) ? getComputedStyle(child).getPropertyValue("display") : "inline";
      var separator = display !== "inline" ? " " : ""; // trailing separator for wpt tests

      accumulatedText += "".concat(separator).concat(result).concat(separator);
    });

    if ((0, _util.isElement)(node) && computedStyleSupportsPseudoElements) {
      var pseudoAfter = getComputedStyle(node, "::after");
      var afterContent = getTextualContent(pseudoAfter);
      accumulatedText = "".concat(accumulatedText, " ").concat(afterContent);
    }

    return accumulatedText;
  }

  function computeElementTextAlternative(node) {
    if (!(0, _util.isElement)(node)) {
      return null;
    }
    /**
     *
     * @param element
     * @param attributeName
     * @returns A string non-empty string or `null`
     */


    function useAttribute(element, attributeName) {
      var attribute = element.getAttributeNode(attributeName);

      if (attribute !== null && !consultedNodes.has(attribute) && attribute.value.trim() !== "") {
        consultedNodes.add(attribute);
        return attribute.value;
      }

      return null;
    } // https://w3c.github.io/html-aam/#fieldset-and-legend-elements


    if ((0, _util.isHTMLFieldSetElement)(node)) {
      consultedNodes.add(node);
      var children = (0, _array.default)(node.childNodes);

      for (var i = 0; i < children.length; i += 1) {
        var child = children[i];

        if ((0, _util.isHTMLLegendElement)(child)) {
          return computeTextAlternative(child, {
            isEmbeddedInLabel: false,
            isReferenced: false,
            recursion: false
          });
        }
      }
    } else if ((0, _util.isHTMLTableElement)(node)) {
      // https://w3c.github.io/html-aam/#table-element
      consultedNodes.add(node);

      var _children = (0, _array.default)(node.childNodes);

      for (var _i = 0; _i < _children.length; _i += 1) {
        var _child = _children[_i];

        if ((0, _util.isHTMLTableCaptionElement)(_child)) {
          return computeTextAlternative(_child, {
            isEmbeddedInLabel: false,
            isReferenced: false,
            recursion: false
          });
        }
      }
    } else if ((0, _util.isSVGSVGElement)(node)) {
      // https://www.w3.org/TR/svg-aam-1.0/
      consultedNodes.add(node);

      var _children2 = (0, _array.default)(node.childNodes);

      for (var _i2 = 0; _i2 < _children2.length; _i2 += 1) {
        var _child2 = _children2[_i2];

        if ((0, _util.isSVGTitleElement)(_child2)) {
          return _child2.textContent;
        }
      }

      return null;
    } else if ((0, _util.getLocalName)(node) === "img" || (0, _util.getLocalName)(node) === "area") {
      // https://w3c.github.io/html-aam/#area-element
      // https://w3c.github.io/html-aam/#img-element
      var nameFromAlt = useAttribute(node, "alt");

      if (nameFromAlt !== null) {
        return nameFromAlt;
      }
    } else if ((0, _util.isHTMLOptGroupElement)(node)) {
      var nameFromLabel = useAttribute(node, "label");

      if (nameFromLabel !== null) {
        return nameFromLabel;
      }
    }

    if ((0, _util.isHTMLInputElement)(node) && (node.type === "button" || node.type === "submit" || node.type === "reset")) {
      // https://w3c.github.io/html-aam/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-email-input-type-url-and-textarea-element-accessible-description-computation
      var nameFromValue = useAttribute(node, "value");

      if (nameFromValue !== null) {
        return nameFromValue;
      } // TODO: l10n


      if (node.type === "submit") {
        return "Submit";
      } // TODO: l10n


      if (node.type === "reset") {
        return "Reset";
      }
    }

    var labels = getLabels(node);

    if (labels !== null && labels.length !== 0) {
      consultedNodes.add(node);
      return (0, _array.default)(labels).map(function (element) {
        return computeTextAlternative(element, {
          isEmbeddedInLabel: true,
          isReferenced: false,
          recursion: true
        });
      }).filter(function (label) {
        return label.length > 0;
      }).join(" ");
    } // https://w3c.github.io/html-aam/#input-type-image-accessible-name-computation
    // TODO: wpt test consider label elements but html-aam does not mention them
    // We follow existing implementations over spec


    if ((0, _util.isHTMLInputElement)(node) && node.type === "image") {
      var _nameFromAlt = useAttribute(node, "alt");

      if (_nameFromAlt !== null) {
        return _nameFromAlt;
      }

      var nameFromTitle = useAttribute(node, "title");

      if (nameFromTitle !== null) {
        return nameFromTitle;
      } // TODO: l10n


      return "Submit Query";
    }

    return useAttribute(node, "title");
  }

  function computeTextAlternative(current, context) {
    if (consultedNodes.has(current)) {
      return "";
    } // 2A


    if (!hidden && isHidden(current, getComputedStyle) && !context.isReferenced) {
      consultedNodes.add(current);
      return "";
    } // 2B


    var labelElements = (0, _util.queryIdRefs)(current, "aria-labelledby");

    if (compute === "name" && !context.isReferenced && labelElements.length > 0) {
      return labelElements.map(function (element) {
        return computeTextAlternative(element, {
          isEmbeddedInLabel: context.isEmbeddedInLabel,
          isReferenced: true,
          // thais isn't recursion as specified, otherwise we would skip
          // `aria-label` in
          // <input id="myself" aria-label="foo" aria-labelledby="myself"
          recursion: false
        });
      }).join(" ");
    } // 2C
    // Changed from the spec in anticipation of https://github.com/w3c/accname/issues/64
    // spec says we should only consider skipping if we have a non-empty label


    var skipToStep2E = context.recursion && isControl(current) && compute === "name";

    if (!skipToStep2E) {
      var ariaLabel = ((0, _util.isElement)(current) && current.getAttribute("aria-label") || "").trim();

      if (ariaLabel !== "" && compute === "name") {
        consultedNodes.add(current);
        return ariaLabel;
      } // 2D


      if (!isMarkedPresentational(current)) {
        var elementTextAlternative = computeElementTextAlternative(current);

        if (elementTextAlternative !== null) {
          consultedNodes.add(current);
          return elementTextAlternative;
        }
      }
    } // special casing, cheating to make tests pass
    // https://github.com/w3c/accname/issues/67


    if ((0, _util.hasAnyConcreteRoles)(current, ["menu"])) {
      consultedNodes.add(current);
      return "";
    } // 2E


    if (skipToStep2E || context.isEmbeddedInLabel || context.isReferenced) {
      if ((0, _util.hasAnyConcreteRoles)(current, ["combobox", "listbox"])) {
        consultedNodes.add(current);
        var selectedOptions = querySelectedOptions(current);

        if (selectedOptions.length === 0) {
          // defined per test `name_heading_combobox`
          return (0, _util.isHTMLInputElement)(current) ? current.value : "";
        }

        return (0, _array.default)(selectedOptions).map(function (selectedOption) {
          return computeTextAlternative(selectedOption, {
            isEmbeddedInLabel: context.isEmbeddedInLabel,
            isReferenced: false,
            recursion: true
          });
        }).join(" ");
      }

      if (hasAbstractRole(current, "range")) {
        consultedNodes.add(current);

        if (current.hasAttribute("aria-valuetext")) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe due to hasAttribute guard
          return current.getAttribute("aria-valuetext");
        }

        if (current.hasAttribute("aria-valuenow")) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe due to hasAttribute guard
          return current.getAttribute("aria-valuenow");
        } // Otherwise, use the value as specified by a host language attribute.


        return current.getAttribute("value") || "";
      }

      if ((0, _util.hasAnyConcreteRoles)(current, ["textbox"])) {
        consultedNodes.add(current);
        return getValueOfTextbox(current);
      }
    } // 2F: https://w3c.github.io/accname/#step2F


    if (allowsNameFromContent(current) || (0, _util.isElement)(current) && context.isReferenced || isNativeHostLanguageTextAlternativeElement(current) || isDescendantOfNativeHostLanguageTextAlternativeElement(current)) {
      consultedNodes.add(current);
      return computeMiscTextAlternative(current, {
        isEmbeddedInLabel: context.isEmbeddedInLabel,
        isReferenced: false
      });
    }

    if (current.nodeType === current.TEXT_NODE) {
      consultedNodes.add(current);
      return current.textContent || "";
    }

    if (context.recursion) {
      consultedNodes.add(current);
      return computeMiscTextAlternative(current, {
        isEmbeddedInLabel: context.isEmbeddedInLabel,
        isReferenced: false
      });
    }

    var tooltipAttributeValue = computeTooltipAttributeValue(current);

    if (tooltipAttributeValue !== null) {
      consultedNodes.add(current);
      return tooltipAttributeValue;
    } // TODO should this be reachable?


    consultedNodes.add(current);
    return "";
  }

  return asFlatString(computeTextAlternative(root, {
    isEmbeddedInLabel: false,
    // by spec computeAccessibleDescription starts with the referenced elements as roots
    isReferenced: compute === "description",
    recursion: false
  }));
}

},{"./polyfills/SetLike":236,"./polyfills/array.from":237,"./util":238}],232:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.computeAccessibleName = computeAccessibleName;

var _accessibleNameAndDescription = require("./accessible-name-and-description");

var _util = require("./util");

/**
 * https://w3c.github.io/aria/#namefromprohibited
 */
function prohibitsNaming(node) {
  return (0, _util.hasAnyConcreteRoles)(node, ["caption", "code", "deletion", "emphasis", "generic", "insertion", "paragraph", "presentation", "strong", "subscript", "superscript"]);
}
/**
 * implements https://w3c.github.io/accname/#mapping_additional_nd_name
 * @param root
 * @param options
 * @returns
 */


function computeAccessibleName(root) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (prohibitsNaming(root)) {
    return "";
  }

  return (0, _accessibleNameAndDescription.computeTextAlternative)(root, options);
}

},{"./accessible-name-and-description":231,"./util":238}],233:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.default = getRole;

var _util = require("./util");

// https://w3c.github.io/html-aria/#document-conformance-requirements-for-use-of-aria-attributes-in-html
var localNameToRoleMappings = {
  article: "article",
  aside: "complementary",
  button: "button",
  datalist: "listbox",
  dd: "definition",
  details: "group",
  dialog: "dialog",
  dt: "term",
  fieldset: "group",
  figure: "figure",
  // WARNING: Only with an accessible name
  form: "form",
  footer: "contentinfo",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  header: "banner",
  hr: "separator",
  html: "document",
  legend: "legend",
  li: "listitem",
  math: "math",
  main: "main",
  menu: "list",
  nav: "navigation",
  ol: "list",
  optgroup: "group",
  // WARNING: Only in certain context
  option: "option",
  output: "status",
  progress: "progressbar",
  // WARNING: Only with an accessible name
  section: "region",
  summary: "button",
  table: "table",
  tbody: "rowgroup",
  textarea: "textbox",
  tfoot: "rowgroup",
  // WARNING: Only in certain context
  td: "cell",
  th: "columnheader",
  thead: "rowgroup",
  tr: "row",
  ul: "list"
};
var prohibitedAttributes = {
  caption: new Set(["aria-label", "aria-labelledby"]),
  code: new Set(["aria-label", "aria-labelledby"]),
  deletion: new Set(["aria-label", "aria-labelledby"]),
  emphasis: new Set(["aria-label", "aria-labelledby"]),
  generic: new Set(["aria-label", "aria-labelledby", "aria-roledescription"]),
  insertion: new Set(["aria-label", "aria-labelledby"]),
  paragraph: new Set(["aria-label", "aria-labelledby"]),
  presentation: new Set(["aria-label", "aria-labelledby"]),
  strong: new Set(["aria-label", "aria-labelledby"]),
  subscript: new Set(["aria-label", "aria-labelledby"]),
  superscript: new Set(["aria-label", "aria-labelledby"])
};
/**
 *
 * @param element
 * @param role The role used for this element. This is specified to control whether you want to use the implicit or explicit role.
 */

function hasGlobalAriaAttributes(element, role) {
  // https://rawgit.com/w3c/aria/stable/#global_states
  // commented attributes are deprecated
  return ["aria-atomic", "aria-busy", "aria-controls", "aria-current", "aria-describedby", "aria-details", // "disabled",
  "aria-dropeffect", // "errormessage",
  "aria-flowto", "aria-grabbed", // "haspopup",
  "aria-hidden", // "invalid",
  "aria-keyshortcuts", "aria-label", "aria-labelledby", "aria-live", "aria-owns", "aria-relevant", "aria-roledescription"].some(function (attributeName) {
    var _prohibitedAttributes;

    return element.hasAttribute(attributeName) && !((_prohibitedAttributes = prohibitedAttributes[role]) !== null && _prohibitedAttributes !== void 0 && _prohibitedAttributes.has(attributeName));
  });
}

function ignorePresentationalRole(element, implicitRole) {
  // https://rawgit.com/w3c/aria/stable/#conflict_resolution_presentation_none
  return hasGlobalAriaAttributes(element, implicitRole);
}

function getRole(element) {
  var explicitRole = getExplicitRole(element);

  if (explicitRole === null || explicitRole === "presentation") {
    var implicitRole = getImplicitRole(element);

    if (explicitRole !== "presentation" || ignorePresentationalRole(element, implicitRole || "")) {
      return implicitRole;
    }
  }

  return explicitRole;
}

function getImplicitRole(element) {
  var mappedByTag = localNameToRoleMappings[(0, _util.getLocalName)(element)];

  if (mappedByTag !== undefined) {
    return mappedByTag;
  }

  switch ((0, _util.getLocalName)(element)) {
    case "a":
    case "area":
    case "link":
      if (element.hasAttribute("href")) {
        return "link";
      }

      break;

    case "img":
      if (element.getAttribute("alt") === "" && !ignorePresentationalRole(element, "img")) {
        return "presentation";
      }

      return "img";

    case "input":
      {
        var _ref = element,
            type = _ref.type;

        switch (type) {
          case "button":
          case "image":
          case "reset":
          case "submit":
            return "button";

          case "checkbox":
          case "radio":
            return type;

          case "range":
            return "slider";

          case "email":
          case "tel":
          case "text":
          case "url":
            if (element.hasAttribute("list")) {
              return "combobox";
            }

            return "textbox";

          case "search":
            if (element.hasAttribute("list")) {
              return "combobox";
            }

            return "searchbox";

          default:
            return null;
        }
      }

    case "select":
      if (element.hasAttribute("multiple") || element.size > 1) {
        return "listbox";
      }

      return "combobox";
  }

  return null;
}

function getExplicitRole(element) {
  var role = element.getAttribute("role");

  if (role !== null) {
    var explicitRole = role.trim().split(" ")[0]; // String.prototype.split(sep, limit) will always return an array with at least one member
    // as long as limit is either undefined or > 0

    if (explicitRole.length > 0) {
      return explicitRole;
    }
  }

  return null;
}

},{"./util":238}],234:[function(require,module,exports){
"use strict";

exports.__esModule = true;
var _exportNames = {
  computeAccessibleDescription: true,
  computeAccessibleName: true,
  getRole: true
};
exports.getRole = exports.computeAccessibleName = exports.computeAccessibleDescription = void 0;

var _accessibleDescription = require("./accessible-description");

exports.computeAccessibleDescription = _accessibleDescription.computeAccessibleDescription;

var _accessibleName = require("./accessible-name");

exports.computeAccessibleName = _accessibleName.computeAccessibleName;

var _getRole = _interopRequireDefault(require("./getRole"));

exports.getRole = _getRole.default;

var _isInaccessible = require("./is-inaccessible");

Object.keys(_isInaccessible).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _isInaccessible[key]) return;
  exports[key] = _isInaccessible[key];
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./accessible-description":230,"./accessible-name":232,"./getRole":233,"./is-inaccessible":235}],235:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isInaccessible = isInaccessible;
exports.isSubtreeInaccessible = isSubtreeInaccessible;

/**
 * Partial implementation https://www.w3.org/TR/wai-aria-1.2/#tree_exclusion
 * which should only be used for elements with a non-presentational role i.e.
 * `role="none"` and `role="presentation"` will not be excluded.
 *
 * Implements aria-hidden semantics (i.e. parent overrides child)
 * Ignores "Child Presentational: True" characteristics
 *
 * @param element
 * @param options
 * @returns {boolean} true if excluded, otherwise false
 */
function isInaccessible(element) {
  var _element$ownerDocumen;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$getComputedS = options.getComputedStyle,
      getComputedStyle = _options$getComputedS === void 0 ? (_element$ownerDocumen = element.ownerDocument.defaultView) === null || _element$ownerDocumen === void 0 ? void 0 : _element$ownerDocumen.getComputedStyle : _options$getComputedS,
      _options$isSubtreeIna = options.isSubtreeInaccessible,
      isSubtreeInaccessibleImpl = _options$isSubtreeIna === void 0 ? isSubtreeInaccessible : _options$isSubtreeIna;

  if (typeof getComputedStyle !== "function") {
    throw new TypeError("Owner document of the element needs to have an associated window.");
  } // since visibility is inherited we can exit early


  if (getComputedStyle(element).visibility === "hidden") {
    return true;
  }

  var currentElement = element;

  while (currentElement) {
    if (isSubtreeInaccessibleImpl(currentElement, {
      getComputedStyle: getComputedStyle
    })) {
      return true;
    }

    currentElement = currentElement.parentElement;
  }

  return false;
}

/**
 *
 * @param element
 * @param options
 * @returns {boolean} - `true` if every child of the element is inaccessible
 */
function isSubtreeInaccessible(element) {
  var _element$ownerDocumen2;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$getComputedS2 = options.getComputedStyle,
      getComputedStyle = _options$getComputedS2 === void 0 ? (_element$ownerDocumen2 = element.ownerDocument.defaultView) === null || _element$ownerDocumen2 === void 0 ? void 0 : _element$ownerDocumen2.getComputedStyle : _options$getComputedS2;

  if (typeof getComputedStyle !== "function") {
    throw new TypeError("Owner document of the element needs to have an associated window.");
  }

  if (element.hidden === true) {
    return true;
  }

  if (element.getAttribute("aria-hidden") === "true") {
    return true;
  }

  if (getComputedStyle(element).display === "none") {
    return true;
  }

  return false;
}

},{}],236:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// for environments without Set we fallback to arrays with unique members
var SetLike = /*#__PURE__*/function () {
  function SetLike() {
    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, SetLike);

    _defineProperty(this, "items", void 0);

    this.items = items;
  }

  _createClass(SetLike, [{
    key: "add",
    value: function add(value) {
      if (this.has(value) === false) {
        this.items.push(value);
      }

      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.items = [];
    }
  }, {
    key: "delete",
    value: function _delete(value) {
      var previousLength = this.items.length;
      this.items = this.items.filter(function (item) {
        return item !== value;
      });
      return previousLength !== this.items.length;
    }
  }, {
    key: "forEach",
    value: function forEach(callbackfn) {
      var _this = this;

      this.items.forEach(function (item) {
        callbackfn(item, item, _this);
      });
    }
  }, {
    key: "has",
    value: function has(value) {
      return this.items.indexOf(value) !== -1;
    }
  }, {
    key: "size",
    get: function get() {
      return this.items.length;
    }
  }]);

  return SetLike;
}();

var _default = typeof Set === "undefined" ? Set : SetLike;

exports.default = _default;

},{}],237:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.default = arrayFrom;

/**
 * @source {https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill}
 * but without thisArg (too hard to type, no need to `this`)
 */
var toStr = Object.prototype.toString;

function isCallable(fn) {
  return typeof fn === "function" || toStr.call(fn) === "[object Function]";
}

function toInteger(value) {
  var number = Number(value);

  if (isNaN(number)) {
    return 0;
  }

  if (number === 0 || !isFinite(number)) {
    return number;
  }

  return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
}

var maxSafeInteger = Math.pow(2, 53) - 1;

function toLength(value) {
  var len = toInteger(value);
  return Math.min(Math.max(len, 0), maxSafeInteger);
}
/**
 * Creates an array from an iterable object.
 * @param iterable An iterable object to convert to an array.
 */


/**
 * Creates an array from an iterable object.
 * @param iterable An iterable object to convert to an array.
 * @param mapfn A mapping function to call on every element of the array.
 * @param thisArg Value of 'this' used to invoke the mapfn.
 */
function arrayFrom(arrayLike, mapFn) {
  // 1. Let C be the this value.
  // edit(@eps1lon): we're not calling it as Array.from
  var C = Array; // 2. Let items be ToObject(arrayLike).

  var items = Object(arrayLike); // 3. ReturnIfAbrupt(items).

  if (arrayLike == null) {
    throw new TypeError("Array.from requires an array-like object - not null or undefined");
  } // 4. If mapfn is undefined, then let mapping be false.
  // const mapFn = arguments.length > 1 ? arguments[1] : void undefined;


  if (typeof mapFn !== "undefined") {
    // 5. else
    // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
    if (!isCallable(mapFn)) {
      throw new TypeError("Array.from: when provided, the second argument must be a function");
    }
  } // 10. Let lenValue be Get(items, "length").
  // 11. Let len be ToLength(lenValue).


  var len = toLength(items.length); // 13. If IsConstructor(C) is true, then
  // 13. a. Let A be the result of calling the [[Construct]] internal method
  // of C with an argument list containing the single item len.
  // 14. a. Else, Let A be ArrayCreate(len).

  var A = isCallable(C) ? Object(new C(len)) : new Array(len); // 16. Let k be 0.

  var k = 0; // 17. Repeat, while k < len… (also steps a - h)

  var kValue;

  while (k < len) {
    kValue = items[k];

    if (mapFn) {
      A[k] = mapFn(kValue, k);
    } else {
      A[k] = kValue;
    }

    k += 1;
  } // 18. Let putStatus be Put(A, "length", len, true).


  A.length = len; // 20. Return A.

  return A;
}

},{}],238:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getLocalName = getLocalName;
exports.hasAnyConcreteRoles = hasAnyConcreteRoles;
exports.isElement = isElement;
exports.isHTMLFieldSetElement = isHTMLFieldSetElement;
exports.isHTMLInputElement = isHTMLInputElement;
exports.isHTMLLegendElement = isHTMLLegendElement;
exports.isHTMLOptGroupElement = isHTMLOptGroupElement;
exports.isHTMLSelectElement = isHTMLSelectElement;
exports.isHTMLSlotElement = isHTMLSlotElement;
exports.isHTMLTableCaptionElement = isHTMLTableCaptionElement;
exports.isHTMLTableElement = isHTMLTableElement;
exports.isHTMLTextAreaElement = isHTMLTextAreaElement;
exports.isSVGElement = isSVGElement;
exports.isSVGSVGElement = isSVGSVGElement;
exports.isSVGTitleElement = isSVGTitleElement;
exports.queryIdRefs = queryIdRefs;
exports.safeWindow = safeWindow;

var _getRole = _interopRequireDefault(require("./getRole"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Safe Element.localName for all supported environments
 * @param element
 */
function getLocalName(element) {
  var _element$localName;

  return (// eslint-disable-next-line no-restricted-properties -- actual guard for environments without localName
    (_element$localName = element.localName) !== null && _element$localName !== void 0 ? _element$localName : // eslint-disable-next-line no-restricted-properties -- required for the fallback
    element.tagName.toLowerCase()
  );
}

function isElement(node) {
  return node !== null && node.nodeType === node.ELEMENT_NODE;
}

function isHTMLTableCaptionElement(node) {
  return isElement(node) && getLocalName(node) === "caption";
}

function isHTMLInputElement(node) {
  return isElement(node) && getLocalName(node) === "input";
}

function isHTMLOptGroupElement(node) {
  return isElement(node) && getLocalName(node) === "optgroup";
}

function isHTMLSelectElement(node) {
  return isElement(node) && getLocalName(node) === "select";
}

function isHTMLTableElement(node) {
  return isElement(node) && getLocalName(node) === "table";
}

function isHTMLTextAreaElement(node) {
  return isElement(node) && getLocalName(node) === "textarea";
}

function safeWindow(node) {
  var _ref = node.ownerDocument === null ? node : node.ownerDocument,
      defaultView = _ref.defaultView;

  if (defaultView === null) {
    throw new TypeError("no window available");
  }

  return defaultView;
}

function isHTMLFieldSetElement(node) {
  return isElement(node) && getLocalName(node) === "fieldset";
}

function isHTMLLegendElement(node) {
  return isElement(node) && getLocalName(node) === "legend";
}

function isHTMLSlotElement(node) {
  return isElement(node) && getLocalName(node) === "slot";
}

function isSVGElement(node) {
  return isElement(node) && node.ownerSVGElement !== undefined;
}

function isSVGSVGElement(node) {
  return isElement(node) && getLocalName(node) === "svg";
}

function isSVGTitleElement(node) {
  return isSVGElement(node) && getLocalName(node) === "title";
}
/**
 *
 * @param {Node} node -
 * @param {string} attributeName -
 * @returns {Element[]} -
 */


function queryIdRefs(node, attributeName) {
  if (isElement(node) && node.hasAttribute(attributeName)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe due to hasAttribute check
    var ids = node.getAttribute(attributeName).split(" ");
    return ids.map(function (id) {
      return node.ownerDocument.getElementById(id);
    }).filter(function (element) {
      return element !== null;
    } // TODO: why does this not narrow?
    );
  }

  return [];
}

function hasAnyConcreteRoles(node, roles) {
  if (isElement(node)) {
    return roles.indexOf((0, _getRole.default)(node)) !== -1;
  }

  return false;
}

},{"./getRole":233}],239:[function(require,module,exports){
// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (typeof define === 'function' && define.amd) {
  define(function () { return LZString; });
} else if( typeof module !== 'undefined' && module != null ) {
  module.exports = LZString
}

},{}],240:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.printIteratorEntries = printIteratorEntries;
exports.printIteratorValues = printIteratorValues;
exports.printListItems = printListItems;
exports.printObjectProperties = printObjectProperties;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const getKeysOfEnumerableProperties = object => {
  const keys = Object.keys(object).sort();

  if (Object.getOwnPropertySymbols) {
    Object.getOwnPropertySymbols(object).forEach(symbol => {
      if (Object.getOwnPropertyDescriptor(object, symbol).enumerable) {
        keys.push(symbol);
      }
    });
  }

  return keys;
};
/**
 * Return entries (for example, of a map)
 * with spacing, indentation, and comma
 * without surrounding punctuation (for example, braces)
 */

function printIteratorEntries(
  iterator,
  config,
  indentation,
  depth,
  refs,
  printer, // Too bad, so sad that separator for ECMAScript Map has been ' => '
  // What a distracting diff if you change a data structure to/from
  // ECMAScript Object or Immutable.Map/OrderedMap which use the default.
  separator = ': '
) {
  let result = '';
  let current = iterator.next();

  if (!current.done) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;

    while (!current.done) {
      const name = printer(
        current.value[0],
        config,
        indentationNext,
        depth,
        refs
      );
      const value = printer(
        current.value[1],
        config,
        indentationNext,
        depth,
        refs
      );
      result += indentationNext + name + separator + value;
      current = iterator.next();

      if (!current.done) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}
/**
 * Return values (for example, of a set)
 * with spacing, indentation, and comma
 * without surrounding punctuation (braces or brackets)
 */

function printIteratorValues(
  iterator,
  config,
  indentation,
  depth,
  refs,
  printer
) {
  let result = '';
  let current = iterator.next();

  if (!current.done) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;

    while (!current.done) {
      result +=
        indentationNext +
        printer(current.value, config, indentationNext, depth, refs);
      current = iterator.next();

      if (!current.done) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}
/**
 * Return items (for example, of an array)
 * with spacing, indentation, and comma
 * without surrounding punctuation (for example, brackets)
 **/

function printListItems(list, config, indentation, depth, refs, printer) {
  let result = '';

  if (list.length) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;

    for (let i = 0; i < list.length; i++) {
      result += indentationNext;

      if (i in list) {
        result += printer(list[i], config, indentationNext, depth, refs);
      }

      if (i < list.length - 1) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}
/**
 * Return properties of an object
 * with spacing, indentation, and comma
 * without surrounding punctuation (for example, braces)
 */

function printObjectProperties(val, config, indentation, depth, refs, printer) {
  let result = '';
  const keys = getKeysOfEnumerableProperties(val);

  if (keys.length) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const name = printer(key, config, indentationNext, depth, refs);
      const value = printer(val[key], config, indentationNext, depth, refs);
      result += indentationNext + name + ': ' + value;

      if (i < keys.length - 1) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}

},{}],241:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;
exports.default = exports.plugins = exports.DEFAULT_OPTIONS = void 0;

var _ansiStyles = _interopRequireDefault(require('ansi-styles'));

var _collections = require('./collections');

var _AsymmetricMatcher = _interopRequireDefault(
  require('./plugins/AsymmetricMatcher')
);

var _ConvertAnsi = _interopRequireDefault(require('./plugins/ConvertAnsi'));

var _DOMCollection = _interopRequireDefault(require('./plugins/DOMCollection'));

var _DOMElement = _interopRequireDefault(require('./plugins/DOMElement'));

var _Immutable = _interopRequireDefault(require('./plugins/Immutable'));

var _ReactElement = _interopRequireDefault(require('./plugins/ReactElement'));

var _ReactTestComponent = _interopRequireDefault(
  require('./plugins/ReactTestComponent')
);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable local/ban-types-eventually */
const toString = Object.prototype.toString;
const toISOString = Date.prototype.toISOString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;
/**
 * Explicitly comparing typeof constructor to function avoids undefined as name
 * when mock identity-obj-proxy returns the key as the value for any key.
 */

const getConstructorName = val =>
  (typeof val.constructor === 'function' && val.constructor.name) || 'Object';
/* global window */

/** Is val is equal to global window object? Works even if it does not exist :) */

const isWindow = val => typeof window !== 'undefined' && val === window;

const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;
const NEWLINE_REGEXP = /\n/gi;

class PrettyFormatPluginError extends Error {
  constructor(message, stack) {
    super(message);
    this.stack = stack;
    this.name = this.constructor.name;
  }
}

function isToStringedArrayType(toStringed) {
  return (
    toStringed === '[object Array]' ||
    toStringed === '[object ArrayBuffer]' ||
    toStringed === '[object DataView]' ||
    toStringed === '[object Float32Array]' ||
    toStringed === '[object Float64Array]' ||
    toStringed === '[object Int8Array]' ||
    toStringed === '[object Int16Array]' ||
    toStringed === '[object Int32Array]' ||
    toStringed === '[object Uint8Array]' ||
    toStringed === '[object Uint8ClampedArray]' ||
    toStringed === '[object Uint16Array]' ||
    toStringed === '[object Uint32Array]'
  );
}

function printNumber(val) {
  return Object.is(val, -0) ? '-0' : String(val);
}

function printBigInt(val) {
  return String(`${val}n`);
}

function printFunction(val, printFunctionName) {
  if (!printFunctionName) {
    return '[Function]';
  }

  return '[Function ' + (val.name || 'anonymous') + ']';
}

function printSymbol(val) {
  return String(val).replace(SYMBOL_REGEXP, 'Symbol($1)');
}

function printError(val) {
  return '[' + errorToString.call(val) + ']';
}
/**
 * The first port of call for printing an object, handles most of the
 * data-types in JS.
 */

function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
  if (val === true || val === false) {
    return '' + val;
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (val === null) {
    return 'null';
  }

  const typeOf = typeof val;

  if (typeOf === 'number') {
    return printNumber(val);
  }

  if (typeOf === 'bigint') {
    return printBigInt(val);
  }

  if (typeOf === 'string') {
    if (escapeString) {
      return '"' + val.replace(/"|\\/g, '\\$&') + '"';
    }

    return '"' + val + '"';
  }

  if (typeOf === 'function') {
    return printFunction(val, printFunctionName);
  }

  if (typeOf === 'symbol') {
    return printSymbol(val);
  }

  const toStringed = toString.call(val);

  if (toStringed === '[object WeakMap]') {
    return 'WeakMap {}';
  }

  if (toStringed === '[object WeakSet]') {
    return 'WeakSet {}';
  }

  if (
    toStringed === '[object Function]' ||
    toStringed === '[object GeneratorFunction]'
  ) {
    return printFunction(val, printFunctionName);
  }

  if (toStringed === '[object Symbol]') {
    return printSymbol(val);
  }

  if (toStringed === '[object Date]') {
    return isNaN(+val) ? 'Date { NaN }' : toISOString.call(val);
  }

  if (toStringed === '[object Error]') {
    return printError(val);
  }

  if (toStringed === '[object RegExp]') {
    if (escapeRegex) {
      // https://github.com/benjamingr/RegExp.escape/blob/main/polyfill.js
      return regExpToString.call(val).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    return regExpToString.call(val);
  }

  if (val instanceof Error) {
    return printError(val);
  }

  return null;
}
/**
 * Handles more complex objects ( such as objects with circular references.
 * maps and sets etc )
 */

function printComplexValue(
  val,
  config,
  indentation,
  depth,
  refs,
  hasCalledToJSON
) {
  if (refs.indexOf(val) !== -1) {
    return '[Circular]';
  }

  refs = refs.slice();
  refs.push(val);
  const hitMaxDepth = ++depth > config.maxDepth;
  const min = config.min;

  if (
    config.callToJSON &&
    !hitMaxDepth &&
    val.toJSON &&
    typeof val.toJSON === 'function' &&
    !hasCalledToJSON
  ) {
    return printer(val.toJSON(), config, indentation, depth, refs, true);
  }

  const toStringed = toString.call(val);

  if (toStringed === '[object Arguments]') {
    return hitMaxDepth
      ? '[Arguments]'
      : (min ? '' : 'Arguments ') +
          '[' +
          (0, _collections.printListItems)(
            val,
            config,
            indentation,
            depth,
            refs,
            printer
          ) +
          ']';
  }

  if (isToStringedArrayType(toStringed)) {
    return hitMaxDepth
      ? '[' + val.constructor.name + ']'
      : (min
          ? ''
          : !config.printBasicPrototype && val.constructor.name === 'Array'
          ? ''
          : val.constructor.name + ' ') +
          '[' +
          (0, _collections.printListItems)(
            val,
            config,
            indentation,
            depth,
            refs,
            printer
          ) +
          ']';
  }

  if (toStringed === '[object Map]') {
    return hitMaxDepth
      ? '[Map]'
      : 'Map {' +
          (0, _collections.printIteratorEntries)(
            val.entries(),
            config,
            indentation,
            depth,
            refs,
            printer,
            ' => '
          ) +
          '}';
  }

  if (toStringed === '[object Set]') {
    return hitMaxDepth
      ? '[Set]'
      : 'Set {' +
          (0, _collections.printIteratorValues)(
            val.values(),
            config,
            indentation,
            depth,
            refs,
            printer
          ) +
          '}';
  } // Avoid failure to serialize global window object in jsdom test environment.
  // For example, not even relevant if window is prop of React element.

  return hitMaxDepth || isWindow(val)
    ? '[' + getConstructorName(val) + ']'
    : (min
        ? ''
        : !config.printBasicPrototype && getConstructorName(val) === 'Object'
        ? ''
        : getConstructorName(val) + ' ') +
        '{' +
        (0, _collections.printObjectProperties)(
          val,
          config,
          indentation,
          depth,
          refs,
          printer
        ) +
        '}';
}

function isNewPlugin(plugin) {
  return plugin.serialize != null;
}

function printPlugin(plugin, val, config, indentation, depth, refs) {
  let printed;

  try {
    printed = isNewPlugin(plugin)
      ? plugin.serialize(val, config, indentation, depth, refs, printer)
      : plugin.print(
          val,
          valChild => printer(valChild, config, indentation, depth, refs),
          str => {
            const indentationNext = indentation + config.indent;
            return (
              indentationNext +
              str.replace(NEWLINE_REGEXP, '\n' + indentationNext)
            );
          },
          {
            edgeSpacing: config.spacingOuter,
            min: config.min,
            spacing: config.spacingInner
          },
          config.colors
        );
  } catch (error) {
    throw new PrettyFormatPluginError(error.message, error.stack);
  }

  if (typeof printed !== 'string') {
    throw new Error(
      `pretty-format: Plugin must return type "string" but instead returned "${typeof printed}".`
    );
  }

  return printed;
}

function findPlugin(plugins, val) {
  for (let p = 0; p < plugins.length; p++) {
    try {
      if (plugins[p].test(val)) {
        return plugins[p];
      }
    } catch (error) {
      throw new PrettyFormatPluginError(error.message, error.stack);
    }
  }

  return null;
}

function printer(val, config, indentation, depth, refs, hasCalledToJSON) {
  const plugin = findPlugin(config.plugins, val);

  if (plugin !== null) {
    return printPlugin(plugin, val, config, indentation, depth, refs);
  }

  const basicResult = printBasicValue(
    val,
    config.printFunctionName,
    config.escapeRegex,
    config.escapeString
  );

  if (basicResult !== null) {
    return basicResult;
  }

  return printComplexValue(
    val,
    config,
    indentation,
    depth,
    refs,
    hasCalledToJSON
  );
}

const DEFAULT_THEME = {
  comment: 'gray',
  content: 'reset',
  prop: 'yellow',
  tag: 'cyan',
  value: 'green'
};
const DEFAULT_THEME_KEYS = Object.keys(DEFAULT_THEME);
const DEFAULT_OPTIONS = {
  callToJSON: true,
  escapeRegex: false,
  escapeString: true,
  highlight: false,
  indent: 2,
  maxDepth: Infinity,
  min: false,
  plugins: [],
  printBasicPrototype: true,
  printFunctionName: true,
  theme: DEFAULT_THEME
};
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

function validateOptions(options) {
  Object.keys(options).forEach(key => {
    if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
      throw new Error(`pretty-format: Unknown option "${key}".`);
    }
  });

  if (options.min && options.indent !== undefined && options.indent !== 0) {
    throw new Error(
      'pretty-format: Options "min" and "indent" cannot be used together.'
    );
  }

  if (options.theme !== undefined) {
    if (options.theme === null) {
      throw new Error(`pretty-format: Option "theme" must not be null.`);
    }

    if (typeof options.theme !== 'object') {
      throw new Error(
        `pretty-format: Option "theme" must be of type "object" but instead received "${typeof options.theme}".`
      );
    }
  }
}

const getColorsHighlight = options =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value =
      options.theme && options.theme[key] !== undefined
        ? options.theme[key]
        : DEFAULT_THEME[key];
    const color = value && _ansiStyles.default[value];

    if (
      color &&
      typeof color.close === 'string' &&
      typeof color.open === 'string'
    ) {
      colors[key] = color;
    } else {
      throw new Error(
        `pretty-format: Option "theme" has a key "${key}" whose value "${value}" is undefined in ansi-styles.`
      );
    }

    return colors;
  }, Object.create(null));

const getColorsEmpty = () =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    colors[key] = {
      close: '',
      open: ''
    };
    return colors;
  }, Object.create(null));

const getPrintFunctionName = options =>
  options && options.printFunctionName !== undefined
    ? options.printFunctionName
    : DEFAULT_OPTIONS.printFunctionName;

const getEscapeRegex = options =>
  options && options.escapeRegex !== undefined
    ? options.escapeRegex
    : DEFAULT_OPTIONS.escapeRegex;

const getEscapeString = options =>
  options && options.escapeString !== undefined
    ? options.escapeString
    : DEFAULT_OPTIONS.escapeString;

const getConfig = options => {
  var _options$printBasicPr;

  return {
    callToJSON:
      options && options.callToJSON !== undefined
        ? options.callToJSON
        : DEFAULT_OPTIONS.callToJSON,
    colors:
      options && options.highlight
        ? getColorsHighlight(options)
        : getColorsEmpty(),
    escapeRegex: getEscapeRegex(options),
    escapeString: getEscapeString(options),
    indent:
      options && options.min
        ? ''
        : createIndent(
            options && options.indent !== undefined
              ? options.indent
              : DEFAULT_OPTIONS.indent
          ),
    maxDepth:
      options && options.maxDepth !== undefined
        ? options.maxDepth
        : DEFAULT_OPTIONS.maxDepth,
    min:
      options && options.min !== undefined ? options.min : DEFAULT_OPTIONS.min,
    plugins:
      options && options.plugins !== undefined
        ? options.plugins
        : DEFAULT_OPTIONS.plugins,
    printBasicPrototype:
      (_options$printBasicPr =
        options === null || options === void 0
          ? void 0
          : options.printBasicPrototype) !== null &&
      _options$printBasicPr !== void 0
        ? _options$printBasicPr
        : true,
    printFunctionName: getPrintFunctionName(options),
    spacingInner: options && options.min ? ' ' : '\n',
    spacingOuter: options && options.min ? '' : '\n'
  };
};

function createIndent(indent) {
  return new Array(indent + 1).join(' ');
}
/**
 * Returns a presentation string of your `val` object
 * @param val any potential JavaScript object
 * @param options Custom settings
 */

function format(val, options) {
  if (options) {
    validateOptions(options);

    if (options.plugins) {
      const plugin = findPlugin(options.plugins, val);

      if (plugin !== null) {
        return printPlugin(plugin, val, getConfig(options), '', 0, []);
      }
    }
  }

  const basicResult = printBasicValue(
    val,
    getPrintFunctionName(options),
    getEscapeRegex(options),
    getEscapeString(options)
  );

  if (basicResult !== null) {
    return basicResult;
  }

  return printComplexValue(val, getConfig(options), '', 0, []);
}

const plugins = {
  AsymmetricMatcher: _AsymmetricMatcher.default,
  ConvertAnsi: _ConvertAnsi.default,
  DOMCollection: _DOMCollection.default,
  DOMElement: _DOMElement.default,
  Immutable: _Immutable.default,
  ReactElement: _ReactElement.default,
  ReactTestComponent: _ReactTestComponent.default
};
exports.plugins = plugins;
var _default = format;
exports.default = _default;

},{"./collections":240,"./plugins/AsymmetricMatcher":242,"./plugins/ConvertAnsi":243,"./plugins/DOMCollection":244,"./plugins/DOMElement":245,"./plugins/Immutable":246,"./plugins/ReactElement":247,"./plugins/ReactTestComponent":248,"ansi-styles":87}],242:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = exports.test = exports.serialize = void 0;

var _collections = require('../collections');

var global = (function () {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  } else if (typeof global !== 'undefined') {
    return global;
  } else if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
  } else {
    return Function('return this')();
  }
})();

var Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;
const asymmetricMatcher =
  typeof Symbol === 'function' && Symbol.for
    ? Symbol.for('jest.asymmetricMatcher')
    : 0x1357a5;
const SPACE = ' ';

const serialize = (val, config, indentation, depth, refs, printer) => {
  const stringedValue = val.toString();

  if (
    stringedValue === 'ArrayContaining' ||
    stringedValue === 'ArrayNotContaining'
  ) {
    if (++depth > config.maxDepth) {
      return '[' + stringedValue + ']';
    }

    return (
      stringedValue +
      SPACE +
      '[' +
      (0, _collections.printListItems)(
        val.sample,
        config,
        indentation,
        depth,
        refs,
        printer
      ) +
      ']'
    );
  }

  if (
    stringedValue === 'ObjectContaining' ||
    stringedValue === 'ObjectNotContaining'
  ) {
    if (++depth > config.maxDepth) {
      return '[' + stringedValue + ']';
    }

    return (
      stringedValue +
      SPACE +
      '{' +
      (0, _collections.printObjectProperties)(
        val.sample,
        config,
        indentation,
        depth,
        refs,
        printer
      ) +
      '}'
    );
  }

  if (
    stringedValue === 'StringMatching' ||
    stringedValue === 'StringNotMatching'
  ) {
    return (
      stringedValue +
      SPACE +
      printer(val.sample, config, indentation, depth, refs)
    );
  }

  if (
    stringedValue === 'StringContaining' ||
    stringedValue === 'StringNotContaining'
  ) {
    return (
      stringedValue +
      SPACE +
      printer(val.sample, config, indentation, depth, refs)
    );
  }

  return val.toAsymmetricMatcher();
};

exports.serialize = serialize;

const test = val => val && val.$$typeof === asymmetricMatcher;

exports.test = test;
const plugin = {
  serialize,
  test
};
var _default = plugin;
exports.default = _default;

},{"../collections":240}],243:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = exports.serialize = exports.test = void 0;

var _ansiRegex = _interopRequireDefault(require('ansi-regex'));

var _ansiStyles = _interopRequireDefault(require('ansi-styles'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const toHumanReadableAnsi = text =>
  text.replace((0, _ansiRegex.default)(), match => {
    switch (match) {
      case _ansiStyles.default.red.close:
      case _ansiStyles.default.green.close:
      case _ansiStyles.default.cyan.close:
      case _ansiStyles.default.gray.close:
      case _ansiStyles.default.white.close:
      case _ansiStyles.default.yellow.close:
      case _ansiStyles.default.bgRed.close:
      case _ansiStyles.default.bgGreen.close:
      case _ansiStyles.default.bgYellow.close:
      case _ansiStyles.default.inverse.close:
      case _ansiStyles.default.dim.close:
      case _ansiStyles.default.bold.close:
      case _ansiStyles.default.reset.open:
      case _ansiStyles.default.reset.close:
        return '</>';

      case _ansiStyles.default.red.open:
        return '<red>';

      case _ansiStyles.default.green.open:
        return '<green>';

      case _ansiStyles.default.cyan.open:
        return '<cyan>';

      case _ansiStyles.default.gray.open:
        return '<gray>';

      case _ansiStyles.default.white.open:
        return '<white>';

      case _ansiStyles.default.yellow.open:
        return '<yellow>';

      case _ansiStyles.default.bgRed.open:
        return '<bgRed>';

      case _ansiStyles.default.bgGreen.open:
        return '<bgGreen>';

      case _ansiStyles.default.bgYellow.open:
        return '<bgYellow>';

      case _ansiStyles.default.inverse.open:
        return '<inverse>';

      case _ansiStyles.default.dim.open:
        return '<dim>';

      case _ansiStyles.default.bold.open:
        return '<bold>';

      default:
        return '';
    }
  });

const test = val =>
  typeof val === 'string' && !!val.match((0, _ansiRegex.default)());

exports.test = test;

const serialize = (val, config, indentation, depth, refs, printer) =>
  printer(toHumanReadableAnsi(val), config, indentation, depth, refs);

exports.serialize = serialize;
const plugin = {
  serialize,
  test
};
var _default = plugin;
exports.default = _default;

},{"ansi-regex":86,"ansi-styles":87}],244:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = exports.serialize = exports.test = void 0;

var _collections = require('../collections');

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable local/ban-types-eventually */
const SPACE = ' ';
const OBJECT_NAMES = ['DOMStringMap', 'NamedNodeMap'];
const ARRAY_REGEXP = /^(HTML\w*Collection|NodeList)$/;

const testName = name =>
  OBJECT_NAMES.indexOf(name) !== -1 || ARRAY_REGEXP.test(name);

const test = val =>
  val &&
  val.constructor &&
  !!val.constructor.name &&
  testName(val.constructor.name);

exports.test = test;

const isNamedNodeMap = collection =>
  collection.constructor.name === 'NamedNodeMap';

const serialize = (collection, config, indentation, depth, refs, printer) => {
  const name = collection.constructor.name;

  if (++depth > config.maxDepth) {
    return '[' + name + ']';
  }

  return (
    (config.min ? '' : name + SPACE) +
    (OBJECT_NAMES.indexOf(name) !== -1
      ? '{' +
        (0, _collections.printObjectProperties)(
          isNamedNodeMap(collection)
            ? Array.from(collection).reduce((props, attribute) => {
                props[attribute.name] = attribute.value;
                return props;
              }, {})
            : {...collection},
          config,
          indentation,
          depth,
          refs,
          printer
        ) +
        '}'
      : '[' +
        (0, _collections.printListItems)(
          Array.from(collection),
          config,
          indentation,
          depth,
          refs,
          printer
        ) +
        ']')
  );
};

exports.serialize = serialize;
const plugin = {
  serialize,
  test
};
var _default = plugin;
exports.default = _default;

},{"../collections":240}],245:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = exports.serialize = exports.test = void 0;

var _markup = require('./lib/markup');

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const FRAGMENT_NODE = 11;
const ELEMENT_REGEXP = /^((HTML|SVG)\w*)?Element$/;

const testHasAttribute = val => {
  try {
    return typeof val.hasAttribute === 'function' && val.hasAttribute('is');
  } catch {
    return false;
  }
};

const testNode = val => {
  const constructorName = val.constructor.name;
  const {nodeType, tagName} = val;
  const isCustomElement =
    (typeof tagName === 'string' && tagName.includes('-')) ||
    testHasAttribute(val);
  return (
    (nodeType === ELEMENT_NODE &&
      (ELEMENT_REGEXP.test(constructorName) || isCustomElement)) ||
    (nodeType === TEXT_NODE && constructorName === 'Text') ||
    (nodeType === COMMENT_NODE && constructorName === 'Comment') ||
    (nodeType === FRAGMENT_NODE && constructorName === 'DocumentFragment')
  );
};

const test = val => {
  var _val$constructor;

  return (
    (val === null || val === void 0
      ? void 0
      : (_val$constructor = val.constructor) === null ||
        _val$constructor === void 0
      ? void 0
      : _val$constructor.name) && testNode(val)
  );
};

exports.test = test;

function nodeIsText(node) {
  return node.nodeType === TEXT_NODE;
}

function nodeIsComment(node) {
  return node.nodeType === COMMENT_NODE;
}

function nodeIsFragment(node) {
  return node.nodeType === FRAGMENT_NODE;
}

const serialize = (node, config, indentation, depth, refs, printer) => {
  if (nodeIsText(node)) {
    return (0, _markup.printText)(node.data, config);
  }

  if (nodeIsComment(node)) {
    return (0, _markup.printComment)(node.data, config);
  }

  const type = nodeIsFragment(node)
    ? `DocumentFragment`
    : node.tagName.toLowerCase();

  if (++depth > config.maxDepth) {
    return (0, _markup.printElementAsLeaf)(type, config);
  }

  return (0, _markup.printElement)(
    type,
    (0, _markup.printProps)(
      nodeIsFragment(node)
        ? []
        : Array.from(node.attributes)
            .map(attr => attr.name)
            .sort(),
      nodeIsFragment(node)
        ? {}
        : Array.from(node.attributes).reduce((props, attribute) => {
            props[attribute.name] = attribute.value;
            return props;
          }, {}),
      config,
      indentation + config.indent,
      depth,
      refs,
      printer
    ),
    (0, _markup.printChildren)(
      Array.prototype.slice.call(node.childNodes || node.children),
      config,
      indentation + config.indent,
      depth,
      refs,
      printer
    ),
    config,
    indentation
  );
};

exports.serialize = serialize;
const plugin = {
  serialize,
  test
};
var _default = plugin;
exports.default = _default;

},{"./lib/markup":250}],246:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = exports.test = exports.serialize = void 0;

var _collections = require('../collections');

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// SENTINEL constants are from https://github.com/facebook/immutable-js
const IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
const IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';
const IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
const IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';
const IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';
const IS_RECORD_SENTINEL = '@@__IMMUTABLE_RECORD__@@'; // immutable v4

const IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';
const IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';
const IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

const getImmutableName = name => 'Immutable.' + name;

const printAsLeaf = name => '[' + name + ']';

const SPACE = ' ';
const LAZY = '…'; // Seq is lazy if it calls a method like filter

const printImmutableEntries = (
  val,
  config,
  indentation,
  depth,
  refs,
  printer,
  type
) =>
  ++depth > config.maxDepth
    ? printAsLeaf(getImmutableName(type))
    : getImmutableName(type) +
      SPACE +
      '{' +
      (0, _collections.printIteratorEntries)(
        val.entries(),
        config,
        indentation,
        depth,
        refs,
        printer
      ) +
      '}'; // Record has an entries method because it is a collection in immutable v3.
// Return an iterator for Immutable Record from version v3 or v4.

function getRecordEntries(val) {
  let i = 0;
  return {
    next() {
      if (i < val._keys.length) {
        const key = val._keys[i++];
        return {
          done: false,
          value: [key, val.get(key)]
        };
      }

      return {
        done: true,
        value: undefined
      };
    }
  };
}

const printImmutableRecord = (
  val,
  config,
  indentation,
  depth,
  refs,
  printer
) => {
  // _name property is defined only for an Immutable Record instance
  // which was constructed with a second optional descriptive name arg
  const name = getImmutableName(val._name || 'Record');
  return ++depth > config.maxDepth
    ? printAsLeaf(name)
    : name +
        SPACE +
        '{' +
        (0, _collections.printIteratorEntries)(
          getRecordEntries(val),
          config,
          indentation,
          depth,
          refs,
          printer
        ) +
        '}';
};

const printImmutableSeq = (val, config, indentation, depth, refs, printer) => {
  const name = getImmutableName('Seq');

  if (++depth > config.maxDepth) {
    return printAsLeaf(name);
  }

  if (val[IS_KEYED_SENTINEL]) {
    return (
      name +
      SPACE +
      '{' +
      (val._iter || val._object
        ? (0, _collections.printIteratorEntries)(
            val.entries(),
            config,
            indentation,
            depth,
            refs,
            printer
          )
        : LAZY) +
      '}'
    );
  }

  return (
    name +
    SPACE +
    '[' +
    (val._iter || // from Immutable collection of values
    val._array || // from ECMAScript array
    val._collection || // from ECMAScript collection in immutable v4
    val._iterable // from ECMAScript collection in immutable v3
      ? (0, _collections.printIteratorValues)(
          val.values(),
          config,
          indentation,
          depth,
          refs,
          printer
        )
      : LAZY) +
    ']'
  );
};

const printImmutableValues = (
  val,
  config,
  indentation,
  depth,
  refs,
  printer,
  type
) =>
  ++depth > config.maxDepth
    ? printAsLeaf(getImmutableName(type))
    : getImmutableName(type) +
      SPACE +
      '[' +
      (0, _collections.printIteratorValues)(
        val.values(),
        config,
        indentation,
        depth,
        refs,
        printer
      ) +
      ']';

const serialize = (val, config, indentation, depth, refs, printer) => {
  if (val[IS_MAP_SENTINEL]) {
    return printImmutableEntries(
      val,
      config,
      indentation,
      depth,
      refs,
      printer,
      val[IS_ORDERED_SENTINEL] ? 'OrderedMap' : 'Map'
    );
  }

  if (val[IS_LIST_SENTINEL]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer,
      'List'
    );
  }

  if (val[IS_SET_SENTINEL]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer,
      val[IS_ORDERED_SENTINEL] ? 'OrderedSet' : 'Set'
    );
  }

  if (val[IS_STACK_SENTINEL]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer,
      'Stack'
    );
  }

  if (val[IS_SEQ_SENTINEL]) {
    return printImmutableSeq(val, config, indentation, depth, refs, printer);
  } // For compatibility with immutable v3 and v4, let record be the default.

  return printImmutableRecord(val, config, indentation, depth, refs, printer);
}; // Explicitly comparing sentinel properties to true avoids false positive
// when mock identity-obj-proxy returns the key as the value for any key.

exports.serialize = serialize;

const test = val =>
  val &&
  (val[IS_ITERABLE_SENTINEL] === true || val[IS_RECORD_SENTINEL] === true);

exports.test = test;
const plugin = {
  serialize,
  test
};
var _default = plugin;
exports.default = _default;

},{"../collections":240}],247:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = exports.test = exports.serialize = void 0;

var ReactIs = _interopRequireWildcard(require('react-is'));

var _markup = require('./lib/markup');

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== 'function') return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function (nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Given element.props.children, or subtree during recursive traversal,
// return flattened array of children.
const getChildren = (arg, children = []) => {
  if (Array.isArray(arg)) {
    arg.forEach(item => {
      getChildren(item, children);
    });
  } else if (arg != null && arg !== false) {
    children.push(arg);
  }

  return children;
};

const getType = element => {
  const type = element.type;

  if (typeof type === 'string') {
    return type;
  }

  if (typeof type === 'function') {
    return type.displayName || type.name || 'Unknown';
  }

  if (ReactIs.isFragment(element)) {
    return 'React.Fragment';
  }

  if (ReactIs.isSuspense(element)) {
    return 'React.Suspense';
  }

  if (typeof type === 'object' && type !== null) {
    if (ReactIs.isContextProvider(element)) {
      return 'Context.Provider';
    }

    if (ReactIs.isContextConsumer(element)) {
      return 'Context.Consumer';
    }

    if (ReactIs.isForwardRef(element)) {
      if (type.displayName) {
        return type.displayName;
      }

      const functionName = type.render.displayName || type.render.name || '';
      return functionName !== ''
        ? 'ForwardRef(' + functionName + ')'
        : 'ForwardRef';
    }

    if (ReactIs.isMemo(element)) {
      const functionName =
        type.displayName || type.type.displayName || type.type.name || '';
      return functionName !== '' ? 'Memo(' + functionName + ')' : 'Memo';
    }
  }

  return 'UNDEFINED';
};

const getPropKeys = element => {
  const {props} = element;
  return Object.keys(props)
    .filter(key => key !== 'children' && props[key] !== undefined)
    .sort();
};

const serialize = (element, config, indentation, depth, refs, printer) =>
  ++depth > config.maxDepth
    ? (0, _markup.printElementAsLeaf)(getType(element), config)
    : (0, _markup.printElement)(
        getType(element),
        (0, _markup.printProps)(
          getPropKeys(element),
          element.props,
          config,
          indentation + config.indent,
          depth,
          refs,
          printer
        ),
        (0, _markup.printChildren)(
          getChildren(element.props.children),
          config,
          indentation + config.indent,
          depth,
          refs,
          printer
        ),
        config,
        indentation
      );

exports.serialize = serialize;

const test = val => val != null && ReactIs.isElement(val);

exports.test = test;
const plugin = {
  serialize,
  test
};
var _default = plugin;
exports.default = _default;

},{"./lib/markup":250,"react-is":254}],248:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = exports.test = exports.serialize = void 0;

var _markup = require('./lib/markup');

var global = (function () {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  } else if (typeof global !== 'undefined') {
    return global;
  } else if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
  } else {
    return Function('return this')();
  }
})();

var Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;
const testSymbol =
  typeof Symbol === 'function' && Symbol.for
    ? Symbol.for('react.test.json')
    : 0xea71357;

const getPropKeys = object => {
  const {props} = object;
  return props
    ? Object.keys(props)
        .filter(key => props[key] !== undefined)
        .sort()
    : [];
};

const serialize = (object, config, indentation, depth, refs, printer) =>
  ++depth > config.maxDepth
    ? (0, _markup.printElementAsLeaf)(object.type, config)
    : (0, _markup.printElement)(
        object.type,
        object.props
          ? (0, _markup.printProps)(
              getPropKeys(object),
              object.props,
              config,
              indentation + config.indent,
              depth,
              refs,
              printer
            )
          : '',
        object.children
          ? (0, _markup.printChildren)(
              object.children,
              config,
              indentation + config.indent,
              depth,
              refs,
              printer
            )
          : '',
        config,
        indentation
      );

exports.serialize = serialize;

const test = val => val && val.$$typeof === testSymbol;

exports.test = test;
const plugin = {
  serialize,
  test
};
var _default = plugin;
exports.default = _default;

},{"./lib/markup":250}],249:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = escapeHTML;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function escapeHTML(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

},{}],250:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.printElementAsLeaf =
  exports.printElement =
  exports.printComment =
  exports.printText =
  exports.printChildren =
  exports.printProps =
    void 0;

var _escapeHTML = _interopRequireDefault(require('./escapeHTML'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Return empty string if keys is empty.
const printProps = (keys, props, config, indentation, depth, refs, printer) => {
  const indentationNext = indentation + config.indent;
  const colors = config.colors;
  return keys
    .map(key => {
      const value = props[key];
      let printed = printer(value, config, indentationNext, depth, refs);

      if (typeof value !== 'string') {
        if (printed.indexOf('\n') !== -1) {
          printed =
            config.spacingOuter +
            indentationNext +
            printed +
            config.spacingOuter +
            indentation;
        }

        printed = '{' + printed + '}';
      }

      return (
        config.spacingInner +
        indentation +
        colors.prop.open +
        key +
        colors.prop.close +
        '=' +
        colors.value.open +
        printed +
        colors.value.close
      );
    })
    .join('');
}; // Return empty string if children is empty.

exports.printProps = printProps;

const printChildren = (children, config, indentation, depth, refs, printer) =>
  children
    .map(
      child =>
        config.spacingOuter +
        indentation +
        (typeof child === 'string'
          ? printText(child, config)
          : printer(child, config, indentation, depth, refs))
    )
    .join('');

exports.printChildren = printChildren;

const printText = (text, config) => {
  const contentColor = config.colors.content;
  return (
    contentColor.open + (0, _escapeHTML.default)(text) + contentColor.close
  );
};

exports.printText = printText;

const printComment = (comment, config) => {
  const commentColor = config.colors.comment;
  return (
    commentColor.open +
    '<!--' +
    (0, _escapeHTML.default)(comment) +
    '-->' +
    commentColor.close
  );
}; // Separate the functions to format props, children, and element,
// so a plugin could override a particular function, if needed.
// Too bad, so sad: the traditional (but unnecessary) space
// in a self-closing tagColor requires a second test of printedProps.

exports.printComment = printComment;

const printElement = (
  type,
  printedProps,
  printedChildren,
  config,
  indentation
) => {
  const tagColor = config.colors.tag;
  return (
    tagColor.open +
    '<' +
    type +
    (printedProps &&
      tagColor.close +
        printedProps +
        config.spacingOuter +
        indentation +
        tagColor.open) +
    (printedChildren
      ? '>' +
        tagColor.close +
        printedChildren +
        config.spacingOuter +
        indentation +
        tagColor.open +
        '</' +
        type
      : (printedProps && !config.min ? '' : ' ') + '/') +
    '>' +
    tagColor.close
  );
};

exports.printElement = printElement;

const printElementAsLeaf = (type, config) => {
  const tagColor = config.colors.tag;
  return (
    tagColor.open +
    '<' +
    type +
    tagColor.close +
    ' …' +
    tagColor.open +
    ' />' +
    tagColor.close
  );
};

exports.printElementAsLeaf = printElementAsLeaf;

},{"./escapeHTML":249}],251:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],252:[function(require,module,exports){
(function (process){(function (){
/** @license React v17.0.2
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_ELEMENT_TYPE = 0xeac7;
var REACT_PORTAL_TYPE = 0xeaca;
var REACT_FRAGMENT_TYPE = 0xeacb;
var REACT_STRICT_MODE_TYPE = 0xeacc;
var REACT_PROFILER_TYPE = 0xead2;
var REACT_PROVIDER_TYPE = 0xeacd;
var REACT_CONTEXT_TYPE = 0xeace;
var REACT_FORWARD_REF_TYPE = 0xead0;
var REACT_SUSPENSE_TYPE = 0xead1;
var REACT_SUSPENSE_LIST_TYPE = 0xead8;
var REACT_MEMO_TYPE = 0xead3;
var REACT_LAZY_TYPE = 0xead4;
var REACT_BLOCK_TYPE = 0xead9;
var REACT_SERVER_BLOCK_TYPE = 0xeada;
var REACT_FUNDAMENTAL_TYPE = 0xead5;
var REACT_SCOPE_TYPE = 0xead7;
var REACT_OPAQUE_ID_TYPE = 0xeae0;
var REACT_DEBUG_TRACING_MODE_TYPE = 0xeae1;
var REACT_OFFSCREEN_TYPE = 0xeae2;
var REACT_LEGACY_HIDDEN_TYPE = 0xeae3;

if (typeof Symbol === 'function' && Symbol.for) {
  var symbolFor = Symbol.for;
  REACT_ELEMENT_TYPE = symbolFor('react.element');
  REACT_PORTAL_TYPE = symbolFor('react.portal');
  REACT_FRAGMENT_TYPE = symbolFor('react.fragment');
  REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
  REACT_PROFILER_TYPE = symbolFor('react.profiler');
  REACT_PROVIDER_TYPE = symbolFor('react.provider');
  REACT_CONTEXT_TYPE = symbolFor('react.context');
  REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
  REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
  REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
  REACT_MEMO_TYPE = symbolFor('react.memo');
  REACT_LAZY_TYPE = symbolFor('react.lazy');
  REACT_BLOCK_TYPE = symbolFor('react.block');
  REACT_SERVER_BLOCK_TYPE = symbolFor('react.server.block');
  REACT_FUNDAMENTAL_TYPE = symbolFor('react.fundamental');
  REACT_SCOPE_TYPE = symbolFor('react.scope');
  REACT_OPAQUE_ID_TYPE = symbolFor('react.opaque.id');
  REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
  REACT_OFFSCREEN_TYPE = symbolFor('react.offscreen');
  REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
}

// Filter certain DOM attributes (e.g. src, href) if their values are empty strings.

var enableScopeAPI = false; // Experimental Create Event Handle API.

function isValidElementType(type) {
  if (typeof type === 'string' || typeof type === 'function') {
    return true;
  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_DEBUG_TRACING_MODE_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_LEGACY_HIDDEN_TYPE || enableScopeAPI ) {
    return true;
  }

  if (typeof type === 'object' && type !== null) {
    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_BLOCK_TYPE || type[0] === REACT_SERVER_BLOCK_TYPE) {
      return true;
    }
  }

  return false;
}

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;

    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
          case REACT_SUSPENSE_LIST_TYPE:
            return type;

          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;

              default:
                return $$typeof;
            }

        }

      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
}
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;
var hasWarnedAboutDeprecatedIsAsyncMode = false;
var hasWarnedAboutDeprecatedIsConcurrentMode = false; // AsyncMode should be deprecated

function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
    }
  }

  return false;
}
function isConcurrentMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
      hasWarnedAboutDeprecatedIsConcurrentMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isConcurrentMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
    }
  }

  return false;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

exports.ContextConsumer = ContextConsumer;
exports.ContextProvider = ContextProvider;
exports.Element = Element;
exports.ForwardRef = ForwardRef;
exports.Fragment = Fragment;
exports.Lazy = Lazy;
exports.Memo = Memo;
exports.Portal = Portal;
exports.Profiler = Profiler;
exports.StrictMode = StrictMode;
exports.Suspense = Suspense;
exports.isAsyncMode = isAsyncMode;
exports.isConcurrentMode = isConcurrentMode;
exports.isContextConsumer = isContextConsumer;
exports.isContextProvider = isContextProvider;
exports.isElement = isElement;
exports.isForwardRef = isForwardRef;
exports.isFragment = isFragment;
exports.isLazy = isLazy;
exports.isMemo = isMemo;
exports.isPortal = isPortal;
exports.isProfiler = isProfiler;
exports.isStrictMode = isStrictMode;
exports.isSuspense = isSuspense;
exports.isValidElementType = isValidElementType;
exports.typeOf = typeOf;
  })();
}

}).call(this)}).call(this,require('_process'))
},{"_process":251}],253:[function(require,module,exports){
/** @license React v17.0.2
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';var b=60103,c=60106,d=60107,e=60108,f=60114,g=60109,h=60110,k=60112,l=60113,m=60120,n=60115,p=60116,q=60121,r=60122,u=60117,v=60129,w=60131;
if("function"===typeof Symbol&&Symbol.for){var x=Symbol.for;b=x("react.element");c=x("react.portal");d=x("react.fragment");e=x("react.strict_mode");f=x("react.profiler");g=x("react.provider");h=x("react.context");k=x("react.forward_ref");l=x("react.suspense");m=x("react.suspense_list");n=x("react.memo");p=x("react.lazy");q=x("react.block");r=x("react.server.block");u=x("react.fundamental");v=x("react.debug_trace_mode");w=x("react.legacy_hidden")}
function y(a){if("object"===typeof a&&null!==a){var t=a.$$typeof;switch(t){case b:switch(a=a.type,a){case d:case f:case e:case l:case m:return a;default:switch(a=a&&a.$$typeof,a){case h:case k:case p:case n:case g:return a;default:return t}}case c:return t}}}var z=g,A=b,B=k,C=d,D=p,E=n,F=c,G=f,H=e,I=l;exports.ContextConsumer=h;exports.ContextProvider=z;exports.Element=A;exports.ForwardRef=B;exports.Fragment=C;exports.Lazy=D;exports.Memo=E;exports.Portal=F;exports.Profiler=G;exports.StrictMode=H;
exports.Suspense=I;exports.isAsyncMode=function(){return!1};exports.isConcurrentMode=function(){return!1};exports.isContextConsumer=function(a){return y(a)===h};exports.isContextProvider=function(a){return y(a)===g};exports.isElement=function(a){return"object"===typeof a&&null!==a&&a.$$typeof===b};exports.isForwardRef=function(a){return y(a)===k};exports.isFragment=function(a){return y(a)===d};exports.isLazy=function(a){return y(a)===p};exports.isMemo=function(a){return y(a)===n};
exports.isPortal=function(a){return y(a)===c};exports.isProfiler=function(a){return y(a)===f};exports.isStrictMode=function(a){return y(a)===e};exports.isSuspense=function(a){return y(a)===l};exports.isValidElementType=function(a){return"string"===typeof a||"function"===typeof a||a===d||a===f||a===v||a===e||a===l||a===m||a===w||"object"===typeof a&&null!==a&&(a.$$typeof===p||a.$$typeof===n||a.$$typeof===g||a.$$typeof===h||a.$$typeof===k||a.$$typeof===u||a.$$typeof===q||a[0]===r)?!0:!1};
exports.typeOf=y;

},{}],254:[function(require,module,exports){
(function (process){(function (){
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-is.production.min.js');
} else {
  module.exports = require('./cjs/react-is.development.js');
}

}).call(this)}).call(this,require('_process'))
},{"./cjs/react-is.development.js":252,"./cjs/react-is.production.min.js":253,"_process":251}]},{},[1])(1)
});

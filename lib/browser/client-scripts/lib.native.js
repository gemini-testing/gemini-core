'use strict';
var isXpathSelector = require('./util').isXpathSelector;
exports.queryFirst = function(selector) {
    if (isXpathSelector(selector)) {
        return document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    return document.querySelector(selector);
};

exports.queryAll = function(selector) {
    if (isXpathSelector(selector)) {
        var elements = document.evaluate(selector, document, null, XPathResult.ANY_TYPE, null);
        var node, nodes = [];
        node = elements.iterateNext();
        while (node) {
            nodes.push(node);
            node = elements.iterateNext();
        }
        return nodes;
    }
    return document.querySelectorAll(selector);
};

exports.getComputedStyle = function(element, pseudoElement) {
    return getComputedStyle(element, pseudoElement);
};

exports.matchMedia = function(mediaQuery) {
    return matchMedia(mediaQuery);
};

exports.trim = function(str) {
    return str.trim();
};

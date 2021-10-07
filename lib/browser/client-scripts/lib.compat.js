'use strict';
/*jshint newcap:false*/
var Sizzle = require('sizzle');
var isXpathSelector = require('./util').isXpathSelector;
exports.queryFirst = function(selector) {
    if (isXpathSelector(selector)) {
        return document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    var elems = Sizzle(exports.trim(selector) + ':first');
    return elems.length > 0 ? elems[0] : null;
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
    return Sizzle(selector);
};

exports.trim = function(str) {
    // trim spaces, unicode BOM and NBSP and the beginning and the end of the line
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

exports.getComputedStyle = require('./polyfills/getComputedStyle').getComputedStyle;
exports.matchMedia = require('./polyfills/matchMedia').matchMedia;

var Handlebars = require('handlebars')
var util = require('../lib/util')

Handlebars.registerHelper('urlRelative', util.urlRelative)

var index = '<!DOCTYPE html>\n' +
    '<html>\n' +
    '<head>\n' +
    '<title></title>\n' +
    '<meta content="text/html; charset=utf-8" http-equiv="Content-Type">\n' +
    '{{#if referrer}}' +
    '<meta content="{{referrer}}" name="referrer">\n' +
    '{{else}}' +
    '<meta content="no-referrer" name="referrer">\n' +
    '{{/if}}' +
    '{{#if noindex}}' +
    '<meta content="noindex" name="robots">\n' +
    '{{/if}}' +
    '<meta content="text/css" http-equiv="Content-Style-Type">\n' +
    '<meta content="width=device-width, initial-scale=1" name="viewport">\n' +
    '<link href="{{urlRelative path "/favicon.ico"}}" rel="icon" type="image/x-icon">\n' +
    '<link href="{{urlRelative path "/_assets/css/wiki.css"}}" rel="stylesheet">\n' +
    '<script src="{{urlRelative path "/_assets/js/wiki.js"}}"></script>\n' +
    '</head>\n' +
    '<body>\n' +
    '</body>\n' +
    '</html>'

// TODO: precompile the templates
module.exports = Handlebars.compile(index)

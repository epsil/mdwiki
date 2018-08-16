var Handlebars = require('handlebars')
var markdown = require('../lib/markdown')
var util = require('../lib/util')
require('../lib/anchor')
require('../lib/collapse')
require('../lib/footnotes')
require('../lib/section')
require('../lib/social')
require('../lib/figure')
require('../lib/toc')

Handlebars.registerHelper('markdown', markdown.inline)
Handlebars.registerHelper('text', markdown.toText)
Handlebars.registerHelper('urlRelative', util.urlRelative)
Handlebars.registerHelper('urlResolve', util.urlResolve)
Handlebars.registerHelper('dateFormat', util.dateFormat)

var body = '<nav class="navbar navbar-default navbar-fixed-top">\n' +
    '<div class="container-fluid topbar">\n' +
    '<ul class="nav nav-pills navbar-left">\n' +
    '<li role="presentation"><a href="/" title="{{text home-title}}"><i class="fa fa-home"></i></a></li>\n' +
    '</ul>\n' +
    '<ul class="nav nav-pills navbar-right">\n' +
    '{{#each nav}}' +
    '<li role="presentation">{{{markdown this}}}</li>\n' +
    '{{/each}}' +
    // '<li role="presentation"><a href="{{facebook}}" title="{{text facebook-title}}"><i class="fa fa-facebook-square"></i></a></li>\n' +
    // '<li role="presentation"><a href="{{twitter}}" title="{{text twitter-title}}"><i class="fa fa-twitter-square"></i></a></li>\n' +
    // '<li role="presentation"><a href="{{linkedin}}" title="{{text linkedin-title}}"><i class="fa fa-linkedin-square"></i></a></li>\n' +
    // '<li role="presentation"><a href="{{mail}}" title="{{text mail-title}}"><i class="fa fa-envelope"></i></a></li>\n' +
    '<li role="presentation"><a href="/tmp/clipboard/" target="_blank" title="{{text clipboard-title}}"><i class="fa fa-clipboard"></i></a></li>\n' +
    '{{#if github-repo}}' +
    '<li role="presentation"><a href="{{github}}" title="{{text github-repo-title}}"><i class="fa fa-github"></i></a></li>\n' +
    '<li role="presentation"><a href="{{github-edit}}" title="{{text github-edit-title}}"><i class="fa fa-edit"></i></a></li>\n' +
    // '<li role="presentation"><a href="{{github-history}}" title="{{text github-history-title}}"><i class="fa fa-history"></i></a></li>\n' +
    '<li role="presentation"><a href="{{github-raw}}" title="{{text markdown-title}}"><i class="fa fa-download"></i></a></li>\n' +
    '{{else}}' +
    '{{#if bitbucket-repo}}' +
    '<li role="presentation"><a href="{{bitbucket}}" title="{{text bitbucket-repo-title}}"><i class="fa fa-edit"></i></a></li>\n' +
    // '<li role="presentation"><a href="{{bitbucket-history}}" title="{{text bitbucket-history-title}}"><i class="fa fa-history"></i></a></li>\n' +
    '<li role="presentation"><a href="{{file}}" title="{{text markdown-title}}"><i class="fa fa-download"></i></a></li>\n' +
    '{{else}}' +
    '<li role="presentation"><a href="{{file}}" title="{{text markdown-title}}"><i class="fa fa-download"></i></a></li>\n' +
    '{{/if}}' +
    '{{/if}}' +
    '{{#if toc}}' +
    '<li role="presentation"><a id="toc-button" href="#toc" data-toggle="collapse" title="{{text toc-title}}"><i class="fa fa-list"></i></a></li>\n' +
    '{{/if}}' +
    '</ul>\n' +
    '<form action="https://www.google.com/search" class="navbar-form" method="get" target="_blank">\n' +
    '<div class="form-group" style="display: inline;">\n' +
    '<div class="input-group" style="display: table;">\n' +
    '<span class="input-group-addon" style="width: 1%;"><span class="glyphicon glyphicon-search"></span></span>\n' +
    '<input accesskey="." autocomplete="off" class="form-control" name="q" title="{{text search-title}}" type="text">\n' +
    '</div>\n' +
    '</div>\n' +
    '</form>\n' +
    '</div>\n' +
    '{{#if toc}}' +
    '{{{toc}}}' +
    '{{/if}}' +
    '</nav>\n' +
    '<article class="h-entry" id="main">\n' +
    '<header>\n' +
    '{{#if include-before}}{{{markdown include-before}}}{{/if}}' +
    '{{#if title}}' +
    '<h1 class="p-name"><a class="u-uid u-url" href="{{url}}" rel="bookmark" title="Permalink">{{{markdown title}}}</a></h1>\n' +
    '{{#if subtitle}}' +
    '<h2>{{{markdown subtitle}}}</h2>\n' +
    '{{/if}}' +
    '{{#if author}}' +
    '{{#if author.name}}' +
    '<p class="author">' +
    '{{#if author.url}}' +
    '<a class="p-author h-card" href="{{author.url}}">{{{markdown author.name}}}</a>' +
    '{{else}}' +
    '<span class="p-author">{{{markdown author.name}}}</span>' +
    '{{/if}}' +
    '{{#if author}}' +
    '{{#if date}}' +
    ' &bull; ' +
    '{{/if}}' +
    '{{/if}}' +
    '{{#if date}}' +
    ' <time class="dt-published" datetime="{{dateFormat date}}">{{dateFormat date}}</time>' +
    '{{/if}}' +
    '</p>\n' +
    '{{else}}' +
    '<p class="author">' +
    '{{#if author-url}}' +
    '<a class="p-author h-card" href="{{author-url}}">{{{markdown author}}}</a>' +
    '{{else}}' +
    '{{#if author-email}}' +
    '<a class="p-author h-card" href="mailto:{{author-email}}">{{{markdown author}}}</a>' +
    '{{else}}' +
    '<span class="p-author">{{{markdown author}}}</span>' +
    '{{/if}}' +
    '{{/if}}' +
    '{{#if author}}' +
    '{{#if date}}' +
    ' &bull; ' +
    '{{/if}}' +
    '{{/if}}' +
    '{{#if date}}' +
    ' <time class="dt-published" datetime="{{dateFormat date}}">{{dateFormat date}}</time>' +
    '{{/if}}' +
    '</p>\n' +
    '{{/if}}' +
    '{{else}}' +
    '{{#if date}}' +
    '<p><time class="dt-published" datetime="{{dateFormat date}}">{{dateFormat date}}</time></p>\n' +
    '{{/if}}' +
    '{{/if}}' +
    '{{else}}' +
    '{{#if date}}' +
    '<h1 class="p-name"><a class="u-uid u-url" href="{{url}}" title="Permalink">{{dateFormat date}}</a></h1>\n' +
    '{{/if}}' +
    '{{/if}}' +
    '{{#if abstract}}' +
    '<p class="p-summary">{{{markdown abstract}}}</p>\n' +
    '{{/if}}' +
    '{{#if image}}' +
    '<figure>\n' +
    '<img alt="{{#if image-alt}}{{image-alt}}{{/if}}" class="u-photo" {{#if image-height}}height="{{image-height}}"{{/if}} {{#if image-width}}width="{{image-width}}"{{/if}} src="{{urlRelative path image}}">\n' +
    '</figure>\n' +
    '{{else}}' +
    '{{#if cover-image}}' +
    '<figure>\n' +
    '<img alt="{{#if cover-image-alt}}{{cover-image-alt}}{{/if}}" class="u-photo" {{#if cover-image-height}}height="{{cover-image-height}}"{{/if}} {{#if cover-image-width}}width="{{cover-image-width}}"{{/if}} src="{{urlRelative path cover-image}}">\n' +
    '</figure>\n' +
    '{{/if}}' +
    '{{/if}}' +
    '</header>\n' +
    '<section class="e-content{{#if indent}} indent{{/if}}{{#if sidenotes}} sidenotes{{/if}}">\n' +
    '{{{content}}}' +
    '{{#if footnotes}}' +
    '{{#if footnotes-title}}' +
    '<h1>{{{markdown footnotes-title}}}</h1>\n' +
    '{{{footnotes}}}' +
    '{{else}}' +
    '<hr class="footnotes-sep">\n' +
    '<section class="footnotes">\n' +
    '{{{footnotes}}}' +
    '</section>\n' +
    '{{/if}}' +
    '{{/if}}' +
    '{{#if include-after}}' +
    '<p>\n' +
    '{{{markdown include-after}}}' +
    '</p>\n' +
    '{{/if}}' +
    '</section>\n' +
    '</article>'

// TODO: precompile the templates
module.exports = Handlebars.compile(body)

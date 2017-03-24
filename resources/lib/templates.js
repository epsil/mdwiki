var Handlebars = require('handlebars')
var moment = require('moment')
var markdown = require('./markdown')
var util = require('./util')
require('./anchor')
require('./collapse')
require('./section')
require('./social')
require('./figure')
require('./punctuation')
require('./toc')

Handlebars.registerHelper('markdown', markdown.inline)
Handlebars.registerHelper('text', markdown.toText)
Handlebars.registerHelper('process', util.process)
Handlebars.registerHelper('urlRelative', util.urlRelative)
Handlebars.registerHelper('urlResolve', util.urlResolve)

Handlebars.registerHelper('dateFormat', function (context, block) {
  if (moment) {
    var date = moment(context).format('YYYY-MM-DD').trim()
    if (date === 'Invalid date') {
      return context
    } else {
      return date
    }
  } else {
    return context
  }
})

var templates = {
  document:
    '<!DOCTYPE html>\n' +
    '<html{{#if lang}} lang="{{lang}}"{{/if}} prefix="og: http://ogp.me/ns#">\n' +
    '<head>\n' +
    '<title>{{#if title}}{{text title}}{{#if site-name}} &ndash; {{site-name}}{{/if}}{{/if}}</title>\n' +
    '<meta content="text/html; charset=utf-8" http-equiv="Content-Type">\n' +
    '{{#if author}}<meta content="{{text author}}" name="author">\n{{/if}}' +
    '{{#if date}}<meta content="{{dateFormat date}}" name="date">\n{{/if}}' +
    '{{#if abstract}}<meta content="{{text abstract}}" name="description">\n{{/if}}' +
    '{{#if keywords}}<meta content="{{text keywords}}" name="keywords">\n{{/if}}' +
    '{{#if md5}}<meta content="{{{md5}}}" name="md5">\n{{/if}}' +
    '<meta content="text/css" http-equiv="Content-Style-Type">\n' +
    '<meta content="width=device-width, initial-scale=1" name="viewport">\n' +
    '{{#if title}}<meta name="DC.Title" content="{{text title}}">{{/if}}\n' +
    '{{#if author}}<meta name="DC.Creator" content="{{author}}">\n{{/if}}' +
    '{{#if date}}<meta name="DC.Date" content="{{dateFormat date}}">\n{{/if}}' +
    '{{#if abstract}}<meta name="DC.Description" content="{{text abstract}}">\n{{/if}}' +
    '{{#if lang}}<meta name="DC.Language" content="{{lang}}">\n{{/if}}' +
    '<meta name="DC.Format" content="text/html">\n' +
    '{{#if title}}<meta property="og:title" content="{{text title}}">{{/if}}\n' +
    '{{#if abstract}}<meta property="og:description" content="{{text abstract}}">\n{{/if}}' +
    '{{#if lang}}<meta name="og:locale" content="{{lang}}">\n{{/if}}' +
    '<meta property="og:type" content="article">\n' +
    '{{#if url}}<meta property="og:url" content="{{url}}">{{/if}}\n' +
    '{{#if site-name}}<meta property="og:site_name" content="{{site-name}}">\n{{/if}}' +
    '{{#if image}}<meta property="og:image" content="{{urlResolve url image}}">\n{{/if}}' +
    '{{#if video}}<meta property="og:video" content="{{video}}">\n{{/if}}' +
    '<meta name="twitter:card" content="summary">\n' +
    '<meta name="twitter:site" content="@github">\n' +
    '{{#if title}}<meta name="twitter:title" content="{{text title}}">{{/if}}\n' +
    '{{#if abstract}}<meta name="twitter:description" content="{{text abstract}}">\n{{/if}}' +
    '{{#if image}}<meta name="twitter:image" content="{{urlResolve url image}}">\n{{/if}}' +
    '{{#if icon}}' +
    '<link href="{{urlRelative url icon}}" rel="icon" type="image/x-icon">\n' +
    '<link href="{{urlRelative url icon}}" rel="apple-touch-icon">\n' +
    '{{else if url}}' +
    '<link href="{{urlRelative url "/favicon.ico"}}" rel="icon" type="image/x-icon">\n' +
    '{{#if image}}' +
    '<link href="{{urlRelative url image}}" rel="apple-touch-icon">\n' +
    '{{else}}' +
    '<link href="{{urlRelative url "/apple-touch-icon.png"}}" rel="apple-touch-icon">\n' +
    '{{/if}}' +
    '{{/if}}' +
    '<link href="{{urlRelative url "/resources/css/markdown-template.css"}}" rel="stylesheet">\n' +
    '<link href="{{url}}" rel="canonical">\n' +
    '<link href="{{file}}" rel="alternate" title="Markdown" type="text/markdown">\n' +
    '{{#if css}}' +
    '<link href="{{urlRelative url css}}" rel="stylesheet" type="text/css">\n' +
    '{{/if}}' +
    '{{#if js}}' +
    '<script src="{{urlRelative url js}}" type="text/javascript"></script>\n' +
    '{{/if}}' +
    '{{#if mathjax}}' +
    '<script type="text/x-mathjax-config">\n' +
    'MathJax.Hub.Config({\n' +
    'TeX: { equationNumbers: { autoNumber: "all" } }\n' +
    '})\n' +
    '</script>\n' +
    '<script async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML" type="text/javascript"></script>\n' +
    '{{/if}}' +
    '<script src="{{urlRelative url "/resources/js/markdown-template.js"}}"></script>\n' +
    '</head>\n' +
    '<body>\n' +
    '{{{process content}}}' +
    '</body>\n' +
    '</html>',
  body:
    '<nav class="navbar navbar-default navbar-fixed-top">\n' +
    '<div class="container-fluid">\n' +
    '<ul class="nav nav-pills navbar-left">\n' +
    '<li role="presentation"><a href="/" title="{{text home-title}}"><i class="fa fa-home"></i></a></li>\n' +
    '</ul>\n' +
    '<ul class="nav nav-pills navbar-right">\n' +
    '<li role="presentation"><a href="{{facebook}}" title="{{text facebook-title}}"><i class="fa fa-facebook-square"></i></a></li>\n' +
    '<li role="presentation"><a href="{{twitter}}" title="{{text twitter-title}}"><i class="fa fa-twitter-square"></i></a></li>\n' +
    // '<li role="presentation"><a href="{{linkedin}}" title="{{text linkedin-title}}"><i class="fa fa-linkedin-square"></i></a></li>\n' +
    // '<li role="presentation"><a href="{{mail}}" title="{{text mail-title}}"><i class="fa fa-envelope"></i></a></li>\n' +
    '{{#if github-repo}}' +
    '<li role="presentation"><a href="{{github}}" title="{{text github-repo-title}}"><i class="fa fa-github"></i></a></li>\n' +
    '<li role="presentation"><a href="{{github-edit}}" title="{{text github-edit-title}}"><i class="fa fa-edit"></i></a></li>\n' +
    // '<li role="presentation"><a href="{{github-history}}" title="{{text github-history-title}}"><i class="fa fa-history"></i></a></li>\n' +
    '<li role="presentation"><a href="{{github-raw}}" title="{{text markdown-title}}"><i class="fa fa-download"></i></a></li>\n' +
    '{{else}}' +
    '{{#if bitbucket-repo}}' +
    '<li role="presentation"><a href="{{bitbucket}}" title="{{text bitbucket-repo-title}}"><i class="fa fa-edit"></i></a></li>\n' +
    '<li role="presentation"><a href="{{bitbucket-history}}" title="{{text bitbucket-history-title}}"><i class="fa fa-history"></i></a></li>\n' +
    '<li role="presentation"><a href="index.md" title="{{text markdown-title}}"><i class="fa fa-download"></i></a></li>\n' +
    '{{else}}' +
    '<li role="presentation"><a href="index.md" title="{{text markdown-title}}"><i class="fa fa-download"></i></a></li>\n' +
    '{{/if}}' +
    '{{/if}}' +
    '{{#if toc}}' +
    '<li role="presentation"><a name="toc-button" href="#toc" data-toggle="collapse" title="{{text toc-title}}"><i class="fa fa-list"></i></a></li>\n' +
    '{{/if}}' +
    '</ul>\n' +
    '</div>\n' +
    '{{#if toc}}' +
    '{{{toc}}}' +
    '{{/if}}' +
    '</nav>\n' +
    '<article class="h-entry">\n' +
    '<header>\n' +
    '{{#if include-before}}{{{markdown include-before}}}{{/if}}' +
    '{{#if title}}' +
    '<h1 class="p-name"><a class="u-uid u-url" href="{{url}}" rel="bookmark" title="Permalink">{{{markdown title}}}</a></h1>\n' +
    '{{#if subtitle}}' +
    '<h2>{{{markdown subtitle}}}</h2>\n' +
    '{{/if}}' +
    '{{#if author}}' +
    '<p class="author">' +
    '{{#if author-url}}' +
    '<a class="p-author h-card" href="{{author-url}}">{{{markdown author}}}</a>' +
    '{{else}}' +
    '<span class="p-author">{{{markdown author}}}</span>' +
    '{{/if}}' +
    '{{#if author}}' +
    '{{#if date}}' +
    ' &bull; ' +
    '{{/if}}' +
    '{{/if}}' +
    '{{#if date}}' +
    ' <time class="dt-published" datetime="{{dateFormat date}}" datetime="{{dateFormat date}}">{{dateFormat date}}</time>' +
    '{{/if}}' +
    '</p>\n' +
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
    '<img alt="{{#if image-alt}}{{image-alt}}{{/if}}" class="u-photo" {{#if image-height}}height="{{image-height}}"{{/if}} {{#if image-width}}width="{{image-width}}"{{/if}} src="{{urlRelative url image}}">\n' +
    '</figure>\n' +
    '{{/if}}' +
    '</header>\n' +
    '<section class="e-content">\n' +
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
}

// TODO: precompile the templates
templates.document = Handlebars.compile(templates.document)
templates.body = Handlebars.compile(templates.body)

module.exports = templates

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

var document = '<!DOCTYPE html>\n' +
    '<html{{#if lang}} lang="{{lang}}"{{/if}} prefix="og: http://ogp.me/ns#">\n' +
    '<head>\n' +
    '<title>{{#if title}}{{text title}}{{/if}}</title>\n' +
    '<meta content="text/html; charset=utf-8" http-equiv="Content-Type">\n' +
    '{{#if referrer}}' +
    '<meta content="{{referrer}}" name="referrer">\n' +
    '{{else}}' +
    '<meta content="no-referrer" name="referrer">\n' +
    '{{/if}}' +
    '{{#if noindex}}' +
    '<meta content="noindex" name="robots">\n' +
    '{{/if}}' +
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
    '{{#if image}}<meta property="og:image" content="{{urlResolve path image}}">\n{{else}}' +
    '{{#if cover-image}}<meta property="og:image" content="{{urlResolve path cover-image}}">\n{{/if}}{{/if}}' +
    '{{#if video}}<meta property="og:video" content="{{video}}">\n{{/if}}' +
    '<meta name="twitter:card" content="summary">\n' +
    '<meta name="twitter:site" content="@github">\n' +
    '{{#if title}}<meta name="twitter:title" content="{{text title}}">{{/if}}\n' +
    '{{#if abstract}}<meta name="twitter:description" content="{{text abstract}}">\n{{/if}}' +
    '{{#if image}}<meta name="twitter:image" content="{{urlResolve path image}}">\n{{else}}' +
    '{{#if cover-image}}<meta name="twitter:image" content="{{urlResolve path cover-image}}">\n{{/if}}{{/if}}' +
    '{{#if icon}}' +
    '<link href="{{urlRelative path icon}}" rel="icon" type="image/x-icon">\n' +
    '<link href="{{urlRelative path icon}}" rel="apple-touch-icon">\n' +
    '{{else if path}}' +
    '<link href="{{urlRelative path "/favicon.ico"}}" rel="icon" type="image/x-icon">\n' +
    '{{#if image}}' +
    '<link href="{{urlRelative path image}}" rel="apple-touch-icon">\n' +
    '{{else}}' +
    '{{#if cover-image}}' +
    '<link href="{{urlRelative path cover-image}}" rel="apple-touch-icon">\n' +
    '{{else}}' +
    '<link href="{{urlRelative path "/apple-touch-icon.png"}}" rel="apple-touch-icon">\n' +
    '{{/if}}' +
    '{{/if}}' +
    '{{/if}}' +
    '<link href="{{urlRelative path "/_assets/css/wiki.css"}}" rel="stylesheet">\n' +
    // '<link href="{{url}}" rel="canonical">\n' +
    '<link href="{{file}}" rel="alternate" title="Markdown" type="text/markdown">\n' +
    '{{#if css}}' +
    '{{#each css}}' +
    '<link href="{{urlRelative ../path this}}" rel="stylesheet" type="text/css">\n' +
    '{{/each}}' +
    '{{/if}}' +
    '{{#if stylesheet}}' +
    '{{#each stylesheet}}' +
    '<link href="{{urlRelative ../path this}}" rel="stylesheet" type="text/css">\n' +
    '{{/each}}' +
    '{{/if}}' +
    '{{#if js}}' +
    '{{#each js}}' +
    '<script src="{{urlRelative ../path this}}" type="text/javascript"></script>\n' +
    '{{/each}}' +
    '{{/if}}' +
    '{{#if script}}' +
    '{{#each script}}' +
    '<script src="{{urlRelative ../path this}}" type="text/javascript"></script>\n' +
    '{{/each}}' +
    '{{/if}}' +
    '{{#if mathjax}}' +
    '<script type="text/x-mathjax-config">\n' +
    'MathJax.Hub.Config({\n' +
    '  "HTML-CSS": {\n' +
    '    preferredFont: "STIX"\n' +
    '  },\n' +
    '  TeX: {\n' +
    '    equationNumbers: {\n' +
    '      autoNumber: "all"\n' +
    '    }\n' +
    '  }\n' +
    '})\n' +
    '</script>\n' +
    '<script async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>\n' +
    '{{/if}}' +
    '<script src="{{urlRelative path "/_assets/js/wiki.js"}}"></script>\n' +
    '</head>\n' +
    '<body>\n' +
    '{{{content}}}' +
    '</body>\n' +
    '</html>'

// TODO: precompile the templates
module.exports = Handlebars.compile(document)

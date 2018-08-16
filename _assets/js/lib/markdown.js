var $ = require('jquery')
var markdownit = require('markdown-it')
var attr = require('markdown-it-attrs')
var sub = require('markdown-it-sub')
var sup = require('markdown-it-sup')
var footnote = require('markdown-it-footnote')
var figures = require('markdown-it-implicit-figures')
var taskcheckbox = require('markdown-it-task-checkbox')
var deflist = require('markdown-it-deflist')
var emoji = require('markdown-it-emoji')
var mathjax = require('markdown-it-mathjax')
var abbr = require('markdown-it-abbr')
var container = require('markdown-it-container')
var hljs = require('highlight.js')
var _ = require('lodash')
var preprocessor = require('./preprocessor')
var Reference = require('./reference')
var abbrev = require('./abbrev')
var util = require('./util')

function markdown (str, opts) {
  str = preprocessor(str)
  opts = markdown.options(opts)
  var md = markdown.md
  if (opts && !_.isEmpty(opts)) {
    md = markdown.parser(opts)
  }
  // ensure that defined references have precedence
  // over wiki references
  var env = markdown.env({
    references: Reference.extractReferencesFromMarkdown(str)
  })
  str = md.render(str, env)
  str = markdown.highlightInline(str).trim()
  if (opts && opts.inline && str.match(/^<p>/) && str.match(/<\/p>$/)) {
    str = str.substring(3, str.length - 4)
  }
  return str
}

markdown.env = function (env) {
  env = env || {}
  env.references = env.references || {}
  env.abbreviations = env.abbreviations || {}
  env.references = _.assign({}, Reference.getReferences(), env.references)
  env.abbreviations = _.assign({}, abbrev.getAbbreviations(), env.abbreviations)
  return env
}

markdown.highlightBlock = function (str, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str, true).value
    } catch (__) { }
  }
  return ''
}

markdown.highlightInline = function (str) {
  return util.dojQuery(str, function (body) {
    body.find('code[class]').each(function () {
      var code = $(this)
      var pre = code.parent()
      if (pre.prop('tagName') === 'PRE') {
        return
      }
      var lang = code.attr('class')
      if (lang && hljs.getLanguage(lang)) {
        try {
          code.removeClass(lang)
          code.addClass('language-' + lang)
          var str = code.text().trim()
          var html = hljs.highlight(lang, str, false).value
          code.html(html)
        } catch (__) { }
      }
    })
  })
}

markdown.defaults = {
  html: true,                 // Enable HTML tags in source
  breaks: true,               // Convert '\n' in paragraphs into <br>
  linkify: true,              // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  typographer: true,

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externally.
  // If result starts with <pre..., internal wrapper is skipped.
  highlight: markdown.highlightBlock
}

markdown.options = function (opts) {
  opts = opts || {}
  var options = {}
  if (opts.hasOwnProperty('hard_line_breaks')) {
    options.breaks = opts.hard_line_breaks
  }
  if (opts.hasOwnProperty('breaks')) {
    options.breaks = opts.breaks
  }
  if (opts.hasOwnProperty('autolink_bare_uris')) {
    options.linkify = opts.autolink_bare_uris
  }
  if (opts.hasOwnProperty('linkify')) {
    options.linkify = opts.linkify
  }
  if (opts.hasOwnProperty('smart')) {
    options.typographer = opts.smart
  }
  if (opts.hasOwnProperty('typographer')) {
    options.typographer = opts.typographer
  }
  if (opts.hasOwnProperty('emoji')) {
    options.emoji = opts.emoji
  }
  if (opts.hasOwnProperty('mathjax')) {
    options.mathjax = opts.mathjax
  }
  if (opts.hasOwnProperty('inline')) {
    options.inline = opts.inline
  }
  return options
}

markdown.parser = function (opts) {
  opts = opts || {}
  opts = $.extend({}, markdown.defaults, opts)
  return markdown.plugins(markdownit(opts), opts)
}

markdown.plugins = function (md, opts) {
  opts = opts || {}
  md = md.use(figures, {figcaption: true})
  if (opts.mathjax !== true) {
    md = md.use(attr)
  }
  md = md.use(sub)
    .use(sup)
    .use(footnote)
    .use(taskcheckbox, {disabled: false})
    .use(deflist)
  md = markdown.containerPlugin(md)
  if (opts.emoji !== false) {
    md = md.use(emoji)
    md.renderer.rules.emoji = function (token, idx) {
      return '<span class="emoji emoji_' + token[idx].markup + '">' + token[idx].content + '</span>'
    }
  }
  if (opts.mathjax === true) {
    md = md.use(mathjax())
  }
  md = md.use(abbr)
  return md
}

markdown.containerPlugin = function (md) {
  var renderContainer = function (bsClass, title) {
    return function (tokens, idx) {
      var info = tokens[idx].info.trim()
      bsClass = bsClass || info.toLowerCase()
      title = title || _.capitalize(info)
      var isOpeningTag = tokens[idx].nesting === 1
      if (isOpeningTag) {
        return '<div class="bs-callout bs-callout-' + bsClass + '"><h4>' + title + '</h4>\n'
      } else {
        return '</div>\n'
      }
    }
  }
  return md.use(container, 'default', { render: renderContainer() })
    .use(container, 'primary', { render: renderContainer() })
    .use(container, 'success', { render: renderContainer() })
    .use(container, 'info', { render: renderContainer() })
    .use(container, 'warning', { render: renderContainer() })
    .use(container, 'danger', { render: renderContainer() })
    .use(container, 'viktig', { render: renderContainer('warning') })
    .use(container, 'advarsel', { render: renderContainer('danger') })
    .use(container, 'note', { render: renderContainer('info') })
}

markdown.inline = function (str) {
  return markdown(str, {inline: true})
}

markdown.toText = function (str) {
  var html = markdown.inline(str)
  return util.htmlToText(html)
}

markdown.md = markdown.parser()

module.exports = markdown

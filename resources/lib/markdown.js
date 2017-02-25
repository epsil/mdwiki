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
var hljs = require('highlight.js')
var abbrev = require('./abbrev')
var references = require('./references')
var util = require('./util')

function markdown (str, inline) {
  str += '\n\n'
  str += references
  str += '\n\n'
  str += abbrev
  str = markdown.md.render(str)
  str = markdown.highlightInline(str).trim()
  if (inline && str.match(/^<p>/) && str.match(/<\/p>$/)) {
    str = str.substring(3, str.length - 4)
  }
  return str
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

markdown.md = markdownit({
  html: true,
  typographer: true,
  highlight: markdown.highlightBlock
}).use(figures, {figcaption: true})
  .use(attr)
  .use(sub)
  .use(sup)
  .use(footnote)
  .use(taskcheckbox)
  .use(deflist)
  .use(emoji)
  .use(mathjax)
  .use(abbr)

markdown.inline = function (str) {
  return markdown(str, true)
}

markdown.toText = function (str) {
  var html = markdown.inline(str)
  return util.htmlToText(html)
}

module.exports = markdown

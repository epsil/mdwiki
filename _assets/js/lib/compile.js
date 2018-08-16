var $ = require('jquery')
var settings = require('../json/settings.json')
var matter = require('gray-matter')
var markdown = require('./markdown')
var md5 = require('md5')
var social = require('./social')
var typogr = require('typogr')
var util = require('./util')
var URI = require('urijs')
var document = require('../templates/document')
var body = require('../templates/body')
var index = require('../templates/index')

function parse (data) {
  // Allow the initial '---' to be omitted.
  // Note: this hack does not allow the block
  // to contain blank lines, although YAML
  // does support such expressions!
  if (!data.match(/^---/) &&
      data.match(/^([\s\S]*)[\r\n]+---/)) {
    data = '---\n' + data
  }
  var view = matter(data)
  var props = view.data
  $.extend(view, props)
  view.content = markdown(view.content, view)
  return view
}

function addArrays (view) {
  if (view.css && !Array.isArray(view.css)) {
    view.css = [view.css]
  }
  if (view.stylesheet && !Array.isArray(view.stylesheet)) {
    view.stylesheet = [view.stylesheet]
  }
  if (view.js && !Array.isArray(view.js)) {
    view.js = [view.js]
  }
  if (view.script && !Array.isArray(view.script)) {
    view.script = [view.script]
  }
  return view
}

function addI18n (view) {
  if (view.lang === undefined || view.lang === '' ||
      settings[view.lang] === undefined) {
    view.lang = 'no'
  }
  return $.extend({}, settings[view.lang], view)
}

function dynamic (view, path) {
  view = $.extend({
    'bitbucket': social.bitbucket.url(path),
    'bitbucket-history': social.bitbucket.history.url(path),
    facebook: social.facebook.url(path),
    'github': social.github.url(path),
    'github-edit': social.github.edit.url(path),
    'github-history': social.github.history.url(path),
    'github-raw': social.github.raw.url(path),
    linkedin: social.linkedin.url(path),
    twitter: social.twitter.url(path),
    mail: social.mail.url(path)
  }, view)
  if (view.toc !== false) {
    view.toc = '<div id="toc-placeholder"></div>'
  }
  // if (view.content.match(/[\\][(]/g)) {
  //   view.mathjax = true
  // }
  if (view.mathjax) {
    // typogr.js doesn't work well with MathJax
    // https://github.com/ekalinin/typogr.js/issues/31
    view.typogr = false
  }
  return view
}

function title (view) {
  if (view.title === undefined || view.title === '') {
    view.content = util.dojQuery(view.content, function (body) {
      var heading = body.find('h1').first()
      if (heading.length > 0) {
        view.title = heading.removeAriaHidden().html().trim()
        heading.remove()
      }
    })
  }
  return view
}

function footnotes (view) {
  if (view.sidenotes === undefined) {
    view.sidenotes = true
  }
  if (view.footnotes === undefined || view.footnotes === '') {
    view.content = util.dojQuery(view.content, function (body) {
      var section = body.find('section.footnotes').first()
      if (section.length > 0) {
        var hr = body.find('hr.footnotes-sep')
        view.footnotes = section.html().trim()
        section.remove()
        hr.remove()
      }
    })
  }
  return view
}

function toc (view) {
  if (view.toc !== false) {
    view.content = util.dojQuery(view.content, function (body) {
      var placeholder = body.find('#toc-placeholder')
      var content = body.find('.e-content')
      view.toc = content.tableOfContents()
      if (view.toc !== '') {
        placeholder.replaceWith(view.toc)
      }
    })
  }
  return view
}

function typography (view) {
  if (view.typogr) {
    // typogr.js doesn't understand unescaped quotation marks
    view.content =
      view.content.replace(/\u2018/gi, '&#8216;')
      .replace(/\u2019/gi, '&#8217;')
      .replace(/\u201c/gi, '&#8220;')
      .replace(/\u201d/gi, '&#8221;')
    // FIXME: this belongs in util.js
      .replace(/&#8220;&#8216;/gi, '&#8220;&nbsp;&#8216;')
      .replace(/&#8216;&#8220;/gi, '&#8216;&nbsp;&#8220;')
    view.content = typogrify(view.content)
  }
  return view
}

function typogrify (text) {
  text = typogr.amp(text)
  // text = typogr.widont(text)
  text = typogr.smartypants(text)
  text = typogr.caps(text)
  text = typogr.initQuotes(text)
  text = typogr.ord(text)
  return text
}

function links (view, path) {
  view.content = util.dojQuery(view.content, function (body) {
    body.addRelativeLinks(path)
  })
  return view
}

function compile (data, path) {
  var file = URI(path).filename()
  if (file === '') {
    file = 'index.md'
  }

  var view = $.extend({}, settings, {
    file: file,
    path: path,
    url: path
  })

  data = data.trim()
  if (data === '') {
    return index(view)
  }

  view = $.extend(view, parse(data), {
    md5: md5(data)
  })

  view = addArrays(view)
  view = addI18n(view)
  view = dynamic(view, path)
  view = title(view)
  view = footnotes(view)

  if (view.content !== '') {
    if (view.plain) {
      view.content = '<section>' + view.content + '</section>'
    }
    view.content = body(view)
  }

  view = toc(view)
  view = typography(view)
  view = links(view, path)

  if (view.plain) {
    view.content = util.processSimple(view.content)
  } else {
    view.content = util.process(view.content)
  }

  view.content = document(view)
  return view.content
}

module.exports = compile

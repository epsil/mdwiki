var $ = require('jquery')
var S = require('string')
var URI = require('urijs')

var util = {}

util.isLocalFile = function () {
  return URI(window.location.href).protocol() === 'file'
}

util.isExternalUrl = function (str) {
  return URI(str).host() !== ''
}

util.urlRelative = function (base, href) {
  if (base === undefined || href === undefined ||
      base === '' || href === '') {
    return ''
  }

  if (!href.match(/^\//) ||
      (URI(base).is('relative') && !base.match(/^\//))) {
    return href
  }

  base = URI(base).pathname()
  var uri = new URI(href)
  var relUri = uri.relativeTo(base)
  var result = relUri.toString()
  return (result === '') ? './' : result
}

util.urlResolve = function (base, href) {
  if (base === undefined || href === undefined ||
      base === '' || href === '') {
    return ''
  }

  return URI(href).absoluteTo(base).toString()
}

util.unique = function (fn) {
  var results = []
  return function (arg) {
    var result = fn(arg)
    if (results.indexOf(result.valueOf()) >= 0) {
      var i = 1
      var newresult = ''
      do {
        i++
        newresult = result + '-' + i
      } while (results.indexOf(newresult.valueOf()) >= 0)
      result = newresult
    }
    results.push(result.valueOf())
    return result
  }
}

util.generateId = function (el) {
  return S(el.text().trim()).slugify()
}

util.generateUniqueId = util.unique(util.generateId)

util.dojQuery = function (html, fn) {
  var body = $('<div>')
  body.html(html)
  fn(body)
  return body.html()
}

util.unhideSection = function (section) {
  if (section.prop('tagName') === 'SECTION') {
    var button = section.find('.collapse-button').first()
    var div = section.find('div').first()
    if (div.hasClass('collapse') && !div.hasClass('in')) {
      button.attr('aria-expanded', 'true')
      div.addClass('in')
      div.css({'height': ''})
      div.attr('aria-expanded', 'true')
    }
  }
}

util.unhideElement = function (el) {
  util.unhideSection(el)
  el.parents().each(function (index, value) {
    util.unhideSection($(this))
  })
}

util.addAcronyms = function () {
  return this.map(function () {
    $(this).find('abbr').filter(function () {
      var text = $(this).text().trim()
      return text.toUpperCase() === text
    }).addClass('acronym')
  })
}

util.addHotkeys = function () {
  return this.map(function () {
    var body = $(this)
    body.find('kbd:contains("Ctrl")').replaceWith('<kbd title="Control">Ctrl</kbd>')
    body.find('kbd:contains("Alt")').replaceWith('<kbd title="Alt">Alt</kbd>')
    body.find('kbd:contains("Esc")').replaceWith('<kbd title="Escape">Esc</kbd>')
    body.find('kbd:contains("Enter")').replaceWith('<kbd title="Enter">\u21b5</kbd>')
    body.find('kbd:contains("Tab")').replaceWith('<kbd title="Tab">\u21b9</kbd>')
    body.find('kbd:contains("Windows")').replaceWith('<kbd title="Windows"><i class="fa fa-windows"></i></kbd>')
    body.find('kbd:contains("Shift"), kbd:contains("\u21e7")').replaceWith('<kbd title="Shift">\u21e7</kbd>')
    body.find('kbd:contains("Cmd"), kbd:contains("Command"), kbd:contains("\u2318")').replaceWith('<kbd title="Command">\u2318</kbd>')
    body.find('kbd:contains("Opt"), kbd:contains("Option"), kbd:contains("\u2325")').replaceWith('<kbd title="Option">\u2325</kbd>')
    body.find('kbd:contains("Fn"), kbd:contains("Function")').replaceWith('<kbd title="Function">Fn</kbd>')
    body.find('kbd:contains("PgUp"), kbd:contains("Page Up")').replaceWith('<kbd title="Page Up">PgUp</kbd>')
    body.find('kbd:contains("PgDn"), kbd:contains("Page Down")').replaceWith('<kbd title="Page Down">PgDn</kbd>')
    body.find('kbd:contains("Eject")').replaceWith('<kbd title="Eject">\u23cf</kbd>')
    body.find('kbd:contains("Power")').replaceWith('<kbd title="Power"><i class="fa fa-power-off"></i></kbd>')
    body.find('kbd:contains("Left")').replaceWith('<kbd title="Left">\u2190</kbd>') // \u2b05
    body.find('kbd:contains("Right")').replaceWith('<kbd title="Right">\u2192</kbd>') // \u27a1
    body.find('kbd').filter(function () { return $(this).text().trim() === 'Up' }).replaceWith('<kbd title="Up">\u2191</kbd>') // \u2b06
    body.find('kbd').filter(function () { return $(this).text().trim() === 'Down' }).replaceWith('<kbd title="Down">\u2193</kbd>') // \u2b07
  })
}

util.addPullQuotes = function () {
  return this.map(function () {
    $(this).find('p.pull-quote, blockquote p.left, blockquote p.right').each(function () {
      var p = $(this)
      var blockquote = p.parent()
      if (blockquote.prop('tagName') !== 'BLOCKQUOTE') {
        blockquote = p.wrap('<blockquote>').parent()
      }
      var aside = blockquote.wrap('<aside>').parent()
      aside.addClass(p.attr('class'))
      p.removeAttr('class')
    })
  })
}

util.addSmallCaps = function () {
  return this.map(function () {
    $(this).find('sc').replaceWith(function () {
      var span = $('<span class="caps"></span>')
      span.html($(this).html())
      return span
    })
  })
}

util.addTeXLogos = function () {
  return this.map(function () {
    var body = $(this)
    // cf. http://edward.oconnor.cx/2007/08/tex-poshlet
    // and http://nitens.org/taraborelli/texlogo
    var xe = 'X<span class="xetex-e">&#398;</span>'
    var la = 'L<span class="latex-a">a</span>'
    var tex = 'T<span class="tex-e">e</span>X'
    body.find('abbr[title=XeTeX]').html(xe + tex)
    body.find('abbr[title=LaTeX]').html(la + tex)
    body.find('abbr[title=LuaTeX]').html('Lua' + tex)
    body.find('abbr[title=ConTeXt]').html('Con' + tex + 't')
    body.find('abbr[title=AUCTeX]').html('AUC' + tex)
    body.find('abbr[title=MiKTeX]').html('MiK' + tex)
    body.find('abbr[title=PCTeX]').html('PC' + tex)
    body.find('abbr[title=MacTeX]').html('Mac' + tex)
    body.find('abbr[title=lhs2TeX]').html('lhs2' + tex)
    body.find('abbr[title=TeX]').html(tex)
  })
}

util.addRelativeLinks = function (path) {
  return this.each(function () {
    $(this).find('a[href]').each(function () {
      var href = $(this).attr('href')
      href = util.urlRelative(path, href)
      $(this).attr('href', href)
    })
  })
}

util.fixBlockquotes = function () {
  return this.each(function () {
    $(this).find('blockquote > p:last-child').each(function () {
      var p = $(this)
      if (p.text().trim().match(/^[\u2013\u2014]/)) {
        p.find('em, i').replaceWith(function () {
          return $('<cite>' + $(this).html() + '</cite>')
        })
        var html = p.html().substr(1)
        var footer = $('<footer>' + html + '</footer>')
        p.replaceWith(footer)
      }
    })
  })
}

util.fixCenteredText = function () {
  return this.map(function () {
    $(this).find('center').replaceWith(function () {
      var p = $('<p class="text-center">')
      p.html($(this).html())
      return p
    })
  })
}

util.fixFootnotes = function () {
  return this.each(function () {
    var body = $(this)
    body.find('.footnote-ref a').each(function () {
      var link = $(this)
      var sup = link.parent()
      var p = sup.parent()
      var id = link.attr('href').replace(/:.*/, '')
      link.attr('href', id)
      var note = body.find(id)
      var backref = note.find('.footnote-backref')
      var text = note.text().trim().replace(/(\s*\u21a9.*\s*)+$/, '')
      var source = p.text().trim()
      link.attr('title', text)
      backref.attr('title', source)
    })
  })
}

util.fixMarks = function () {
  return this.each(function () {
    var body = $(this)
    body.find('mark').each(function () {
      var mark = $(this)
      mark.addClass('mark')
      if (!mark.is('[title]')) {
        mark.attr('title', 'Highlight')
      }
    })
  })
}

util.fixLinks = function () {
  return this.each(function () {
    var body = $(this)
    // fix internal links
    body.find('a[href^="#"]').each(function () {
      var link = $(this)
      var href = link.attr('href').replace(':', '\\:')
      var title = link.attr('title')
      // ignore aria-hidden anchors
      if (link.attr('aria-hidden') === 'true' || href === '#' ||
          (title !== undefined && title !== '')) {
        return
      }
      var target = body.find(href)
      if (target.length <= 0) {
        return
      }
      // set title attribute to summary of target
      target = target.first()
      var text = target.removeAria().text() || ''
      text = text.trim()
      link.attr('title', text)
    })
    // fix external links
    body.find('a').each(function () {
      var a = $(this)
      var text = a.text() || ''
      text = text.trim()
      var href = a.attr('href') || ''
      href = href.trim()
      if (href === undefined || href === '') {
        // not a link: do nothing
        return
      }
      // add .url class for URL links
      if (text !== '' &&
          text.match(/[a-z]+:\//i) &&
          (text === href ||
           text === decodeURIComponent(href))) {
        a.addClass('url')
      }
      // add index.html to end of link
      if (util.isLocalFile() &&
          !util.isExternalUrl(href) &&
          href.match(/\/$/)) {
        href += 'index.html'
        a.attr('href', href)
      }
      // open external links in a new window
      if (a.hasClass('external') || util.isExternalUrl(href)) {
        // add explanatory tooltip
        var host = URI(href).host().replace(/^www\./, '')
        if (!a.is('[title]')) {
          var str = 'Open ' + host + ' in a new window'
          a.attr('title', str.replace(/[ ]+/g, ' '))
        }
        // set target="_blank"
        a.attr('target', '_blank')
      }
    })
  })
}

util.fixTables = function () {
  return this.each(function () {
    // add Bootstrap classes
    $(this).find('table').each(function () {
      var table = $(this)

      // add Bootstrap classes
      table.addClass('table table-striped table-bordered table-hover')
      // table.wrap('<div class="table-responsive"></div>')

      // remove empty table headers
      table.find('thead').filter(function (i) {
        return $(this).text().trim() === ''
      }).remove()
    })
  })
}

util.fixWidont = function () {
  return this.each(function () {
    $(this).find('.widont').replaceWith('&nbsp;')
  })
}

util.htmlToText = function (html) {
  var div = $('<div>')
  div.html(html)
  return div.text().trim()
}

util.process = function (html) {
  return util.dojQuery(html, function (body) {
    var content = body.find('.e-content')
    if (content.length <= 0) {
      return
    }
    body.fixWidont()
    body.addAcronyms()
    body.addSmallCaps()
    body.addPullQuotes()
    body.fixCenteredText()
    body.fixFigures()
    body.fixMarks()
    body.addPunctuation()
    body.addHotkeys()
    body.addTeXLogos()
    content.addAnchors()
    body.fixBlockquotes()
    content.addCollapsibleSections()
    body.fixFootnotes()
    body.fixTables()
    body.fixLinks()
    content.addSections()
  })
}

util.removeAria = function () {
  return this.map(function () {
    return $(this).clone().removeAriaHidden()
  })
}

util.removeAriaHidden = function () {
  return this.each(function () {
    $(this).find('[aria-hidden="true"]').remove()
  })
}

$.fn.addAcronyms = util.addAcronyms
$.fn.addHotkeys = util.addHotkeys
$.fn.addPullQuotes = util.addPullQuotes
$.fn.addSmallCaps = util.addSmallCaps
$.fn.addTeXLogos = util.addTeXLogos
$.fn.addRelativeLinks = util.addRelativeLinks
$.fn.fixBlockquotes = util.fixBlockquotes
$.fn.fixCenteredText = util.fixCenteredText
$.fn.fixFootnotes = util.fixFootnotes
$.fn.fixMarks = util.fixMarks
$.fn.fixLinks = util.fixLinks
$.fn.fixTables = util.fixTables
$.fn.fixWidont = util.fixWidont
$.fn.removeAria = util.removeAria
$.fn.removeAriaHidden = util.removeAriaHidden

module.exports = util

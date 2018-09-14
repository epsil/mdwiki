/**
 * Better footnotes.
 *
 * TODO:
 *
 * - Smart detection of parent elements (header, table, ...)
 * - Smart insertion (paragraph: before, header: after)
 * - Reusable functions (e.g., of two args: mark and def)
 * - Handle nested footnotes
 */

var $ = require('jquery')

var footnotes = {}

var headingSelector = 'h1, h2, h3, h4, h5, h6'
var listSelector = 'ul, ol, dl'
var tableSelector = 'table'

footnotes.fixFootnotes = function () {
  return this.each(function () {
    var body = $(this)
    body.find('.footnote-ref a').each(function () {
      var a = $(this)
      var html = a.html()
      html = html.replace('[', '<span class="left-bracket">[</span>')
        .replace(']', '<span class="right-bracket">]</span>')
        .replace(/(:)([0-9]+)/, '<span class="suffix-colon">$1</span><span class="suffix-number">$2</span>')
      a.html(html)
      var sup = a.parent()
      var p = sup.parent()
      var id = a.attr('href').replace(/:.*/, '')
      a.attr('href', id)
      var note = body.find(id)
      var backref = note.find('.footnote-backref')
      var text = note.text().trim().replace(/(\s*\u21a9.*\s*)+$/, '')
      var source = p.text().trim()
      a.attr('title', text)
      backref.attr('title', source)
    })
  })
}

footnotes.addSidenotes = function () {
  return this.each(function () {
    var body = $(this)
    body.find('.footnote-ref a').each(function () {
      var a = $(this)
      var sup = a.parent()
      var parent = sup.parent()
      if (sup.parents(tableSelector).length) {
        parent = sup.parents(tableSelector).last()
      } else if (sup.parents(headingSelector).length) {
        parent = sup.parents(headingSelector).last()
      } else if (sup.parents(listSelector).length) {
        parent = sup.parents(listSelector).last()
      }
      var idSelector = a.attr('href')
      var id = idSelector.replace(/^#/, '')
      var note = body.find(idSelector)
      var backref = note.find('.footnote-backref')
      var backrefLi = backref.parent().parent()
      var num = a.clone().attr('href', backref.attr('href'))
          .attr('title', backref.attr('title'))
          .attr('id', id.replace(/^fn/, 'sidenote'))
          .wrap('<sup class="ref-mark">').parent()
      var sidenote = $('<aside class="sidenote">').html(backrefLi.html())
      sidenote.children().first().prepend(num)
      if (parent.is('h1, h2, h3, h4, h5, h6')) {
        sidenote.insertAfter(parent)
      } else {
        sidenote.insertBefore(parent)
      }
    })
    body.find('.footnotes-list, .footnotes-sep').addClass('endnotes')
  })
}

// the following is borrowed from http://gwern.net/
footnotes.footnotetimeout = false

footnotes.setup = function () {
  var footnotelinks = $('.footnote-ref a')
  footnotelinks.off('mouseover', footnotes.footnoteover)
  footnotelinks.off('mouseout', footnotes.footnoteoout)
  footnotelinks.on('mouseover', footnotes.footnoteover)
  footnotelinks.on('mouseout', footnotes.footnoteoout)
}

footnotes.addFootnoteHandlers = function () {
  return this.each(function () {
    var body = $(this)
    body.find('.footnote-ref a').each(function () {
      var a = $(this)
      a.removeAttr('title')
      a.off('mouseover', footnotes.footnoteover)
      a.off('mouseout', footnotes.footnoteoout)
      a.on('mouseover', footnotes.footnoteover)
      a.on('mouseout', footnotes.footnoteoout)
    })
  })
}

footnotes.footnoteover = function () {
  clearTimeout(footnotes.footnotetimeout)
  $('#footnotediv').stop()
  $('#footnotediv').remove()

  var id = $(this).attr('href').substr(1)
  var position = $(this).offset()

  var div = $(document.createElement('div'))
  div.attr('id', 'footnotediv')
  div.bind('mouseover', footnotes.divover)
  div.bind('mouseout', footnotes.footnoteoout)

  var el = document.getElementById(id)
  div.html('<div>' + $(el).html() + '</div>')

  // var body = $('.e-content') || $(document.body)
  var body = $(document.body)
  body.append(div)

  var left = position.left
  if (left + 420 > $(window).width() + $(window).scrollLeft()) {
    left = $(window).width() - 420 + $(window).scrollLeft()
  }
  var top = position.top + 20
  if (top + div.height() > $(window).height() + $(window).scrollTop()) {
    top = position.top - div.height() - 15
  }
  div.css({
    left: left,
    top: top,
    opacity: 1,
    position: 'absolute'
  })
}

footnotes.footnoteoout = function () {
  footnotes.footnotetimeout = setTimeout(function () {
    $('#footnotediv').animate({
      opacity: 0
    }, 600, function () {
      $('#footnotediv').remove()
    })
  }, 100)
}

footnotes.divover = function () {
  clearTimeout(footnotes.footnotetimeout)
  $('#footnotediv').stop()
  $('#footnotediv').css({
    opacity: 1
  })
}

// $(document).ready(function() {
//   footnotes.setup()
// })

$.fn.fixFootnotes = footnotes.fixFootnotes
$.fn.addSidenotes = footnotes.addSidenotes
$.fn.addFootnoteHandlers = footnotes.addFootnoteHandlers

module.exports = footnotes

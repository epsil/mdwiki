/* global jQuery:true */
/* exported jQuery */

/**
 * Collapsible headers, based on Bootstrap's collapse plugin.
 *
 * Invoke with: $('body').addCollapsibleSections()
 *
 * TODO:
 *
 * - Require bootstrap as a dependency: require('bootstrap').
 * - Divide code into HTML pass and JavaScript pass:
 *   HTML pass should add Bootstrap attributes to headers,
 *   JavaScript pass should add click handlers.
 *   (perhaps JS could be replaced with CSS' :before/:after?).
 * - Should the JavaScript pass be performed automatically?
 *   I.e., $(function () { ... }). Or will this cause problems
 *   if the code is used as a Node plugin?
 * - Does the code style of Bootstrap's plugin provide any clues
 *   with regard to best practice?
 * - Add code for collapsible lists.
 * - Make links to collapsed elements auto-expand them
 * - Option like Pandoc's --section-divs
 *   (or does this belong in a plugin of its own?)
 */

var $
$ = $ || require('jquery')
var S = require('string')
jQuery = $ // needed for Bootstrap
require('bootstrap')

var collapse = {}

/**
 * Return unique value
 */
collapse.unique = function (fn) {
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

/**
 * Generate element ID
 */
collapse.generateId = function (el, prefix) {
  prefix = prefix || ''
  return prefix + S(el.text().trim()).slugify()
}

/**
 * Generate unique element ID
 */
collapse.generateUniqueId = collapse.unique(collapse.generateId)

collapse.collapseDoneItems = function (options) {
  return this.each(function () {
    var body = $(this)
    body.find('s + ul.collapse.in, s + ol.collapse.in').each(function () {
      var ul = $(this)
      var button = ul.prevAll('.collapse-button').first()
      ul.removeClass('in')
      button.attr('aria-expanded', 'false')
    })
  })
}

/**
 * Add collapsible sections, lists and click handlers
 */
collapse.addCollapsibility = function (options) {
  return this.each(function () {
    var body = $(this)
    body.addCollapsibleElements()
    body.addCollapsibleHandlers()
  })
}

/**
 * Add collapsible sections and lists
 */
collapse.addCollapsibleElements = function (options) {
  return this.each(function () {
    var body = $(this)
    body.addCollapsibleSections()
    body.addCollapsibleLists()
  })
}

/**
 * Add collapsible click handlers
 */
collapse.addCollapsibleHandlers = function (options) {
  return this.each(function () {
    var body = $(this)
    body.find('.collapse-button').click(function () {
      var button = $(this)
      var id = button.attr('aria-controls')
      var path = window.location.href.replace(/#[^#]*$/i, '')
      var url = path + '#' + id
      var expanded = (button.attr('aria-expanded') === 'true') ? 'false' : 'true'
      if (typeof Storage !== 'undefined') {
        window.localStorage.setItem(url, expanded)
        window.sessionStorage.setItem(url, expanded)
      }
    })
    body.find('.collapse-ellipsis').click(function () {
      var ellipsis = $(this)
      var button = ellipsis.prevAll().filter('.collapse-button').first()
      if (button.length) {
        button.click()
      }
      return false
    })
  })
}

collapse.addLinkHandlers = function (options) {
  return this.each(function () {
    var body = $(this)
    body.find('a[href^="#"]').filter(function () {
      return $(this).attr('aria-hidden') !== 'true'
    }).each(function () {
      var link = $(this)
      var href = link.attr('href').replace(':', '\\:')
      var target = $(href).first()

      if (target.length <= 0) {
        return
      }

      link.click(function (event) {
        collapse.unhideElement(target)
      })
    })
  })
}

/**
 * Add collapsible lists
 */
collapse.addCollapsibleLists = function (options) {
  return this.each(function () {
    var body = $(this)
    body.find('ul > li').addCollapsibleListItem()
  })
}

/**
 * Add collapsible list item
 */
collapse.addCollapsibleListItem = function (options) {
  return this.each(function () {
    var li = $(this)
    var ul = li.find('> ol, > ul').first()
    if (ul.length > 0) {
      var prev = li.clone()
      prev.find('ol, ul').remove()
      var listId = li.attr('id')
      if (!listId) {
        listId = collapse.generateUniqueId(prev)
        li.attr('id', listId + '-item')
      }
      if (prev.text().trim().match(/(\.\.\.|\u2026)$/)) {
        li.addClass('collapse')
        var text = ul[0].previousSibling.nodeValue
        text = text.replace(/\s*(\.\.\.|\u2026)\s*$/, '')
        ul[0].previousSibling.nodeValue = text
      }
      collapse.addButton(li, ul, true, listId + '-list')
      li.append('<a aria-hidden="true" class="collapse-ellipsis" href="#"></a>')
    } else {
      var id = li.attr('id')
      if (!id) {
        id = collapse.generateUniqueId(li)
        li.attr('id', id + '-item')
      }
      // var span = li.wrapInner('<span>').children().first()
      var span = $('<span>')
      li.append(span)
      collapse.addButton(li, span, true)
      li.append(' <a aria-hidden="true" class="collapse-ellipsis" href="#"></a>')
    }
    var list = li.parent()
    if (!list.hasClass('collapse')) {
      list.addClass('collapse in')
    }
  })
}

/**
 * Add collapsible sections
 */
collapse.addCollapsibleSections = function (options) {
  var opts = $.extend({}, collapse.defaults, options)
  return this.each(function () {
    var body = $(this)
    // process innermost sections first
    $.each(['h6', 'h5', 'h4', 'h3', 'h2', 'h1'],
           function (i, el) {
             body.find(el).each(function () {
               // add section
               var header = $(this)
               var section = collapse.addSection(header)

               // skip top-level headers
               if ($.inArray(el, opts.include) < 0) {
                 return
               }

               // add button to header
               collapse.addButton(header, section)
               // add ellipsis to header
               header.append('<a aria-hidden="true" class="collapse-ellipsis" href="#"></a>')
             })
           })
  })
}

/**
 * Add collapsible content for header
 */
collapse.addSection = function (header) {
  // h1 ends at next h1, h2 ends at next h1 or h2,
  // h3 ends at next h1, h2 or h3, and so on
  var stop = []
  var i = parseInt(header.prop('tagName').match(/\d+/)[0])

  for (var j = 1; j <= i; j++) {
    stop.push('h' + j)
  }
  var end = stop.join(', ')
  var section = header.nextUntil(end)
  section = section.wrapAll('<div>').parent()
  collapse.sectionId(header, section)
  return section
}

/**
 * Add button to header
 */
collapse.addButton = function (header, section, prepend, sectionId) {
  // add button
  var id = sectionId
  if (id) {
    section.attr('id', id)
  } else {
    id = collapse.sectionId(header, section)
  }
  var button = collapse.button(id)
  if (prepend) {
    header.prepend(button)
  } else {
    header.append(button)
  }

  // add Bootstrap classes
  section.addClass('collapse in')

  // allow pre-collapsed sections
  var path = window.location.href.replace(/#[^#]*$/i, '')
  var url = path + '#' + id

  if (header.text().trim().match(/(\.\.\.|\u2026)$/)) {
    header.addClass('collapse')
    var html = header.html()
    html = html.replace(/\s*(&nbsp;)*(\.\.\.|\u2026)\s*/g, '')
    header.html(html)
    button = header.find('.collapse-button')
  }
  if (header.hasClass('collapse') ||
      ((typeof Storage !== 'undefined') &&
       (window.localStorage.getItem(url) === 'false'))) {
    header.removeClass('collapse').addClass('collapsed')
  }
  if (header.hasClass('collapsed')) {
    header.removeClass('collapsed')
    if ((typeof Storage !== 'undefined') &&
        (window.sessionStorage.getItem(url) !== 'true')) {
      section.removeClass('in')
      button.attr('aria-expanded', 'false')
    }
  }
}

/**
 * Button
 */
collapse.button = function (id) {
  return $('<a aria-hidden="true" aria-expanded="true" role="button" class="collapse-button" data-toggle="collapse" href="#' + id + '" aria-controls="' + id + '"></a>')
}

/**
 * Header ID (add if missing)
 */
collapse.headerId = function (header) {
  var id = header.attr('id')
  if (id === undefined || id === '') {
    id = collapse.generateUniqueId(header)
    header.attr('id', id)
  }
  return id
}

/**
 * Section ID (based on header ID)
 */
collapse.sectionId = function (header, section) {
  var id = section.attr('id')
  if (id === undefined || id === '') {
    var headerId = collapse.headerId(header)
    id = headerId ? headerId + '-section' : ''
    section.attr('id', id)
  }
  return id
}

collapse.unhideSection = function (section) {
  if (section.prop('tagName') === 'SECTION') {
    var button = section.find('.collapse-button').first()
    var id = button.attr('href')
    var div = section.find(id).first()
    var path = window.location.href.replace(/#[^#]*$/i, '')
    var url = path + id
    if (div.hasClass('collapse') && !div.hasClass('in')) {
      button.attr('aria-expanded', 'true')
      div.addClass('in')
      div.css({'height': ''})
      div.attr('aria-expanded', 'true')
      if (typeof Storage !== 'undefined') {
        window.localStorage.setItem(url, true)
        window.sessionStorage.setItem(url, true)
      }
    }
  }
}

collapse.unhideElement = function (el) {
  collapse.unhideSection(el)
  el.parents().each(function (index, value) {
    collapse.unhideSection($(this))
  })
}

/**
 * Default options
 */
collapse.defaults = {
  include: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
}

$.fn.collapseDoneItems = collapse.collapseDoneItems
$.fn.addCollapsibility = collapse.addCollapsibility
$.fn.addCollapsibleElements = collapse.addCollapsibleElements
$.fn.addCollapsibleSections = collapse.addCollapsibleSections
$.fn.addCollapsibleLists = collapse.addCollapsibleLists
$.fn.addCollapsibleListItem = collapse.addCollapsibleListItem
$.fn.addCollapsibleHandlers = collapse.addCollapsibleHandlers
$.fn.addLinkHandlers = collapse.addLinkHandlers
$.fn.addCollapsibleSections.addSection = collapse.addSection
$.fn.addCollapsibleSections.addButton = collapse.addButton
$.fn.addCollapsibleSections.button = collapse.button
$.fn.addCollapsibleSections.headerId = collapse.headerId
$.fn.addCollapsibleSections.sectionId = collapse.sectionId
$.fn.addCollapsibleSections.defaults = collapse.defaults

module.exports = collapse

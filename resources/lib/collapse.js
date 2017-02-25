/* global jQuery:true */
/* exported jQuery */

// Collapsible headers, based on Bootstrap's collapse plugin
//
// TODO:
//
// - Require bootstrap as a dependency: require('bootstrap').
// - Divide code into HTML pass and JavaScript pass:
//   HTML pass should add Bootstrap attributes to headers,
//   JavaScript pass should add click handlers.
//   (perhaps JS could be replaced with CSS' :before/:after?).
// - Should the JavaScript pass be performed automatically?
//   I.e., $(function () { ... }). Or will this cause problems
//   if the code is used as a Node plugin?
// - Does the code style of Bootstrap's plugin provide any clues
//   with regard to best practice?
// - Add code for collapsible lists.
// - Make links to collapsed elements auto-expand them
// - Option like Pandoc's --section-divs
//   (or does this belong in a plugin of its own?)

var $ = require('jquery')
var util = require('./util')
jQuery = $ // needed for Bootstrap
require('bootstrap')

var collapse = {}

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
             })
           })
  })
}

// add collapsible content for header
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

// add button to header
collapse.addButton = function (header, section) {
  // add button
  var id = collapse.sectionId(header, section)
  var button = collapse.button(id)
  header.append(button)

  // add Bootstrap classes
  section.addClass('collapse in')

  // allow pre-collapsed sections
  if (header.hasClass('collapse')) {
    header.removeClass('collapse').addClass('collapsed')
  }
  if (header.hasClass('collapsed')) {
    header.removeClass('collapsed')
    section.removeClass('in')
    button.attr('aria-expanded', 'false')
  }
}

// button
collapse.button = function (id) {
  return $('<a aria-hidden="true" aria-expanded="true" role="button" class="collapse-button" data-toggle="collapse" href="#' + id + '" aria-controls="' + id + '"></a>')
}

// header ID (add if missing)
collapse.headerId = function (header) {
  var id = header.attr('id')
  if (id === undefined || id === '') {
    id = util.generateUniqueId(header)
    header.attr('id', id)
  }
  return id
}

// section ID (based on header ID)
collapse.sectionId = function (header, section) {
  var id = section.attr('id')
  if (id === undefined || id === '') {
    var headerId = collapse.headerId(header)
    id = headerId ? headerId + '-section' : ''
    section.attr('id', id)
  }
  return id
}

// Default options
collapse.defaults = {
  include: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
}

$.fn.addCollapsibleSections = collapse.addCollapsibleSections
$.fn.addCollapsibleSections.addSection = collapse.addSection
$.fn.addCollapsibleSections.addButton = collapse.addButton
$.fn.addCollapsibleSections.button = collapse.button
$.fn.addCollapsibleSections.headerId = collapse.headerId
$.fn.addCollapsibleSections.sectionId = collapse.sectionId
$.fn.addCollapsibleSections.defaults = collapse.defaults

module.exports = collapse

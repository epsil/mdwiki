// Semantic sections
//
// Inspired by Pandoc's --section-divs option:
// http://pandoc.org/MANUAL.html#extension-auto_identifiers

var $ = require('jquery')
var util = require('./util')

var section = {}

section.addSections = function () {
  return this.each(function () {
    var body = $(this)
    // process innermost sections first
    $.each(['h6', 'h5', 'h4', 'h3', 'h2', 'h1'],
           function (i, el) {
             body.find(el).each(function () {
               var header = $(this)
               // h1 ends at next h1, h2 ends at next h1 or h2,
               // h3 ends at next h1, h2 or h3, and so on
               var stop = []
               var i = parseInt(header.prop('tagName').match(/\d+/)[0])
               for (var j = 1; j <= i; j++) {
                 stop.push('h' + j)
               }
               var end = stop.join(', ')
               var section = header.nextUntil(end).addBack()
               if (section.length > 1) {
                 section = section.wrapAll('<section>').parent()
                 var id = header.attr('id')
                 if (id === undefined || id === '') {
                   id = util.generateUniqueId(header)
                   header.attr('id', id)
                 }
                 section.attr('id', id)
                 header.removeAttr('id')
               }
             })
           })
    // add missing sections
    var sections = body.find('section')
    if (sections.length <= 0) {
      body.wrapInner('<section>')
    } else {
      sections.each(function (i, el) {
        var section = $(this)
        var prevSection = section.prevUntil('header, h1, h2, h3, h4, h5, h6, section')
        if (prevSection.length > 0) {
          // prevUntil() returns elements in reverse order
          prevSection = prevSection.last().nextUntil(section).addBack()
          prevSection.wrapAll('<section>')
        }
      })
    }
  })
}

$.fn.addSections = section.addSections

module.exports = section

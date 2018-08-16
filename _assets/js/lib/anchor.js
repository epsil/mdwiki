var $ = require('jquery')
var util = require('./util')

var anchor = {}

anchor.addAnchors = function () {
  return this.each(function () {
    $(this).find('h1, h2, h3, h4, h5, h6').each(function () {
      var header = $(this)
      var clone = header.clone()
      clone.find('[aria-hidden="true"]').remove()
      var title = clone.text().trim()

      // generate ID if missing
      var id = header.attr('id')
      if (id === undefined || id === '') {
        id = util.generateUniqueId(header)
        header.attr('id', id)
      }

      // create anchor
      var anchor = $('<a aria-hidden="true" class="header-anchor" href="#' + id + '" title="' + title + '"></a>')

      // add anchor
      header.prepend(anchor)
    })
  })
}

$.fn.addAnchors = anchor.addAnchors

module.exports = anchor

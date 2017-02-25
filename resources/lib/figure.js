var $ = require('jquery')

var figure = {}

figure.fixFigures = function () {
  return this.each(function () {
    $(this).find('p img').each(function () {
      var img = $(this)
      var alt = img.attr('alt')
      var p = img.parent()
      while (p.prop('tagName') !== 'P') {
        p = p.parent()
      }

      if (alt === '') {
        // for images without a caption:
        // replace <p><img></p> with <figure><img></figure>
        if (p.text().trim() === '') {
          var figure = $('<figure>')
          figure.insertBefore(p)
          figure.html(p.html())
          img = figure.find('img')
          p.remove()

          if (img.length === 1) {
            figure.addClass(img.attr('class'))
            img.removeAttr('class')
          }

          // if (p.find('img').length === 1) {
          //   var pclass = (p.attr('class') || '').trim()
          //   if (pclass !== '') {
          //     img.addClass(pclass)
          //   } else {
          //     console.log(p.prop('outerHTML'))
          //     img.addClass('center')
          //   }
          //   if (p.is('[width]')) {
          //     img.attr('width', p.attr('width'))
          //   }
          //   img.insertBefore(p)
          //   if (p.is(':empty')) {
          //     p.remove()
          //   }
          // } else {
          //   console.log(p.prop('outerHTML'))
          //   p.addClass('center')
          // }
        }
      } else {
        // for images with a caption:
        // create <figure> with <figcaption>

        var div = $('<figure></figure>')
        var caption = $('<figcaption>' + alt + '</figcaption>')
        div.append(img)
        div.append(caption)

        // add classes
        div.addClass(img.attr('class'))
        img.removeAttr('class')

        // move ID
        if (img.is('[id]')) {
          var id = img.attr('id')
          div.attr('id', id)
          img.removeAttr('id')
        }

        if (img.is('[width]')) {
          var width = parseInt(img.attr('width'))
          div.css('width', (width + 9) + 'px')
        }

        // insert into DOM
        div.insertBefore(p)
        if (p.is(':empty')) {
          p.remove()
        }
      }
    })
  })
}

$.fn.fixFigures = figure.fixFigures

module.exports = figure

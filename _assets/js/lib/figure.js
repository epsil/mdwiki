var $ = require('jquery')

var figure = {}

figure.fixFigures = function () {
  return this.each(function () {
    $(this).find('figure > img').each(setClassesOnContainer)
    $(this).find('p img').each(createFigures)
    $(this).find('a > img').each(addImageLinkClass)
  })
}

function setClassesOnContainer () {
  var img = $(this)
  var figure = findImageFigure(img)
  moveAttributes(img, figure)
  addLink(img)
}

function createFigures () {
  var img = $(this)
  if (hasCaption(img)) {
    createCaptionedFigure(img)
  } else {
    createUncaptionedFigure(img)
  }
}

function addImageLinkClass () {
  var img = $(this)
  var a = img.parent()
  a.addClass('image')
}

// replace <p><img></p> with <figure><img></figure>
function createUncaptionedFigure (img) {
  var p = findImageParagraph(img)
  var isSingleImage = p.find('img').length === 1
  if (isEmptyParagraph(p) && isSingleImage) {
    var figure = $('<figure>')
    figure.insertBefore(p)
    figure.html(p.html())
    img = figure.find('img')
    p.remove()
    if (img.length === 1) {
      moveAttr('class', img, figure)
    }
  }
}

// create <figure> with <figcaption>
function createCaptionedFigure (img) {
  var p = findImageParagraph(img)
  var alt = img.attr('alt')
  var div = $('<figure></figure>')
  var caption = $('<figcaption>' + alt + '</figcaption>')
  div.append(img)
  div.append(caption)
  moveAttributes(img, figure)
  addLink(img)
  // insert into DOM
  div.insertBefore(p)
  if (isEmptyParagraph(p)) {
    p.remove()
  }
}

function fileName (url) {
  var segments = url.trim().split('/')
  var last = segments[segments.length - 1]
  return last
}

function moveAttributes (img, figure) {
  moveAttr('class', img, figure)
  moveAttr('id', img, figure)
  moveWidth(img, figure)
}

function moveAttr (attr, from, to) {
  if (from.is('[' + attr + ']')) {
    to.attr(attr, from.attr(attr))
    from.removeAttr(attr)
  }
}

function moveWidth (img, figure) {
  if (img.is('[width]')) {
    var width = parseInt(img.attr('width'))
    figure.css('width', (width + 9) + 'px')
  }
}

function addLink (img) {
  var hasLink = img.parents('a').length > 0
  if (!hasLink) {
    img.wrap('<a href="' + img.attr('src') +
             '" title="View ' +
             fileName(img.attr('src')) +
             ' in full screen"></a>')
  }
}

function findImageParagraph (img) {
  return findParent(img, 'p')
}

function findImageFigure (img) {
  return findParent(img, 'figure')
}

function findParent (el, name) {
  name = name.toUpperCase()
  var parent = el.parent()
  while (parent.prop('tagName') !== name) {
    parent = parent.parent()
  }
  return parent
}

function hasCaption (img) {
  var alt = img.attr('alt') || ''
  return alt.trim() !== ''
}

function isEmptyParagraph (p) {
  return p.text().trim() === ''
}

$.fn.fixFigures = figure.fixFigures

module.exports = figure

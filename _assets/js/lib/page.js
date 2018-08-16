var $ = require('jquery')
var URI = require('urijs')

var page = {}

page.jsPath = '/_assets/js/wiki.js'
page.cssPath = '/_assets/css/wiki.css'

page.root = function () {
  var href = window.location.href
  var script = $('script[src*="wiki"]')
  var src = script.attr('src')
  href = href.replace(/[^/]*.html?$/i, '')
  src = src.replace(page.jsPath.replace(/^\//, ''), '')
  src = URI(src).absoluteTo(href).toString()
  return src
}

// address of current page
page.path = function () {
  var base = page.root()
  var href = window.location.href
  href = href.replace(/[^/]*.html?$/i, '')
  return '/' + href.replace(base, '')
}

module.exports = page

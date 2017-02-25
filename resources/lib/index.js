/* global MathJax */
var $ = require('jquery')
var URI = require('urijs')
var md5 = require('md5')
var compile = require('./compile')
var util = require('./util')

// TODO: the compiler should be required contingently as a chunk
// (webpack?). There is no need to load it unless we are going to
// regenerate the page because the MD5 checksum has changed.

var jsPath = 'resources/js/markdown-template.js'

function root () {
  var href = window.location.href
  var script = $('script[src*="markdown-template"]')
  var src = script.attr('src')
  href = href.replace(/[^\/]*.html?$/i, '')
  src = src.replace(jsPath, '')
  src = URI(src).absoluteTo(href).toString()
  return src
}

// address of current page
function path () {
  var base = root()
  var href = window.location.href
  href = href.replace(/[^\/]*.html?$/i, '')
  return '/' + href.replace(base, '')
}

// enable MathJax rendering
function typeset (document) {
  addClickHandlers()
  MathJax.Hub.Queue(['Typeset', MathJax.Hub])
  return document
}

function addClickHandlers () {
  // expand closed sections
  $('a[href^="#"]').filter(function () {
    return $(this).attr('aria-hidden') !== 'true'
  }).each(function () {
    var link = $(this)
    var href = link.attr('href').replace(':', '\\:')
    var target = $(href).first()

    if (target.length <= 0) {
      return
    }

    link.click(function (event) {
      util.unhideElement(target)
    })
  })
  // close table of contents
  $('#toc a[title]').each(function () {
    var link = $(this)
    link.click(function (event) {
      $('#toc-button').click()
    })
  })
}

// replace <body> with HTML converted from Markdown
function convert (data) {
  var head = $('head')
  var body = $('body')
  data = data.trim()

  var checksum = head.find('meta[name=md5]').first()
  if (checksum.length > 0 &&
      checksum.attr('content') === md5(data)) {
    // the source hasn't changed since it was last converted to HTML,
    // so no need to convert it again
    return $('html')
  }

  // the source has changed: regenerate the HTML
  var html = compile(data, path())

  // browser strips <html>, <head> and <body> tags
  html = html.replace('<head>', '<div class="head">')
             .replace('</head>', '</div>')
             .replace('<body>', '<div class="body">')
             .replace('</body>', '</div>')
  var doc = $('<div>').html(html)
  var headDiv = doc.find('div.head')
  headDiv.find('link').appendTo(head)
  headDiv.find('title').each(function () {
    head.find('title').text($(this).text())
  })
  var bodyDiv = doc.find('div.body')
  body.html(bodyDiv.html())
  head.append('<meta content="1" name="updated">')
  return $('html')
}

// read contents of <iframe>
function loadIframe (iframe) {
  var deferred = $.Deferred()
  var file = iframe.attr('src')
  if (!file.match(/\.txt$/)) {
    return loadAjax(iframe)
  }
  iframe.hide()
  iframe.on('load', function () {
    var contents = iframe.contents().text().trim()
    var div = $('<div style="display: none">')
    div.text(contents)
    div.insertBefore(iframe)
    iframe.remove()
    var data = div.text().trim()
    deferred.resolve(data)
  })
  return deferred.promise()
}

// read contents of file
function loadFile (file) {
  var deferred = $.Deferred()
  $.get(file, function (data) {
    deferred.resolve(data)
  }, 'text')
  return deferred.promise()
}

/* eslint-disable no-unused-vars */
function loadAjax (iframe) {
  var deferred = $.Deferred()
  iframe.hide()
  var src = iframe.attr('src')
  var div = $('<div style="display: none">')
  div.insertBefore(iframe)
  iframe.remove()
  loadFile(src).then(function (data) {
    div.text(data)
    deferred.resolve(data)
  })
  return deferred.promise()
}

// read Markdown from <iframe> or file and
// insert the converted HTML into the document
function loadData () {
  var file = URI(window.location.href).filename().replace(/\.html$/, '.txt') || 'index.txt'

  // Markdown has already been loaded once
  var meta = $('meta[name=updated]')
  if (meta.length > 0) {
    return
  }

  var iframe = $('iframe[type="text/markdown"]').first()
  if (iframe.length > 0) {
    // <body> contains <iframe src="index.txt">:
    // replace <iframe> with its converted contents
    loadIframe(iframe).then(convert).then(typeset)
  } else {
    // <body> contains no <iframe>: get file from <link> element
    // (or default to index.txt)
    var link = $('link[type="text/markdown"]')
    if (link.length > 0) {
      file = link.attr('href')
    }
    // replace <body> with converted data from file
    // loadFile(file).then(convert).then(process).then(typeset)
    loadFile(file).then(convert).then(typeset)
  }
}

$(function () {
  loadData()
  // alert('url: ' + url())
  // alert('path: ' + path())
})

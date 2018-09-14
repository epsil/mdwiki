/* global $:true, jQuery:true, MathJax */
/* exported $, jQuery */
$ = require('jquery')
jQuery = $
require('datatables')()
var URI = require('urijs')
var md5 = require('md5')
var openpgp = require('openpgp')
var compile = require('./compile')
var collapse = require('./collapse')
var page = require('./page')
var util = require('./util')
var Reference = require('./reference')

// TODO: the compiler should be required contingently as a chunk
// (webpack?). There is no need to load it unless we are going to
// regenerate the page because the MD5 checksum has changed.

function injectCSS () {
  var css = util.urlRelative(page.path(), page.cssPath)
  var link = $('head').find('link[href="' + css + '"]')
  if (!link.length) {
    $('head').append('<link href="' + css + '" rel="stylesheet">')
  }
}

// enable MathJax rendering
function typeset (document) {
  addClickHandlers()
  moveToHashOnLoad()
  MathJax.Hub.Queue(['Typeset', MathJax.Hub])
  return document
}

function addClickHandlers () {
  $('body').addCollapsibleHandlers()
  // expand closed sections
  $('body').addLinkHandlers()
  $('body').addFootnoteHandlers()
  $('table').filter(function () {
    return $(this).find('thead th').length > 0
  }).DataTable({
    bInfo: false,
    order: [],
    paging: false,
    searching: false
  })
  // close table of contents
  $('#toc a[title]').each(function () {
    var link = $(this)
    link.click(function (event) {
      var button = $('#toc-button')
      button.click()
    })
  })
  $('nav form').on('submit', Reference.searchHandler)
}

function moveToHashOnLoad (hash) {
  moveToHash(hash)
  $(function () {
    moveToHash(hash)
    var hasImages = $('.e-content img').length > 0
    var hasTables = $('.e-content table').length > 0
    var hasDynamicElements = hasImages || hasTables
    if (hasDynamicElements) {
      setTimeout(function () {
        moveToHash(hash)
      }, 500)
    }
  })
}

function moveToHash (hash) {
  hash = hash || window.location.hash
  if (hash) {
    var target = $(hash).first()
    if (target.length) {
      collapse.unhideSection(target)
      scrollToElement(target)
    }
  }
}

function scrollToElement (el, offset, time) {
  offset = offset || -50
  time = time || 0
  $(window).scrollTop(el.offset().top + offset)
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
  var html = compile(data, page.path())

  // browser strips <html>, <head> and <body> tags
  html = html.replace('<head>', '<div class="head">')
    .replace('</head>', '</div>')
    .replace('<body>', '<div class="body">')
    .replace('</body>', '</div>')
  var doc = $('<div>').html(html)
  var bodyDiv = doc.find('div.body')
  body.html(bodyDiv.html())
  var headDiv = doc.find('div.head')
  headDiv.children().each(addToHead)
  var updated = $('<meta content="1" name="updated">')
  addHeadElement(updated)
  return $('html')
}

function addToHead () {
  var el = $(this)
  if (el.prop('tagName') === 'TITLE') {
    addTitle(el)
  } else if (el.attr('rel') === 'icon') {
    addIcon(el)
  } else {
    addHeadElement(el)
  }
}

function addTitle (el) {
  var head = $('head')
  var title = head.find('title').first()
  if (title.length > 0) {
    title.text(el.text())
  } else {
    head.prepend(el)
  }
}

function addIcon (el) {
  var head = $('head')
  head.find('link[rel=icon]').remove()
  head.append(el)
}

function addHeadElement (el) {
  var head = $('head')
  var found = head.children().filter(function () {
    return util.equalsElement($(this), el)
  })
  if (found.length <= 0) {
    head.append(el)
  }
}

function insert (data) {
  return new Promise(function (resolve, reject) {
    if (data.match(/^-+BEGIN PGP MESSAGE/)) {
      addModalDialog()
      $('#passwordPrompt form').on('submit', function () {
        decrypt(data, $('#password').val()).then(function (data) {
          return new Promise(function (resolve, reject) {
            $('#passwordPrompt').modal('hide').on('hidden.bs.modal', function () {
              resolve(data)
            })
          })
        }).then(convert).then(resolve).catch(function (data) {
          $('#password').val('')
          var newFooter = [
            '<div class="modal-footer">',
            '<p class="small text-danger text-center">Invalid password</p>',
            '</div>'
          ].join('\n')
          var footer = $('#passwordPrompt .modal-footer')
          if (footer.length) {
            footer.replaceWith(newFooter)
          } else {
            $('#passwordPrompt .modal-content').append(newFooter)
          }
          reject(data)
        })
        return false
      })
      $('#passwordPrompt').modal('show').on('shown.bs.modal', function () {
        $('#password').focus()
      })
    } else {
      resolve(convert(data))
    }
  })
}

function decrypt (data, password) {
  return openpgp.decrypt({
    message: openpgp.message.readArmored(data), // parse encrypted bytes
    password: password, // decrypt with password
    format: 'utf8'
  }).then(function (plaintext) {
    return plaintext.data
  })
}

function addModalDialog () {
  var modal = [
    // https://getbootstrap.com/docs/3.3/javascript/
    '<div class="modal fade" id="passwordPrompt" tabindex="-1" role="dialog">',
    '<div class="modal-dialog" role="document">',
    '<div class="modal-content text-center">',
    '<div class="modal-header">',
    '<h4 class="modal-title" title="Data is encrypted"><i class="fa fa-lock"></i> Protected data</h4>',
    '</div>',
    '<div class="modal-body">',
    '<form role="form">',
    '<div class="form-group">',
    '<div class="input-group">',
    '<div class="input-group-addon"><i class="fa fa-key" title="Password"></i></div>',
    '<input type="password" class="form-control text-center" id="password" placeholder="Password" style="padding-right: 4em;" title="Enter encryption key" required>',
    '</div>',
    '</div>',
    '<button type="submit" class="btn btn-primary btn-block" title="Unlock data"><i class="fa fa-sign-in"></i> Decrypt</button>',
    '</form>',
    '</div>',
    '</div>',
    '</div>',
    '</div>'
  ].join('\n')
  $('body').prepend(modal)
  $('#passwordPrompt').modal({
    backdrop: 'static',
    keyboard: false
  })
}

// read contents of <iframe>
function loadIframe (iframe) {
  return new Promise(function (resolve, reject) {
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
      resolve(data)
    })
  })
}

// read contents of file
function loadFile (file) {
  return new Promise(function (resolve, reject) {
    $.get({
      url: file,
      success: resolve,
      dataType: 'text',
      cache: false
    }).fail(function () {
      reject(file)
    })
  })
}

function loadFiles (files) {
  var file = files.shift()
  var promise = loadFile(file)
  files.forEach(function (file) {
    promise = promise.catch(function () {
      return loadFile(file)
    })
  })
  return promise
}

/* eslint-disable no-unused-vars */
function loadAjax (iframe) {
  return new Promise(function (resolve, reject) {
    iframe.hide()
    var src = iframe.attr('src')
    var div = $('<div style="display: none">')
    div.insertBefore(iframe)
    iframe.remove()
    loadFile(src).then(function (data) {
      div.text(data)
      resolve(data)
    })
  })
}

// read Markdown from <iframe> or file and
// insert the converted HTML into the document
function loadData () {
  var files = []
  var names = ['index']
  var extensions = ['.md', '.txt', '.md.asc', '.md.gpg', '.asc', '.gpg']

  var filename = URI(window.location.href).filename()
  filename = filename.replace(/\.html$/, '')

  if (filename && filename !== names[0]) {
    names.unshift(filename)
  }

  names.forEach(function (name) {
    extensions.forEach(function (ext) {
      files.push(name + ext)
    })
  })

  // Markdown has already been loaded once
  var meta = $('meta[name=updated]')
  if (meta.length > 0) {
    return
  }

  var iframe = $('iframe[type="text/markdown"]').first()
  if (iframe.length > 0) {
    // <body> contains <iframe src="index.txt">:
    // replace <iframe> with its converted contents
    loadIframe(iframe).then(insert).then(typeset)
  } else {
    // <body> contains no <iframe>: get file from <link> element
    var link = $('link[type="text/markdown"]')
    if (link.length > 0) {
      files.unshift(link.attr('href'))
    }
    // replace <body> with converted data from file
    // loadFile(file).then(insert).then(process).then(typeset)
    loadFiles(files).then(insert).then(typeset)
  }
}

$(function () {
  injectCSS()
  loadData()
})

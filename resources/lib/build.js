#!/usr/bin/env node
/* global document:true, window:true */
var fs = require('fs')
var path = require('path')
var jsdom = require('jsdom').jsdom
document = jsdom()
window = document.defaultView
var matter = require('gray-matter')
var tidy = require('tidy-html5').tidy_html5
var glob = require('glob')
var compile = require('./compile')
var markdown = require('./markdown')

var site = 'http://localhost:8000/'

// simple filename -> URL mapping
function location (file) {
  file = file.substr(0, file.length - path.basename(file).length)
  file = file.replace(/\\/g, '/')
  file = '/' + file
  return file
}

function url (file) {
  file = location(file)
  file = file.replace(/^\//g, '')
  file = site + file
  return file
}

function htmlfile (textfile) {
  return textfile.substr(0, textfile.length - path.extname(textfile).length) + '.html'
}

function format (html) {
  html = tidy(html, {
    'drop-empty-elements': false,
    'indent': false,
    'indent-attributes': false,
    'input-encoding': 'utf8',
    'numeric-entities': true,
    'new-inline-tags': 'math ' +
      'annotation ' +
      'merror ' +
      'mfrac ' +
      'mi ' +
      'mn ' +
      'mo ' +
      'mover ' +
      'mphantom ' +
      'mrow ' +
      'mspace ' +
      'msqrt ' +
      'mstyle ' +
      'msub ' +
      'msubsup ' +
      'msup ' +
      'mtable ' +
      'mtd ' +
      'mtext ' +
      'mtr ' +
      'munder ' +
      'semantics',
    'output-encoding': 'ascii',
    'quiet': true,
    'show-info': false,
    'show-warnings': false,
    'sort-attributes': 'alpha',
    'tidy-mark': false,
    'vertical-space': true,
    'wrap': 0
  })

  // Since UTF-8 is a superset of raw ASCII, we can substitute 'utf-8'
  // for 'us-ascii' as the declared character encoding (a useful
  // safeguard if any non-ASCII characters should somehow make their
  // way into the page). In general, though, we try to keep things as
  // plain as possible by returning raw ASCII in the range 0-127 and
  // using numeric character references for the rest.
  html = html.replace(/\n<\/code>\n<\/pre>/g, '</code>\n</pre>')
             .replace('<meta content="text/html; charset=us-ascii" http-equiv="Content-Type">',
                      '<meta content="text/html; charset=utf-8" http-equiv="Content-Type">')

  return html
}

function convert (input, output) {
  return new Promise(function (resolve, reject) {
    fs.readFile(input, function (err, data) {
      if (err) {
        reject(err)
      } else {
        data = data ? data.toString() : ''
        var html = compile('', url(input))
        html = format(html)
        fs.writeFile(output, html, function (err) {
          if (err) {
            reject(err)
          } else {
            console.log('Converted ' + input + ' to ' + output)
            resolve(html)
          }
        })
      }
    })
  })
}

function metadata (file) {
  var str = fs.readFileSync(file).toString()
  var view = matter(str)
  var data = view.data
  data.title = data.title || ''
  data.path = location(file).trim()
  return data
}

function convertFile (file) {
  return convert(file, htmlfile(file))
}

function references (files) {
  var meta = files.map(metadata).filter(function (entry) {
    return entry.title !== ''
  })
  var refs = meta.map(function (entry) {
    var title = entry.title || ''
    var summary = entry.subtitle || entry.abstract || title
    var path = entry.path
    // TODO: serialize to JSON instead
    title = title.replace(/\\/g, '\\\\')
    title = title.replace(/'/g, "\\'")
    summary = markdown.toText(summary)
    summary = summary.replace(/'/g, "\\'")
    summary = summary.replace(/"/g, '\\\\"')
    return '  \'[' + title + ']: ' + path +
      (summary === '' ? '' : ' "' + summary + '"') + '\\n\''
  })
  return 'module.exports =\n' + refs.join(' +\n')
}

function writeReferences (files) {
  return new Promise(function (resolve, reject) {
    var refs = references(files)
    fs.writeFile('resources/lib/references.js', refs, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(refs)
      }
    })
  })
}

if (process.argv.length > 2) {
  var input = process.argv[2] || 'index.txt'
  var output = process.argv[3] || htmlfile(input)
  convert(input, output)
} else {
  var files = glob.sync('**/index.txt').sort()
  Promise.all(files.map(convertFile)).then(function () {
    writeReferences(files)
  })
}

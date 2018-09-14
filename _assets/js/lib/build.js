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
var _ = require('lodash')
var compile = require('./compile')
var markdown = require('./markdown')
var Reference = require('./reference')
var util = require('./util')
var settings = require('../json/settings.json')

// simple filename -> URL mapping
function location (file) {
  file = file.substr(0, file.length - path.basename(file).length)
  file = file.replace(/\\/g, '/')
  file = '/' + file
  return file.trim()
}

function url (file) {
  file = location(file)
  file = file.replace(/^\//g, '')
  file = settings.url + file
  return file
}

function htmlfile (textfile) {
  textfile = textfile.replace(/\.asc$/i, '')
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
        if (settings.compile) {
          data = data ? data.toString() : ''
        } else {
          data = ''
        }
        var html = compile(data, url(input))
        if (settings.tidy) {
          html = format(html)
        }
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
  // console.log('Reading metadata of ' + file)
  var str = fs.readFileSync(file).toString()
  var isYaml = file.match(/.ya?ml$/gi)
  var isIndex = file.match(/.?index(\.md|\.yml)$/i)
  if (isYaml && !str.match(/^---/)) {
    str = '---\n' + str + '\n---'
  }
  if (!str.match(/^---/) &&
      str.match(/^([\s\S]*)[\r\n]+---/)) {
    str = '---\n' + str
  }
  var view = matter(str)
  var data = view.data
  data.title = data.title || ''
  if (data.path) {
    // do nothing
  } else if (isYaml && !isIndex && !data.file && data.url) {
    data.path = data.url
  } else if (data.file) {
    data.path = location(file) + encodeURIComponent(data.file)
  } else if (isIndex) {
    // FIXME: use settings.index
    data.path = location(file)
  } else {
    data.path = '/' + file.replace(/\.yml$/i, '')
  }
  return data
}

function convertFile (file) {
  return convert(file, htmlfile(file))
}

function makeReferences (files) {
  var meta = files.map(metadata).filter(function (entry) {
    return entry && entry.path && entry.title
  })
  var refs = meta.map(referencesEntries)
  refs = [].concat.apply([], refs) // flatten
  refs = addPathReferences(refs)
  refs = Reference.arrayToDictionary(refs)
  refs = Reference.sortDictionary(refs)
  return util.JSONStringify(refs, null, 2, true)
}

function addPathReferences (refs) {
  var pathRefs = refs.filter(function (ref) {
    return ref.href.match(/\/$/) && !ref.href.match(/^https?:/i)
  })
  pathRefs = pathRefs.map(function (ref) {
    return new Reference(referencePathName(ref.href), ref.href, ref.title, ref.hidden)
  })
  refs = refs.concat(pathRefs)
  return refs
}

function referencesEntries (entry) {
  var path = entry.path
  var title = entry.title
  var summary = entry.title || entry.summary || entry.subtitle || entry.abstract
  // summary = ''
  if (summary) {
    // var render = true
    var render = false
    summary = getSummary(path, title, summary, render)
  }
  var ref = new Reference(title, path, summary, entry.hidden)
  var aliases = referencesAliasEntries(entry, summary)
  var files = referencesFileEntries(entry, summary)
  var bookmarks = referencesBookmarkEntries(entry)
  var refs = [ref].concat(aliases).concat(files).concat(bookmarks)
  console.log('Indexed ' + entry.path)
  return refs
}

function getSummary (path, title, summary, forceRender) {
  return (!forceRender && getCachedSummary(title, path)) || renderSummary(summary)
}

function renderSummary (summary) {
  return summary ? markdown.toText(summary) : ''
}

// FIXME: is caching still necessary now that the code is optimized?
function getCachedSummary (label, href) {
  label = Reference.normalizeLabel(label)
  var ref = Reference.getReference(function (ref) {
    return ref.label === label && ref.href === href
  })
  return (ref && ref.title) || ''
}

function referencesBookmarkEntries (entry) {
  var refs = []
  if (entry.references) {
    entry.references.forEach(function (r) {
      var label = r.title
      var href = util.urlResolve(entry.path, r.url)
      var title = entry.title || r.title
      var ref = new Reference(label, href, title, entry.hidden)
      refs.push(ref)
    })
  }
  return refs
}

function referencesAliasEntries (entry, summary) {
  summary = summary || entry.summary
  var aliases = []
  var punctuationRegexp = /[\s*[!?.;:]+$/i
  var endsWithPunctuation = entry.title.match(punctuationRegexp)
  // if (endsWithPunctuation) {
  //   var simpleTitle = entry.title.replace(punctuationRegexp, '')
  //   var simpleRef = new Reference(simpleTitle, entry.path, summary, entry.hidden)
  //   aliases.push(simpleRef)
  // }
  if (entry.subtitle) {
    var delimiter = endsWithPunctuation ? ' ' : ': '
    var title = entry.title + delimiter + entry.subtitle
    var extraRef = new Reference(title, entry.path, summary, entry.hidden)
    aliases.push(extraRef)
  }
  if (entry.aliases) {
    entry.aliases.map(function (alias) {
      var aliasRef = new Reference(alias, entry.path, summary, entry.hidden)
      aliases.push(aliasRef)
    })
  }
  if (entry.url && entry.url !== entry.path) {
    var urlRef = new Reference(entry.url, entry.path, summary, entry.hidden)
    aliases.push(urlRef)
  }
  return aliases
}

function referencesFileEntries (entry, summary) {
  summary = summary || entry.summary
  var files = []

  if (entry.file) {
    var fileName = path.basename(entry.file)
    var withoutExt = fileNameWithoutExtension(fileName)
    var withoutDashes = fileNameWithoutDashes(withoutExt)

    files.push(new Reference(fileName, entry.path, summary, entry.hidden))
    files.push(new Reference(withoutExt, entry.path, summary, entry.hidden))
    files.push(new Reference(withoutDashes, entry.path, summary, entry.hidden))
  }

  return files
}

function referencePathName (path) {
  var defaultSegment = 'Index'
  var pathSegments = path.split('/')
  if (!pathSegments) {
    return defaultSegment
  }
  if (path.match(/\/$/)) {
    pathSegments.pop()
  }
  if (!pathSegments) {
    return defaultSegment
  }
  var lastSegment = pathSegments[pathSegments.length - 1]
  lastSegment = lastSegment || defaultSegment
  lastSegment = _.capitalize(lastSegment)
  return lastSegment
}

function fileNameWithoutExtension (file) {
  return path.basename(file, path.extname(file))
}

function fileNameWithoutDashes (file) {
  return file.replace(/[-_]+/g, ' ')
}

function writeReferences (files) {
  return new Promise(function (resolve, reject) {
    var refs = makeReferences(files)
    fs.writeFile('_assets/js/json/references.json', refs, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(refs)
      }
    })
  })
}

function forEachPromise (arr, fn) {
  var result = []
  var ready = Promise.resolve(null)
  arr.forEach(function (entry) {
    ready = ready.then(function () {
      return fn(entry)
    }).then(function (value) {
      result.push(value)
    }).catch(function () { })
  })
  return ready.then(function () {
    return result
  })
}

function buildPromise (files) {
  return forEachPromise(files, convertFile)
}

function referencesPromise (files) {
  return new Promise(function (resolve, reject) {
    var meta = glob.sync('**/*.yml', { dot: true, ignore: 'node_modules/**' }).sort()
    files = files.concat(meta)
    writeReferences(files)
  })
}

function main () {
  if (process.argv.length > 2) {
    var input = process.argv[2] || settings.index
    var output = process.argv[3] || htmlfile(input)
    convert(input, output)
  } else {
    var files = glob.sync('**/' + settings.index).sort()
    var files2 = glob.sync('**/' + settings.index + '.asc').sort()
    files = files.concat(files2)
    buildPromise(files).then(function () {
      return referencesPromise(files)
    })
  }
}

main()

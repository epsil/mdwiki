var stringSimilarity = require('string-similarity')
var page = require('./page')
var sort = require('./sort')
var util = require('./util')
var references = require('../json/references.json')
var URI = require('urijs')
var $ = require('jquery')
var _ = require('lodash')

function Reference (label, href, title, hidden) {
  this.label = label
  this.href = href
  this.title = title
  if (hidden) {
    this.hidden = hidden
  }
}

Reference.addReferenceToDictionary = function (ref, dict, force) {
  var label = Reference.normalizeLabel(ref.label)
  if (!dict[label] || force) {
    ref = Reference.makeUnlabeledReference(ref)
    dict[label] = ref
  }
  return dict
}

Reference.arrayToDictionary = function (arr) {
  var dict = {}
  arr.forEach(function (ref) {
    Reference.addReferenceToDictionary(ref, dict)
  })
  return dict
}

Reference.extractReferencesFromMarkdown = function (md) {
  var dict = {}
  dict = Reference.extractReferenceDefinitionsFromMarkdown(md, dict)
  dict = Reference.extractReferenceAnchorsFromMarkdown(md, dict)
  return dict
}

Reference.extractReferenceDefinitionsFromMarkdown = function (md, dict) {
  dict = dict || {}
  md = md.trim()
  var lines = md.split(/\r?\n/)
  lines.map(function (line) {
    var match = line.match(/^\[([^\]]+)]: (.*?)( "(.*)")?$/i)
    var isFootnote = match && match[1].match(/^\^/)
    if (match && !isFootnote) {
      var ref = new Reference(match[1], match[2], match[4])
      dict = Reference.addReferenceToDictionary(ref, dict)
    }
  })
  return dict
}

Reference.extractReferenceAnchorsFromMarkdown = function (md, dict) {
  dict = dict || {}
  md = md.trim()
  var regexp = /\[(([^#\]]+)(#[^#\]]+))]/gi
  var matches
  while ((matches = regexp.exec(md)) !== null) {
    var label = matches[1]
    var title = matches[2]
    var anchor = matches[3]
    var ref = Reference.getReference(title)
    if (ref) {
      var href = util.urlWithoutAnchor(ref.href) + anchor
      ref = new Reference(label, href, ref.title)
      dict = Reference.addReferenceToDictionary(ref, dict)
    }
  }
  return dict
}

Reference.forEach = function (dict, fn) {
  for (var label in dict) {
    fn(Reference.makeLabeledReference(label, dict[label]))
  }
}

Reference.getReference = function (obj, dict) {
  dict = dict || references
  if (typeof obj === 'string') {
    return Reference.getReferenceByLabel(obj, dict)
  } else {
    return Reference.getReferenceByPredicate(obj, dict)
  }
}

Reference.getReferenceByHref = function (href, dict) {
  dict = dict || references
  return Reference.getReferenceByPredicate(function (ref) {
    return ref.href === href
  }, dict)
}

Reference.getReferenceByLabel = function (label, dict) {
  dict = dict || references
  label = Reference.normalizeLabel(label)
  if (dict[label]) {
    return Reference.makeLabeledReference(label, dict[label])
  } else {
    return null
  }
}

Reference.getReferenceByPredicate = function (pred, dict) {
  dict = dict || references
  for (var label in dict) {
    var ref = Reference.makeLabeledReference(label, dict[label])
    if (pred(ref)) {
      return ref
    }
  }
  return null
}

Reference.getReferencesByPredicate = function (pred, dict) {
  dict = dict || references
  var refs = []
  for (var label in dict) {
    var ref = Reference.makeLabeledReference(label, dict[label])
    if (pred(ref)) {
      refs.push(ref)
    }
  }
  return refs
}

Reference.getReferences = function () {
  return references
}

Reference.dictionaryToArray = function (dict) {
  dict = dict || references
  var arr = []
  Reference.forEach(dict, function (ref) {
    arr.push(ref)
  })
  return arr
}

Reference.makeReference = function (label, href, title) {
  return new Reference(label, href, title)
}

Reference.makeLabeledReference = function (label, ref) {
  ref = Object.assign({}, ref)
  ref.label = label
  return ref
}

Reference.makeUnlabeledReference = function (ref) {
  ref = Object.assign({}, ref)
  delete ref.label
  return ref
}

Reference.normalizeLabel = function (label) {
  return label.trim().replace(/\s+/g, ' ').toUpperCase()
}

Reference.sortDictionary = function (dict) {
  var arr = Reference.dictionaryToArray(dict)
  arr = arr.sort(function (ref1, ref2) {
    return ref1.label < ref2.label ? -1 : (ref1.label > ref2.label ? 1 : 0)
  })
  return Reference.arrayToDictionary(arr)
}

Reference.search = function (str) {
  str = str.toUpperCase()
  if (str === '') {
    return []
  }
  var arr = Reference.dictionaryToArray()
  arr = arr.filter(function (x) {
    return x.hidden !== true
  })
  sort(arr, sort.descending(function (x) {
    var label = x.label.toUpperCase()
    return stringSimilarity.compareTwoStrings(label, str)
  }))
  arr = _.uniqBy(arr, function (x) {
    // return x.href
    return URI(x.href).fragment('').toString()
  })
  arr = _.take(arr, 5)
  // sort(arr, sort.descending(function (x) {
  //   var title = x.title || x.label
  //   title = title.toUpperCase()
  //   return stringSimilarity.compareTwoStrings(title, str)
  // }))
  return arr
}

Reference.searchHandler = function (e) {
  var form = $(this)
  var input = form.find('input')
  var str = input.val()
  str = str.replace(/\s+/gi, ' ').trim()
  var matches = Reference.search(str)
  Reference.updateSearchMatches(matches)
  // input.val('')
  return false
}

Reference.renderSearchMatches = function (matches) {
  if (matches.length === 0) {
    return ''
  } else {
    var counter = 1
    return '<ol>' +
      matches.map(function (match) {
        // if only we had some template syntax like JSX
        // to make this simpler
        var li = $('<li>')
        var a = $('<a>')
        a.attr('accesskey', counter++)
        a.attr('href', match.href)
        a.text(match.title || _.capitalize(match.label))
        li.append(a)
        return li.prop('outerHTML')
      }).join('') +
      '</ol>'
  }
}

Reference.updateSearchMatches = function (matches) {
  var html = Reference.renderSearchMatches(matches)
  var div = Reference.findSearchMatchesContainer()
  div.html(html)
  div.addRelativeLinks(page.path())
  div.fixLinks()
}

Reference.findSearchMatchesContainer = function () {
  var div = $('nav .search').first()
  if (div.length === 0) {
    div = $('<div class="search container-fluid"></div>')
    var container = $('nav .container-fluid').first()
    container.after(div)
  }
  return div
}

// Reference.breadcrumbs = function (path) {
//   var newPathSegments = []
//   var breadcrumbPaths = []
//   path = path.replace(/^\//, '')
//              .replace(/\/$/, '')
//   var pathSegments = path.split('/')
//   pathSegments.pop()
//   while (pathSegments) { // eslint-disable-line
//     var newSegment = pathSegments.shift()
//     newPathSegments.push(newSegment)
//     var breadcrumbPath = '/' + newSegment.join('/') + '/'
//     breadcrumbPaths.push(breadcrumbPath)
//   }
//   return breadcrumbPaths
// }

// Reference.breadcrumbs2 = function (path) {
//   var breadcrumbPaths = []
//   var matches = []
//   var regexp = /^(.*\/)([/]*\/)$/
//   while ((matches = path.match(regexp))) {
//     path = matches[1]
//     breadcrumbPaths.unshift(path)
//   }
//   return breadcrumbPaths
// }

// better approach: get all references first,
// THEN render
//
// alternate approach: getReferencesByHref(... regexp ...)

Reference.breadcrumbRefs = function (path) {
  var refs = Reference.getReferencesByPredicate(function (ref) {
    return path !== ref.href && path.startsWith(ref.href)
  })
  sort(refs, sort.ascending(function (ref) {
    return ref.href
  }))
  return refs
}

Reference.subPageRefs = function (path) {
  var refs = Reference.getReferencesByPredicate(function (ref) {
    return path !== ref.href && ref.href.startsWith(path)
  })
  sort(refs, sort.ascending(function (ref) {
    return ref.href
  }))
  return refs
}

// move this into the page template as a Handlebars helper?
Reference.renderBreadcrumbs = function (path) {
  var breadcrumbRefs = Reference.breadcrumbRefs(path)
  return Reference.renderLinkList(breadcrumbRefs)
}

Reference.renderSubPages = function (path) {
  var subPageRefs = Reference.subPageRefs(path)
  return Reference.renderLinkList(subPageRefs)
}

Reference.renderLinkList = function (refs, ordered) {
  var lis = refs.map(function (ref) {
    var li = $('<li>')
    var a = $('<a>')
    a.attr('href', ref.href)
    a.text(ref.title)
    li.append(a)
    return li.prop('outerHTML')
  }).join('')
  return ordered ? ('<ol>' + lis + '</ol>') : ('<ul>' + lis + '</ul>')
}

module.exports = Reference

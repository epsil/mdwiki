var header = require('../json/header.json')
var footer = require('../json/footer.json')

// markdown-it-attrs kludge
function escapeCurlyBraces (str) {
  // return str.replace(/^{{(.*)}}$/gm, '&#123;&#123;$1&#125;&#125;')
  return str.replace(/^{{(.*)}}$/gm, '{{$1}}\\')
}

function makePhoneLinks (str) {
  return str.replace(/<(\+?[-\s0-9]+)>/gi, function (match, num) {
    num = num.trim()
    var digits = num.replace(/[-\s]/gi, '')
    var link = '[' + num + '](tel:' + digits + ' "Call ' + num + '")'
    return link
  })
}

function preprocessor (str) {
  // remove whitespace
  str = str.trim()
  // escape curly braces
  str = escapeCurlyBraces(str)
  // make phone links
  str = makePhoneLinks(str)
  // add header and footer
  str = header + '\n\n' + str + '\n\n' + footer
  return str.trim()
}

module.exports = preprocessor

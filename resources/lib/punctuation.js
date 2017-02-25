var $ = require('jquery')

var punctuation = {}

punctuation.addPunctuation = function () {
  return this.each(function () {
    var root = this
    var node = root.childNodes[0]
    // https://github.com/kellym/smartquotesjs
    while (node !== null) {
      if (node.nodeType === 3 &&
          node.nodeName !== 'CODE' &&
          node.nodeName !== 'PRE' &&
          node.nodeName !== 'TEXTAREA') {
        node.nodeValue = node.nodeValue
          .replace(/([-([«\s]|^)"(\S)/g, '$1\u201c$2') // beginning "
          .replace(/"/g, '\u201d') // ending "
          .replace(/([^0-9])"/g, '$1\u201d') // remaining " at end of word
          .replace(/([0-9])('|\u2019)([0-9])/g, '$1\u2032$3') // prime
          .replace(/([0-9]+)(\s*)x(\s*)([0-9]+)/g, '$1$2\u00d7$3$4') // times
          .replace(/([-([«\u201c\s]|^)('|\u2019)(\S)/g, '$1\u2018$3') // beginning '
          .replace(/'/ig, '\u2019') // ending '
          .replace(/\u2019\u201d/ig, '\u2019\u00a0\u201d') // "'
          .replace(/\u201d\u2019/ig, '\u201d\u00a0\u2019')
          .replace(/\u201c\u2018/ig, '\u201c\u00a0\u2018') // '"
          .replace(/\u2018\u201c/ig, '\u2018\u00a0\u201c')
          // .replace(/((\u2018[^']*)|[a-z])'([^0-9]|$)/ig, '$1\u2019$3') // conjunction's possession
          // .replace(/(\u2018)([0-9]{2}[^\u2019]*)(\u2018([^0-9]|$)|$|\u2019[a-z])/ig, '\u2019$2$3') // abbrev. years like '93
          // .replace(/(\B|^)\u2018(?=([^\u2019]*\u2019\b)*([^\u2019\u2018]*\W[\u2019\u2018]\b|[^\u2019\u2018]*$))/ig, '$1\u2019') // backwards apostrophe
          .replace(/<-+>/g, '\u2194') // double arrow
          .replace(/<=+>/g, '\u21D4')
          .replace(/-+>/g, '\u2192') // right arrow
          .replace(/=+>/g, '\u21D2')
          .replace(/<-+?/g, '\u2190') // left arrow
          .replace(/<=+/g, '\u21D0')
          .replace(/===/g, '\u2261')
          .replace(/---/g, '\u2014') // em-dashes
          .replace(/--/g, '\u2013') // en-dashes
          .replace(/([0-9])\u2013([0-9])/g, '$1\u2012$2') // figure dash
          .replace(/ - /g, ' \u2013 ')
          .replace(/ -$/gm, ' \u2013')
          .replace(/,-/g, ',\u2013')
          .replace(/\.\.\.\./g, '.\u2026') // ellipsis
          .replace(/\.\.\./g, '\u2026')
          .replace(/!=/g, '\u2260') // not equal
          .replace(/=</g, '\u2264') // less than or equal
          .replace(/>=/g, '\u2265') // more than or equal
          .replace(/'''/g, '\u2034') // triple prime
          .replace(/("|'')/g, '\u2033') // double prime
          .replace(/'/g, '\u2032') // prime
          .replace(/<3/g, '\u2764') // heart
          .replace(/!! :\)/g, '\u203c\u032e') // smiley
          .replace(/!!/g, '\u203c')
          .replace(/:-\)/g, '\u263a') // smiley
          .replace(/:-\(/g, '\u2639') // frowning smiley
      }
      if (node.hasChildNodes() &&
          node.firstChild.nodeName !== 'CODE' &&
          node.firstChild.nodeName !== 'PRE' &&
          node.firstChild.nodeName !== 'TEXTAREA') {
        node = node.firstChild
      } else {
        do {
          while (node.nextSibling === null && node !== root) {
            node = node.parentNode
          }
          node = node.nextSibling
        } while (node && (node.nodeName === 'CODE' ||
                          node.nodeName === 'PRE' ||
                          node.nodeName === 'SCRIPT' ||
                          node.nodeName === 'TEXTAREA' ||
                          node.nodeName === 'STYLE'))
      }
    }
  })
}

$.fn.addPunctuation = punctuation.addPunctuation

module.exports = punctuation

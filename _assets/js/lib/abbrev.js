var abbr = require('../json/abbrev.json')

var abbrev = {}

abbrev.getAbbreviations = function () {
  return abbr
}

module.exports = abbrev

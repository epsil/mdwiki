var $ = require('jquery')
var URI = require('urijs')

var social = {}

social.bitbucket = function () {
  return social.bitbucket.url(window.location.href)
}

social.bitbucket.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }
  var bitbucket = 'https://bitbucket.org/epsil/wiki/src/HEAD'
  var file = 'index.md'
  return bitbucket + url + file
}

social.bitbucket.resource = function (url) {
  return URI(url).resource()
}

social.bitbucket.path = function (url) {
  return URI(social.bitbucket.resource(url)).relativeTo('/')
           .toString()
           .replace(/#[^\/]*$/, '')
           .replace(/index\.html?$/, '')
           .replace(/\/?$/, '')
}

social.bitbucket.history = function () {
  return social.bitbucket.history.url(window.location.href)
}

social.bitbucket.history.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  var bitbucket = 'https://bitbucket.org/epsil/wiki/history-node/HEAD'
  var file = 'index.md'
  return bitbucket + url + file
}

social.github = function () {
  return social.github.url(window.location.href)
}

social.github.history = function () {
  return social.github.history.url(window.location.href)
}

social.github.history.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  var github = 'https://github.com/epsil/epsil.github.io/commits/master'
  var file = '/index.md'
  var path = social.github.path(url)

  return github + path + file
}

social.github.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  var github = 'https://github.com/epsil/epsil.github.io/edit/master'
  var file = '/index.md'
  var path = social.github.path(url)

  if (path === '') {
    return 'https://github.com/epsil/epsil.github.io/'
  }

  return github + path + file
}

social.github.resource = function (url) {
  return URI(url).resource()
}

social.github.path = function (url) {
  url = URI(social.github.resource(url))
  if (url.is('absolute')) {
    url = url.relativeTo('/')
  }
  url = url.toString()
           .replace(/index\.html?$/, '')
           .replace(/\/?$/, '')
  return url
}

social.mail = function () {
  return social.mail.url(window.location.href)
}

social.mail.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  url = encodeURIComponent(url)
  return 'mailto:?body=' + url
}

social.facebook = function () {
  return social.facebook.url(window.location.href)
}

social.facebook.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  url = encodeURIComponent(url)
  return 'http://www.facebook.com/share.php?u=' + url
}

social.linkedin = function () {
  return social.linkedin.url(window.location.href)
}

social.linkedin.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  url = encodeURIComponent(url)
  return 'http://www.linkedin.com/shareArticle?url=' + url
}

social.twitter = function () {
  return social.twitter.url(window.location.href)
}

social.twitter.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  url = encodeURIComponent(url)
  return 'https://twitter.com/intent/tweet?url=' + url
}

$.fn.bitbucket = social.bitbucket
$.fn.github = social.github
$.fn.mail = social.mail
$.fn.facebook = social.facebook
$.fn.linkedin = social.linkedin
$.fn.twitter = social.twitter

module.exports = social

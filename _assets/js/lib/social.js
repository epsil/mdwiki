var $ = require('jquery')
var URI = require('urijs')
var settings = require('../json/settings.json')

var social = {}

social.bitbucket = function () {
  return social.bitbucket.url(window.location.href)
}

social.bitbucket.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }
  url = url.replace(/#[^#]*$/, '')
  url = url.replace(/index\.html?$/i, '')
  var repo = settings['bitbucket-repo'] || ''
  var bitbucket = 'https://bitbucket.org/' + repo + '/src/HEAD'
  return bitbucket + url + settings.index
}

social.bitbucket.resource = function (url) {
  return URI(url).resource()
}

social.bitbucket.path = function (url) {
  return URI(social.bitbucket.resource(url)).relativeTo('/')
           .toString()
           .replace(/#[^/]*$/, '')
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
  var repo = settings['bitbucket-repo'] || ''
  var bitbucket = 'https://bitbucket.org/' + repo + '/history-node/HEAD'
  return bitbucket + url + settings.index
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

  var repo = settings['github-repo'] || ''
  var github = 'https://github.com/' + repo + '/commits/master'
  var path = social.github.path(url)

  return github + path + '/' + settings.index
}

social.github.edit = function () {
  return social.github.edit.url(window.location.href)
}

social.github.edit.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  var repo = settings['github-repo'] || ''
  var github = 'https://github.com/' + repo + '/edit/master'
  var path = social.github.path(url)

  return github + path + '/' + settings.index
}

social.github.raw = function () {
  return social.github.raw.url(window.location.href)
}

social.github.raw.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  var repo = settings['github-repo'] || ''
  var github = 'https://github.com/' + repo + '/raw/master'
  var path = social.github.path(url)

  return github + path + '/' + settings.index
}

social.github.url = function (url) {
  if (URI(url).protocol() === 'file') {
    return url
  }

  var repo = settings['github-repo'] || ''
  var github = 'https://github.com/' + repo + '/blob/master'
  var path = social.github.path(url)

  return github + path + '/' + settings.index
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

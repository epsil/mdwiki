/* global describe, it */
var $ = require('jquery')
require('../lib/collapse')
require('../lib/social')
require('../lib/figure')
require('../lib/section')
require('../lib/toc')
require('../lib/util')

describe('collapse.js', function () {
  describe('addSection()', function () {
    it('should create a section for a header', function () {
      var div = $('<div><h1 id="header">Header</h1><p>Paragraph one</p><p>Paragraph two</p></div>')
      var header = div.find('h1')
      $.fn.addCollapsibleSections.addSection(header)
      div.prop('outerHTML').should.equal(
        '<div><h1 id="header">Header</h1><div id="header-section"><p>Paragraph one</p><p>Paragraph two</p></div></div>')
    })
  })

  describe('button()', function () {
    it('should create a button as specified', function () {
      $.fn.addCollapsibleSections.button('header').prop('outerHTML').should.equal('<a aria-hidden="true" aria-expanded="true" role="button" class="collapse-button" data-toggle="collapse" href="#header" aria-controls="header"></a>')
    })
  })

  describe('addCollapsibleSections()', function () {
    it('should add button to each header except h1', function () {
      var div = $('<div><h1 id="header">Header</h1><p>Paragraph one</p><p>Paragraph two</p><h2 id="subheader">Subheader</h2><p>Paragraph three</p><p>Paragraph four</p></div>')
      div.addCollapsibleSections({include: ['h2', 'h3', 'h4', 'h5', 'h6']}).prop('outerHTML').should.equal(
        '<div><h1 id="header">Header</h1><div id="header-section"><p>Paragraph one</p><p>Paragraph two</p><h2 id="subheader">Subheader<a aria-hidden="true" aria-expanded="true" role="button" class="collapse-button" data-toggle="collapse" href="#subheader-section" aria-controls="subheader-section"></a></h2><div class="collapse in" id="subheader-section"><p>Paragraph three</p><p>Paragraph four</p></div></div></div>')
    })
  })
})

describe('section.js', function () {
  describe('addSections()', function () {
    it('should create a section for a header', function () {
      var div = $('<div><h1 id="header">Header</h1><p>Paragraph one</p><p>Paragraph two</p></div>')
      div.addSections().prop('outerHTML').should.equal(
        '<div><section id="header"><h1>Header</h1><p>Paragraph one</p><p>Paragraph two</p></section></div>')
    })

    it('should wrap everything in a section', function () {
      var div = $('<div><h1 id="header">Header</h1><p>Paragraph one</p><h2 id="subheader">Subheader</h2><p>Paragraph two</p></div>')
      div.addSections().prop('outerHTML').should.equal(
        '<div><section id="header"><h1>Header</h1><section><p>Paragraph one</p></section><section id="subheader"><h2>Subheader</h2><p>Paragraph two</p></section></section></div>')
    })

    it('should work recursively', function () {
      var div = $('<div><h1 id="header">Header</h1><p>Paragraph one</p><h2 id="subheader">Subheader</h2><p>Paragraph two</p><h3 id="section">Section</h3><p>Paragraph three</p></div>')
      div.addSections().prop('outerHTML').should.equal(
        '<div><section id="header"><h1>Header</h1><section><p>Paragraph one</p></section><section id="subheader"><h2>Subheader</h2><section><p>Paragraph two</p></section><section id="section"><h3>Section</h3><p>Paragraph three</p></section></section></section></div>')
    })
  })
})

describe('figure.js', function () {
  describe('fixFigures()', function () {
    it('should add captions to images', function () {
      var div = $('<div>' +
                  '<p>' +
                  '<img alt="Caption text" class="right" src="image.png" width="200">' +
                  '</p>' +
                  '</div>')
      div.fixFigures().prop('outerHTML').should.equal(
        '<div><figure style="width: 209px;" class="right"><img alt="Caption text" src="image.png" width="200"><figcaption>Caption text</figcaption></figure></div>')
    })

    it('should handle multiple images within a paragraph', function () {
      var div = $('<div>' +
                  '<p>' +
                  '<img alt="Caption text 1" class="right" src="image1.png" width="200">' +
                  '<img alt="Caption text 2" class="right" src="image2.png" width="200">' +
                  '</p>' +
                  '</div>')
      div.fixFigures().prop('outerHTML').should.equal(
        '<div><figure style="width: 209px;" class="right"><img alt="Caption text 1" src="image1.png" width="200"><figcaption>Caption text 1</figcaption></figure><figure style="width: 209px;" class="right"><img alt="Caption text 2" src="image2.png" width="200"><figcaption>Caption text 2</figcaption></figure></div>')
    })

    it('should ignore captionless images', function () {
      var div = $('<div>' +
                  '<p>' +
                  '<img alt="" src="image.png">' +
                  '</p>' +
                  '</div>')
      div.fixFigures().prop('outerHTML').should.equal(
        '<div><figure><img alt="" src="image.png"></figure></div>')
    })
  })
})

describe('punctuation.js', function () {
  describe('addPunctuation()', function () {
    it('should add opening and closing quotation marks', function () {
      var div = $('<div>' +
                  '<p>"Tsk, tsk," said the Hatter, "what a mess you\'ve made."</p>' +
                  '<p>"It is perfectly fine," replied Alice calmly. "I will leave it for the garbage collection service to recover."</p>' +
                  '</div>')
      div.addPunctuation().prop('outerHTML').should.equal(
        '<div>' +
        '<p>\u201cTsk, tsk,\u201d said the Hatter, \u201cwhat a mess you\u2019ve made.\u201d</p>' +
        '<p>\u201cIt is perfectly fine,\u201d replied Alice calmly. \u201cI will leave it for the garbage collection service to recover.\u201d</p>' +
        '</div>')
    })

    it('should add horizontal ellipsis', function () {
      var div = $('<div>' +
                  '<p>Is that so...?</p>' +
                  '</div>')
      div.addPunctuation().prop('outerHTML').should.equal(
        '<div>' +
        '<p>Is that so\u2026?</p>' +
        '</div>')
    })
  })
})

describe('github.js', function () {
  describe('github.resource()', function () {
    it('should extract resource path', function () {
      $.fn.github.resource('http://www.example.org/foo/').should.equal('/foo/')
    })
  })

  describe('github.path()', function () {
    it('should extract relative path', function () {
      $.fn.github.path('http://www.example.org/foo/').should.equal('/foo')
    })
  })

  describe('github.url()', function () {
    it('should simplify the address for root', function () {
      $.fn.github.url('http://epsil.github.io/').should.equal('https://github.com/epsil/epsil.github.io/')
    })

    it('should point to the Markdown source', function () {
      $.fn.github.url('http://epsil.github.io/2011/05/29/').should.equal('https://github.com/epsil/epsil.github.io/edit/master/2011/05/29/index.txt')
    })

    it('should ignore trailing slash', function () {
      $.fn.github.url('http://epsil.github.io/2011/05/29').should.equal('https://github.com/epsil/epsil.github.io/edit/master/2011/05/29/index.txt')
    })

    it('should ignore file:/// links', function () {
      $.fn.github.url('file:///test').should.equal('file:///test')
    })
  })
})

describe('toc.js', function () {
  describe('listOfContents()', function () {
    it('should nest headers listed in reverse order', function () {
      var body = $('<div><h2 id="subheader">Subheader</h2><h1 id="header">Header</h1></div>')
      body.listOfContents().should.equal(
        '<ul><li><ul><li><a href="#subheader">Subheader</a></li></ul></li><li><a href="#header">Header</a></li></ul>')
    })

    it('should add missing IDs', function () {
      var body = $('<div><h1>Header</h1></div>')
      body.listOfContents().should.equal(
        '<ul><li><a href="#header">Header</a></li></ul>')
      body.prop('outerHTML').should.equal(
        '<div><h1 id="header">Header</h1></div>')
    })

    it('should remove superfluous indentation levels', function () {
      var body = $('<div><h4 id="header">Header</h4></div>')
      body.listOfContents().should.equal(
        '<ul><li><a href="#header">Header</a></li></ul>')
    })

    it('should nest headers', function () {
      var body = $('<div><h1 id="header">Header</h1><h2 id="subheader">Subheader</h2></div>')
      body.listOfContents().should.equal(
        '<ul><li><a href="#header">Header</a><ul><li><a href="#subheader">Subheader</a></li></ul></li></ul>')
    })

    it('should list headers', function () {
      var body = $('<div><h1 id="header">Header</h1><h1 id="another-header">Another header</h1></div>')
      body.listOfContents().should.equal(
        '<ul><li><a href="#header">Header</a></li><li><a href="#another-header">Another header</a></li></ul>')
    })

    it('should list a header', function () {
      var body = $('<div><h1 id="header">Header</h1></div>')
      body.listOfContents().should.equal(
        '<ul><li><a href="#header">Header</a></li></ul>')
    })

    it('should return empty string instead of empty list', function () {
      var body = $('<div></div>')
      body.listOfContents().should.equal(
        '')
    })
  })
})

describe('util.js', function () {
  describe('removeAria()', function () {
    it('should remove header anchor', function () {
      var header = $('<h1><a aria-hidden="true" href="#">\u00b6</a>Header</h1>')
      header.removeAria().text().should.equal(
        'Header')
    })

    it('should remove collapse button', function () {
      var header = $('<h1>Header<span title="Collapse" class="collapse-button" aria-hidden="true">\u25b2</span></h1>')
      header.removeAria().text().should.equal(
        'Header')
    })
  })

  describe('fixFootnotes()', function () {
    it('should add title attribute to footnote link', function () {
      var div = $('<div>' +
                  '<p>This is a test.<sup class="footnote-ref"><a id="fnref1" href="#fn1">[1]</a></sup></p>' +
                  '<hr class="footnotes-sep">' +
                  '<section class="footnotes">' +
                  '<ol class="footnotes-list">' +
                  '<li class="footnote-item" id="fn1"><p>This is a footnote. <a class="footnote-backref" href="#fnref1">\u21a9</a></p>' +
                  '</li>' +
                  '</ol>' +
                  '</section>' +
                  '</div>')
      div.fixFootnotes().prop('outerHTML').should.equal(
        '<div><p>This is a test.<sup class="footnote-ref"><a title="This is a footnote." id="fnref1" href="#fn1">[1]</a></sup></p><hr class="footnotes-sep"><section class="footnotes"><ol class="footnotes-list"><li class="footnote-item" id="fn1"><p>This is a footnote. <a title="This is a test.[1]" class="footnote-backref" href="#fnref1">\u21a9</a></p></li></ol></section></div>')
    })

    it('should handle multiple usages of the same footnote', function () {
      var div = $('<div>' +
                  '<p>This is a test.<sup class="footnote-ref"><a id="fnref1" href="#fn1">[1]</a></sup> Same footnote again.<sup class="footnote-ref"><a id="fnref2" href="#fn1">[1]</a></sup></p>' +
                  '<hr class="footnotes-sep">' +
                  '<section class="footnotes">' +
                  '<ol class="footnotes-list">' +
                  '<li class="footnote-item" id="fn1"><p>This is a footnote. <a class="footnote-backref" href="#fnref1">\u21a9</a> <a class="footnote-backref" href="#fnref2">\u21a9</a></p>' +
                  '</li>' +
                  '</ol>' +
                  '</section>' +
                  '</div>')
      div.fixFootnotes().prop('outerHTML').should.equal(
        '<div><p>This is a test.<sup class="footnote-ref"><a title="This is a footnote." id="fnref1" href="#fn1">[1]</a></sup> Same footnote again.<sup class="footnote-ref"><a title="This is a footnote." id="fnref2" href="#fn1">[1]</a></sup></p><hr class="footnotes-sep"><section class="footnotes"><ol class="footnotes-list"><li class="footnote-item" id="fn1"><p>This is a footnote. <a title="This is a test.[1] Same footnote again.[1]" class="footnote-backref" href="#fnref1">\u21a9</a> <a title="This is a test.[1] Same footnote again.[1]" class="footnote-backref" href="#fnref2">\u21a9</a></p></li></ol></section></div>')
    })
  })
})

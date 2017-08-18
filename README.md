Markdown wiki
=============

A wiki written in Markdown.

Organization
------------

The wiki has the following file structure:

    .
    |-- index.md
    |-- index.html
    |-- page
    |   |-- index.md
    |   `-- index.html
    `-- anotherpage
        |-- index.md
        `-- index.html

Every page has its own folder, and folders can be arbitrarily nested. The page's contents are stored in a Markdown file named `index.md`. There is also an associated `index.html` file, which uses a bit of JavaScript to dynamically render the Markdown as HTML when viewed in a browser.

One of several benefits of the above file structure is that the whole wiki can be served by a web server, and every wiki page gets its own URL. If the wiki is placed in the server's root directory (any directory will do), the addresses become:

| URL | Page |
| --- | ---- |
| `/` | root |
| `/page/` | page |
| `/anotherpage/` | anotherpage |

Upload the wiki to a server of your choice, or serve it locally. To do the latter, do `npm run http`.

One can also open the `index.html` files directly from disk, without starting up an HTTP server first. Unfortunately, this only works in Firefox; other browsers impose limits on [resource sharing](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing), and therefore require that a HTTP server is running.

Versioning
----------

The wiki uses [Git](https://git-scm.com/) to keep track of changes. The wiki is a regular Git repository, and standard Git commands work as one would expect.

It is optional, but highly recommended, to set up a remote repository for the wiki.

Editing
-------

A wiki page is edited by opening its `index.md` file in a text editor, making changes, and committing them with Git. A shorthand command for this is `npm run commit` (requires [Node](http://nodejs.org/)). To synchronize the changes, one can use `npm run push`. One can also use standard Git commands (`git commit` and `git push`) for the same task.

The wiki can be edited online simply by hosting the repository at GitHub, BitBucket or a similar service. These websites lets one edit Markdown files via a user-friendly web interface.

Markup
------

The wiki is written in Markdown ([Pandoc flavor](http://pandoc.org/MANUAL.html#pandocs-markdown)).

The wiki supports [metadata](http://pandoc.org/MANUAL.html#metadata-blocks) in the form of an initial YAML block:

```markdown
---
title: Page title
author: Page author
---

This is a page written in **Markdown**.
```

The wiki uses [markdown-it](https://www.npmjs.com/package/markdown-it) for its Markdown parser, which is customizable with extensions.

Styling
-------

By default, the wiki uses [Bootstrap](http://getbootstrap.com/) to provide responsive CSS styling.

One can add custom CSS styling to a page by adding a stylesheet file to the page's directory:

    .
    `-- page
        |-- index.md
        |-- index.html
        `-- style.css

Then reference the file in the page's metadata block:

```yaml
---
title: Page title
author: Page author
css: style.css
---
```

Images
------

To add an image to a page, put it in the page's folder:

    .
    `-- page
        |-- index.md
        |-- index.html
        `-- image.jpg

Then reference it with the standard Markdown image syntax:

```markdown
![](image.jpg)
```

It is possible to reference images from anywhere, but it is good practice to bundle them together with the relevant page.

Future compatibility
--------------------

Markdown is a light-weight markdown language, and Markdown files are plain text. As such, they are human readable.

Markdown can also be converted to a host of other formats with [Pandoc](http://pandoc.org/), whether to other markup languages or to more conventional formats like Microsoft Word.

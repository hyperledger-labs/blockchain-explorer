
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

## Hyperledger Explorer

- [Project Lifecycle](project_lifecycle/README.md)
- [Hyperledger Explorer functionalities](project_functionalities/README.md)



# Documentation README

## Introduction

This document contains information on how the Hyperledger Explorer documentation is
built and published as well as a few conventions one should be aware of
before making changes to the doc.

The crux of the documentation is written in
[reStructuredText](http://docutils.sourceforge.net/rst.html) which is
converted to HTML using [Sphinx](http://www.sphinx-doc.org/en/stable/).
The HTML is then published on http://hyperledger-fabric.readthedocs.io
which has a hook so that any new content that goes into `docs/source`
on the main repository will trigger a new build and publication of the
doc.

## Conventions

* Source files are in RST format and found in the `docs/source` directory.
* The main entry point is index.rst, so to add something into the Table
  of Contents you would simply modify that file in the same manner as
  all of the other topics. It's very self-explanatory once you look at
  it.
* Relative links should be used whenever possible. The preferred
  syntax for this is: :doc:\`anchor text &lt;relativepath&gt;\`
  <br/>Do not put the .rst suffix at the end of the filepath.
* For non RST files, such as text files, MD or YAML files, link to the
  file on github, like this one for instance:
  https://github.com/hyperledger/blockchain-explorer/blob/master/README.md

Notes: The above means we have a dependency on the github mirror
repository. Relative links are unfortunately not working on github
when browsing through a RST file.

## Setup

Making any changes to the documentation will require you to test your
changes by building the doc in a way similar to how it is done for
production. There are two possible setups you can use to do so:
setting up your own staging repo and publication website, or building
the docs on your machine. The following sections cover both options:

### Building the docs on your machine

Here are the quick steps to achieve this on a local machine without
depending on ReadTheDocs, starting from the main fabric
directory. Note: you may need to adjust depending on your OS.

```
sudo pip install Sphinx
sudo pip install sphinx_rtd_theme
sudo pip install recommonmark==0.4.0
cd fabric/docs # Be in this directory. Makefile sits there.
make html
```

This will generate all the html files in `docs/build/html` which you can
then start browsing locally using your browser. Every time you make a
change to the documentation you will of course need to rerun `make
html`.

In addition, if you'd like, you may also run a local web server with the following commands (or equivalent depending on your OS):

- Ubuntu

```
sudo apt-get install apache2
cd build/html
sudo cp -r * /var/www/html/
```

- MacOS

```
brew install apache2
cd build/html
sudo cp -r * /usr/local/var/www
```



You can then access the html files at `http://localhost/index.html`.

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.


.. Licensed under Creative Commons Attribution 4.0 International License
   https://creativecommons.org/licenses/by/4.0/

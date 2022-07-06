# QueryViz
🌻 MediaWiki extension adding a `<query>` tag to display sparql queries results inside wiki pages.

## Requirements
_To complete_

## Installation
_To complete_

In `LocalSettings.php`, add : 
```
# Activate QueryViz extension
wfLoadExtension( 'QueryViz' );
$wgQueryVizEndpoint = "https://lingualibre.org/bigdata/namespace/wdq/sparql";
```

## Structure
- [`/operations`](https://github.com/lingua-libre/operations/) : LinguaLibre set up repository.
  - [`/mediawiki-config/LocalSettings.php`](https://github.com/lingua-libre/operations/blob/master/mediawiki-config/LocalSettings.php): defines `QueryVizEndpoint`.
- QueryViz: 
  - `/Hooks.php` : parse page, call upon <query> the function TagHandler.php .
  - `/includes/TagHandler.php` : load config, inject queryviz base html with empty loading element.
  - `/modules/ext.queryViz.QueryViz.js` : call the sparql, received data, built and inject corresponding html table.

## Demo
See examples of use on LinguaLibre website: [LinguaLibre:Stats](https://lingualibre.org/wiki/LinguaLibre:Stats), [Help:SPARQL](https://lingualibre.org/wiki/Help:SPARQL), [Category:DataViz](https://lingualibre.org/wiki/Category:Lingua_Libre:DataViz)

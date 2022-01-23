# QueryViz
🌻 MediaWiki extension adding a `<query>` tag to display sparql queries results inside wiki pages.

## Requirements
_To complete_

## Installation
_To complete_

## Structure
- [`/operations`](https://github.com/lingua-libre/operations/) : LinguaLibre set up repository.
  - [`/mediawiki-config/LocalSettings.php`](https://github.com/lingua-libre/operations/blob/master/mediawiki-config/LocalSettings.php): defines `QueryVizEndpoint`.
- QueryViz: 
  - `/Hooks.php` : parse page, call upon <query> the function TagHandler.php .
  - `/includes/TagHandler.php` : load config, inject queryviz base html with empty loading element.
  - `/modules/ext.queryViz.QueryViz.js` : call the sparql, received data, built and inject corresponding html table.

## Example
Used in [LinguaLibre:Stats](https://lingualibre.org/wiki/LinguaLibre:Stats)

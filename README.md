# QueryViz
🌻 MediaWiki extension adding a `<query>` tag to display sparql queries results inside wiki pages.

## Requirements
_To complete_

## Installation
_To complete_

In `LocalSettings.php`, add : 
```php
# Activate QueryViz extension
wfLoadExtension( 'QueryViz' );
$wgQueryVizEndpoint = "https://lingualibre.org/bigdata/namespace/wdq/sparql"; // Or your chosen default endpoint
```

## Update

Deploy:
1. Go to host server : login
2. `cd /opt/mediawiki/x.xx/extensions/QueryViz # x.xx being your MediaWiki version
3. `git pull`

Test on live website via private windows :
- If work : we won !
- if breaks : roll back change `git reset --hard a0d3fe6` with the correct commit id found from Github

## Structure
- [`/operations`](https://github.com/lingua-libre/operations/) : LinguaLibre set up repository.
  - [`/mediawiki-config/LocalSettings.php`](https://github.com/lingua-libre/operations/blob/master/mediawiki-config/LocalSettings.php): defines `QueryVizEndpoint`.
- QueryViz: 
  - `/Hooks.php` : parse page, call upon <query> the function TagHandler.php .
  - `/includes/TagHandler.php` : load config, inject queryviz base html with empty loading element.
  - `/modules/ext.queryViz.QueryViz.js` : call the sparql, received data, built and inject corresponding html table.

## Demo
See examples of use on LinguaLibre website: [LinguaLibre:Stats](https://lingualibre.org/wiki/LinguaLibre:Stats), [Help:SPARQL](https://lingualibre.org/wiki/Help:SPARQL), [Category:DataViz](https://lingualibre.org/wiki/Category:Lingua_Libre:DataViz)

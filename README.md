# QueryViz
🌻 MediaWiki extension adding a `<query>` tag to display sparql queries results inside wiki pages.

## Requirements
_To complete_

## Installation
In [`/mediawiki-config/LocalSettings.php`](https://github.com/lingua-libre/operations/blob/master/mediawiki-config/LocalSettings.php), add : 
```php
# Activate QueryViz extension
wfLoadExtension( 'QueryViz' );
$wgQueryVizEndpoint = "https://lingualibre.org/bigdata/namespace/wdq/sparql"; // Or your chosen default endpoint
```

For Lingualibre, see also [`/operations`](https://github.com/lingua-libre/operations/) : LinguaLibre set up repository.

## Update

Deploy:
1. Go to host server : login
2. `cd /opt/mediawiki/x.xx/extensions/QueryViz # x.xx being your MediaWiki version`
3. `git pull`

Test on live website via private windows :
- If work : we won !
- if breaks : roll back change `git reset --hard a0d3fe6` with the correct commit id found from Github

## Structure
```
  ├── bin/build.sh : building script, copies few js.
  ├── i18n/ : translation files
  |     ├── en.json : English
  |     ├── fr.json : French
  |     └── qqq.json : guides
  ├── includes/TagHandler.php : load config, inject queryviz base html with empty loading element.
  ├── modules/
  |     ├── ext.queryViz.QueryViz.js : call the sparql, received data, built and inject corresponding html table.
  |     ├── ext.queryViz.WikidataSearchWidget.js : ? <believed to not be active>
  |     ├── ext.queryViz.js : ?
  |     └── ext.queryViz.css : css
  └── Hooks.php : parse page, call upon <query> the function TagHandler.php .
  
```

## Contribute
- [Phabricator: Lingua-libre > Query service column](https://phabricator.wikimedia.org/tag/lingua_libre/) — tickets manager
- [Github: Lingua-libre/Lingua-Libre-Bot](https://github.com/lingua-libre/Lingua-Libre-Bot) — code (python)

## Demo
See examples of use on LinguaLibre website: [LinguaLibre:Stats](https://lingualibre.org/wiki/LinguaLibre:Stats), [Help:SPARQL](https://lingualibre.org/wiki/Help:SPARQL), [Category:DataViz](https://lingualibre.org/wiki/Category:Lingua_Libre:DataViz)

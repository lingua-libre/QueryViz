<?php
/**
 * QueryViz extension hooks
 *
 * @file
 * @ingroup Extensions
 * @license GPL-3.0+
 */

namespace QueryViz;

use QueryViz\TagHandler;
use Parser;

class Hooks {
	/**
	 * ParserFirstCallInit hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ParserFirstCallInit
	 * @param Parser $parser
	 * @return bool
	 */
	public static function onParserFirstCallInit( Parser $parser ) {
		/* Attach to html element `<query>` the code defined in TagHandler.php   */
		$parser->setHook( 'query', 'QueryViz\TagHandler::handle' );
		return true;
	}
}

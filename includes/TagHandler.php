<?php
/**
 *
 *
 * @file
 * @ingroup Extensions
 */

namespace QueryViz;

use Parser;
use PPFrame;

class TagHandler {

	/**
	 * Entry point for all tags
	 *
	 * @param string $input
	 * @param array $args
	 * @param Parser $parser
	 * @param PPFrame $frame
	 * @return string
	 */
	public static function handle( $input, array $args, Parser $parser, PPFrame $frame ) {
		global $wgQueryVizEndpoint;

		static $tagCount = 0;
		static $jsConfigVars = [];
		if ( $input == null ) {
			return '';
		}

		$index = $tagCount++;
		$output = $parser->getOutput();
		$output->addModuleStyles( 'ext.queryviz.style' );
		$output->addModules( 'ext.queryviz' );

		$config = array(
			'query' => $input,
			'labels' => $args,
		);
		$jsConfigVars[] = $config;

		$output->addJsConfigVars( [
			'QueryViz' => $jsConfigVars,
			'QueryVizEndpoint' => $wgQueryVizEndpoint
		] );

		return '<div class="queryviz" data="' . $index . '">
					<div class="queryviz-toggle"></div>
					<div class="queryviz-wrap"></div>
					<div class="queryviz-result"></div>
					<div class="queryviz-loading">
						<center>' . wfMessage( 'mwe-queryviz-loading' )->text() . '</center>
					</div>
				</div>';
	}
}

// WIDGET NOT FINISHED, RECOMMENDED TO HIDE IT VIA CSS
'use strict';

( function ( mw, qv, $, OO ) {

	/**
	 * Search widget fetching propositions from wikidata
	 *
	 * @class
	 * @extends OO.ui.TextInputWidget
	 * @mixins OO.ui.mixin.LookupElement
	 *
	 * @constructor
	 * @param {Object} config Configuration options
	 */
	qv.WikidataSearchWidget = function ( config ) {
		this.wikidataApi = new mw.ForeignApi( 'https://www.wikidata.org/w/api.php', { anonymous: true } );
		this.lang = mw.config.get( 'wgUserLanguage' );
		this.qid = null;

		// Parent constructor
		OO.ui.TextInputWidget.call( this, config );
		// Mixin constructors
		OO.ui.mixin.LookupElement.call( this, config );
	};

	OO.inheritClass( qv.WikidataSearchWidget, OO.ui.TextInputWidget );
	OO.mixinClass( qv.WikidataSearchWidget, OO.ui.mixin.LookupElement );

	qv.WikidataSearchWidget.prototype.setValue = function ( value, isQid ) {
		if ( [ '', undefined, null ].indexOf( value ) === -1 ) {
			if ( isQid === true || this.qid === null ) {
				this.setQid( value, true );
			}
		} else {
			this.setQid( undefined );
		}
		OO.ui.TextInputWidget.prototype.setValue.call( this, value );
	};

	qv.WikidataSearchWidget.prototype.setQid = function ( qid, lookupLabel ) {
		var widget = this;

		this.qid = qid;
		this.setLabel( qid );

		if ( lookupLabel === true && [ '', undefined, null ].indexOf( qid ) === -1 ) {
			this.pushPending();
			this.wikidataApi.get( {
				action: 'wbgetentities',
				format: 'json',
				ids: qid,
				props: 'labels',
				languages: this.lang,
				languagefallback: 1
			} ).then( function ( data ) {
				widget.popPending();
				OO.ui.TextInputWidget.prototype.setValue.call( widget, data.entities[ qid ].labels[ widget.lang ].value );
			} ).fail( function () {
				widget.popPending();
			} );
		}
	};

	qv.WikidataSearchWidget.prototype.getData = function () {
		return this.qid;
	};

	qv.WikidataSearchWidget.prototype.getLookupRequest = function () {
		var i, result,
			value = this.getValue(),
			deferred = $.Deferred();

		this.wikidataApi.get( {
			action: 'wbsearchentities',
			format: 'json',
			search: value,
			language: this.lang,
			uselang: this.lang,
			limit: '7',
			origin: '*'
		} ).then( function ( data ) {
			var results = [];
			for ( i = 0; i < data.search.length; i++ ) {
				result = data.search[ i ];
				results.push( {
					label: result.label,
					data: result.id,
					url: result.url,
					description: result.description
				} );
			}
			deferred.resolve( results );
		} );

		return deferred.promise( { abort: function () {} } );
	};

	qv.WikidataSearchWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
		return response || [];
	};

	qv.WikidataSearchWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
		var i,
			items = [];

		for ( i = 0; i < data.length; i++ ) {
			items.push( new qv.WikidataOptionWidget( data[ i ] ) );
		}

		return items;
	};

	qv.WikidataSearchWidget.prototype.onLookupMenuItemChoose = function ( item ) {
		this.setValue( item.getLabel() );
		this.setQid( item.getData() );
		// return OO.ui.mixin.LookupElement.prototype.onLookupMenuItemChoose.call( this, item );
	};

	/**
	 * Creates a WikidataOptionWidget object.
	 *
	 * @class
	 * @extends OO.ui.MenuOptionWidget
	 *
	 * @constructor
	 * @param {Object} config Configuration options
	 * @cfg {string} label Label to display
	 * @cfg {string} data qid of the item
	 * @cfg {string} url URL of item's page
	 * @cfg {string} [description] Item description
	 */
	qv.WikidataOptionWidget = function ( config ) {
		// Config initialization
		config = $.extend( {
			label: config.data,
			autoFitLabel: false,
			$label: $( '<a>' )
		}, config );

		// Parent constructor
		mw.widgets.TitleOptionWidget.parent.call( this, config );

		// Initialization
		this.$label.attr( 'href', config.url );
		this.$element.addClass( '' ); // TODO
		this.$label.attr( 'tabindex', '-1' );
		this.$label.attr( 'title', config.data );

		// Allow opening the link in new tab, but not regular navigation.
		this.$label.on( 'click', function ( e ) {
			// Don't interfere with special clicks (e.g. to open in new tab)
			if ( !( e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) ) {
				e.preventDefault();
			}
		} );

		if ( config.description ) {
			this.$element.append(
				$( '<small>' )
					.addClass( 'mw-widget-titleOptionWidget-description' )
					.text( config.description )
					.attr( 'title', config.description )
			);
		}
	};

	/* Setup */
	OO.inheritClass( qv.WikidataOptionWidget, OO.ui.MenuOptionWidget );

}( mediaWiki, mediaWiki.queryViz, jQuery, OO ) );

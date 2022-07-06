( function ( mw, qv, $, OO ) {
	const sparqlEndpoint = mw.config.get( 'QueryVizEndpoint' ); // "https://lingualibre.org/bigdata/namespace/wdq/sparql";

	var QueryViz = function( node ) {
		var queryviz = this;
		this.node = node;
		this.id = node.attr( 'data' );
		this.baseQuery = qv.config[ this.id ].query;
		this.columnMap = qv.config[ this.id ].columnMap;
		this.pagination = Number( qv.config[ this.id ].pagination );
		this.resultNode = node.children( '.queryviz-result' );
		this.wrapNode = node.find( '.queryviz-wrap' );
		this.toggleNode = node.find( '.queryviz-toggle' );
		this.loadingNode = node.children( '.queryviz-loading' );

		this.inputs = [];
		this.labels = {};
		this.filters = {};

		// Add inputs
		this.toggle = new OO.ui.ButtonWidget( {
			icon: 'expand',
			label: 'Filtres'
		} );
		this.toggle.on( 'click', function() {
			if ( queryviz.toggle.getIcon() === 'expand' ) {
				queryviz.toggle.setIcon( 'collapse' );
				queryviz.wrapNode.show();
				if ( queryviz.wrapNode.html() === '' ) {
					console.log(  'a');
					queryviz.addInputs();
				}
					console.log(  'b');
			}
			else {
				queryviz.toggle.setIcon( 'expand' );
				queryviz.wrapNode.hide();
			}
		} );
		this.toggleNode.append( this.toggle.$element );

		this.refresh();
	};

	QueryViz.prototype.addInputs = function() {
		var queryviz = this,
		    regex = /#extra:({.+?})? (.+)/g,
		    process = new OO.ui.Process(),
		    query = this.baseQuery,
		    m;

		while ( ( m = regex.exec( query ) ) !== null ) {
		    console.log( m );
		    // This is necessary to avoid infinite loops with zero-width matches
		    if (m.index === regex.lastIndex) {
		        regex.lastIndex++;
		    }

		    var input = JSON.parse( m[ 1 ] );
		    input[ 'query' ] = m[ 2 ];

		    if ( input[ 'label' ] !== undefined ) {
		        this.labels[ input[ 'label' ] ] = input[ 'label' ];
		    }

		    if ( input[ 'filter' ] !== undefined ) {
		        this.filters[ input[ 'filter' ] ] = [];
		    }

		    var i = this.inputs.push( input );
		    this.baseQuery = this.baseQuery.replace( m[ 0 ], '#$' + i );
		}

		// Fetch labels
		if ( Object.keys( this.labels ).length ) {
		    process.next( this.getLabels.bind( this ) );
		}

		// Preload values for limited inputs
		for ( var item in this.filters ) {
		    process.next( this.loadFilterValues.bind( this, item ) );
		}

		// Once all data has been collected, we can create the fields
		process.next( function() {
			queryviz.wrapNode.html( '' );
			if ( queryviz.inputs.length === 0 ) {
				queryviz.wrapNode.html( '<center>' + mw.msg( 'mwe-queryviz-nofilters' ) + '</center>' )
			}
		} );
		for ( var i=0; i < this.inputs.length; i++ ) {
		    process.next( this.createField.bind( this, this.inputs[ i ] ) );
		}

		process.next( function() {
			if ( queryviz.inputs.length > 0 ) {
				var button = new OO.ui.ButtonWidget( {
					label: 'Filtrer!',
					flags: [ 'primary', 'progressive' ]
				} );
				button.on( 'click', queryviz.refresh.bind( queryviz ) );
				queryviz.wrapNode.append( button.$element );
			}
		} );

		var progressBar = new OO.ui.ProgressBarWidget( {
			progress: false
		} )
		this.wrapNode.append( progressBar.$element );


		process.execute();
	};

	QueryViz.prototype.loadFilterValues = function( item ) {
		var queryviz = this,
			query = 'select ?id ?idLabel where {?id prop:P2 entity:' + item + '. SERVICE wikibase:label{bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".}}';

		return this.postQuery( query ).then( function( data ) {
		    var rows = data.results.bindings;
		    for ( var i=0; i < rows.length; i++ ) {
		        queryviz.filters[ item ].push( new OO.ui.MenuOptionWidget( {
		            data: rows[ i ][ 'id' ].value.split( '/' ).pop(),
		            label: rows[ i ][ 'idLabel' ].value
		        } ) );
		    }
		} );
	};

	QueryViz.prototype.getLabels = function( query ) {
		var queryviz = this,
		    lang = mw.config.get( 'wgUserLanguage' ),
		    api = new mw.Api();
		return api.get( {
		    action: 'wbgetentities',
		    format: 'json',
		    ids: Object.keys( this.labels ).join( '|' ),
		    props: 'labels',
		    languages: lang,
		    languagefallback: 1
		} ).then( function( data ) {
		    for ( entity in data.entities ) {
		        queryviz.labels[ entity ] = data.entities[ entity ].labels[ lang ].value;
		    }
		} );
	};

	QueryViz.prototype.createField = function( infos ) {
		var field;

		switch( infos.type ) {
		    case 'wikibase-item':
		        field = new OO.ui.CapsuleMultiselectWidget( {
		            menu: { items: this.filters[ infos[ 'filter' ] ] }
		        } );
		        break;
		    case 'wikidata':
		        field = new qv.WikidataSearchWidget();
		        break;
		    default:
		        field = new OO.ui.TextInputWidget();
		}
		this.wrapNode.append( new OO.ui.FieldLayout( field, {
		    align: 'left',
		    label: this.labels[ infos[ 'label' ] ],
		} ).$element );

		infos[ 'field' ] = field;
	};

	QueryViz.prototype.preProcessQuery = function() {
		var query = this.baseQuery;

		for ( var i=0; i < this.inputs.length; i++ ) {
		    if ( this.inputs[ i ].field !== undefined ) {
		        switch( this.inputs[ i ].type ) {
		            case 'wikibase-item':
		                var values = this.inputs[ i ].field.getItemsData();
		                for ( var j=0; j < values.length; j++ ) {
		                    values[ j ] = '{' + this.inputs[ i ].query.replace( '[EXTRA]', values[ j ] ) + '}';
		                }
		                query = query.replace( '#$' + (i+1), values.join( ' UNION ' ) );
		                break;
		            case 'wikidata':
		                var value = this.inputs[ i ].field.getData();
		                if ( value !== undefined ) {
		                	query = query.replace( '#$' + (i+1), this.inputs[ i ].query.replace( '[EXTRA]', value ) );
		                }
		                break;
		            default:
		                var value = this.inputs[ i ].field.getValue();
		                if ( value !== '' ) {
		                	query = query.replace( '#$' + (i+1), this.inputs[ i ].query.replace( '[EXTRA]', value ) );
		                }
		        }
		    }
		}

		return query;
	};
	
	// Queries the SPARQL endpoint via xhr
	QueryViz.prototype.postQuery = function( query ) {
		query = query.replace(/\u00A0/g, ' ').replace( '[AUTO_LANGUAGE]', mw.config.get( 'wgUserLanguage' ) );
		console.log( query );
				
		// According to query settings, switch sparql query endpoint
		// If query includes "#defaultEndpoint:Wikidata" -> Wikidata
		// If query includes "#defaultEndpoint:Commons" -> Commons
		// Else : Lingualibre
		switch (true) {
		  case query.includes('#defaultEndpoint:Wikidata'):
		    console.log('SPARQL query service: Wikidata')
		    sparqlEndpoint = 'https://query.wikidata.org/sparql' // with xhr js GET
		    break;
		  case query.includes('#defaultEndpoint:Commons'):
		    console.log('SPARQL query service: Commons')
		    sparqlEndpoint = 'https://commons-query.wikimedia.org/sparql' // with xhr js GET
		    break;
		  default:
		    console.log('SPARQL query service: Lingualibre');
		    sparqlEndpoint = 'https://lingualibre.org/bigdata/namespace/wdq/sparql' // with xhr js POST
		    break;
		}
		// Adapts to each service's xhr protocol : post vs get
		if (sparqlEndpoint.includes('lingualibre')) {
		  return $.post(sparqlEndpoint, { format: 'json', query: query });
		} else {
		  return $.get(sparqlEndpoint, { format: 'json', query: query });
		}
	};

	QueryViz.prototype.refresh = function() {
		var queryviz = this,
		    query = this.preProcessQuery();

		this.loadingNode.show();
		this.postQuery( query ).then( function( data ) {
		    var table = queryviz.dataToTable( data.head.vars, data.results.bindings );
		    queryviz.resultNode.html( table );
		    queryviz.loadingNode.hide();
		} ).fail( function( data ) {
		    console.log( data.responseText );
		    //TODO: manage errors
		} );
	};

	QueryViz.prototype.playButton = function( audioUrl ) {
		var button = new OO.ui.ButtonWidget( {
			framed: false,
			icon: 'play',
			title: 'play'
		} );
		button.on( 'click', function() {
			var audio = new Audio( audioUrl );
			audio.play();
		} );

		return button.$element;
	};

	QueryViz.prototype.dataToTable = function( headList, bodyList ) {
		var i, j, label, tr, trs,
			queryviz = this,
			order = [],
		    theadTr = $( '<tr>' ),
		    thead = $( '<thead>' ).append( theadTr ),
		    tbody = $( '<tbody>' ),
		    table = $( '<table>' )
				.addClass( 'wikitable sortable' )
				.append( thead ).append( tbody ),
			pagination = $( '<ul>' ),
			container = $( '<div>' )
				.append( table )
				.append( pagination );

		for ( i = 0; i < headList.length; i++ ) {
			label = headList[ i ];

			if ( this.columnMap[ label.toLowerCase() ] !== undefined ) {
				label = this.columnMap[ label.toLowerCase() ];
			}

		    theadTr.append( $( '<th>' ).text( label ) );
		    order.push( headList[ i ] );
		}

		for ( i = 0; i < bodyList.length; i++ ) {
		    tr = $( '<tr>' ).appendTo( tbody );

		    for ( j = 0; j < order.length; j++ ) {
		        var cell = bodyList[ i ][ order[ j ] ];
		        if ( cell === undefined ) {
		        	tr.append( $( '<td>' ).html( '' ) );
		        }
		        else {
				    if ( cell.type === 'uri' ) {
				    	if ( cell.value.lastIndexOf( 'http://commons.wikimedia.org/', 0 ) === 0 ) {
				    		cell.value = this.playButton( cell.value );
				    	}
				    	else {
						    cell.value = $( '<a>' )
						        .attr( 'href', cell.value )
						        .text( cell.value.split( '/' ).pop() );
				        }
				    }
				    tr.append( $( '<td>' ).html( cell.value ) );
				}
		    }
		}

		table.tablesorter();

		if ( this.pagination > 0 ) {
			trs = tbody.children( 'tr' );

			pagination.twbsPagination({
				totalPages: Math.ceil( trs.length / this.pagination ),
				visiblePages: 7,
				first: '«',
				prev: '<',
				next: '>',
				last: '»',
				activeClass: 'current',
				onPageClick: function (event, page) {
					//fetch content and render here
					trs.hide();
					trs.slice( queryviz.pagination * ( page - 1 ), queryviz.pagination * page).fadeIn( 200 );
					console.log( trs.slice( queryviz.pagination * ( page - 1 ), queryviz.pagination * page) )
				}
			});

			table.on( 'sortEnd.tablesorter', function() {
				trs = tbody.children( 'tr' );
				pagination.twbsPagination( 'show', 1 );
			} );
		}

		return container;
	}



	$( '.queryviz' ).each( function() {
	    window.queryviz = new QueryViz( $( this ) );
	} );



}( mediaWiki, mediaWiki.queryViz, jQuery, OO ) );

window.onload=function() {
	var fuse;

	/**
	 * Run search query.
	 */
	function search_query() {

		var request = new XMLHttpRequest();
		request.open(
			'GET',
			'/hellish-simplicity-index/',
			true
		);
		request.setRequestHeader( 'Content-type', 'application/json' );
		request.onreadystatechange = function() {
			if ( request.readyState == 4 && request.status == 200 ) {
				let list = JSON.parse( request.responseText );

				const options = {
					// isCaseSensitive: false,
					includeScore: true,
					shouldSort: true,
					// includeMatches: false,
					findAllMatches: true,
					// minMatchCharLength: 1,
					// location: 0,
					threshold: 0.55,
					// distance: 100,
					useExtendedSearch: false,
					// ignoreLocation: false,
					// ignoreFieldNorm: false,
					keys: [
						'title',
						'excerpt',
						'content'
					]
				};

				fuse = new Fuse( list, options );

				if ( '' !==  get_search_text() ) {

					// Get results.
					results = fuse.search( get_search_text() );

					// Show main search results.
					let template = document.getElementById( 'tmpl-hellish-simplicity-template' ).innerHTML;
					let content  = document.getElementById( 'theidwithcontent' );
					content.innerHTML = '';
					for ( let i = 0; i < results.length; i++ ) {
						let result = [];
						result.id      = results[i]['item']['id'];
						result.path    = results[i]['item']['path'];
						result.title   = results[i]['item']['title'];
						result.excerpt = results[i]['item']['excerpt'];

						content.innerHTML = Mustache.render( template, result );
					}

				}

			}
		};

		request.send();
	}

	search_query();

}
/**

NEED TO INDEX POSTS IN EACH YEAR DATE ARCHIVE.
NEED TO INDEX ALL TAXONOMY PAGINATION PAGES.
NEED TO HIDE MONTH AND DAY ARCHIVES.

 */

window.onload=function() {
	let fuse;
	let list;
	let single_template = `
	<article id="post-{{id}}" class="post-{{id}} post type-post status-publish format-standard hentry">
		<header class="entry-header">
			<h2 class="entry-title">
				<a href="{{path}}" title="Permalink to {{title}}" rel="bookmark">
					{{title}}
				</a>
			</h2><!-- .entry-title -->
		</header><!-- .entry-header -->
		<div class="entry-content">
			{{{excerpt}}}
		</div><!-- .entry-content -->
		<footer class="entry-meta">
			Posted on <a href="{{path}}" title="{{timestamp}}" rel="bookmark"><time class="entry-date updated" datetime="{{timestamp}}">{{timestamp}}</time></a><span class="byline"> by <span class="author vcard"><a class="url fn n" href="/author/{{author_id}}/" title="View all posts by {{author_id}}" rel="author">ryan</a></span></span>
			<span class="sep"> | </span>
			<span class="comments-link"><a href="{{path}}#respond">Leave a comment</a></span>
		</footer><!-- .entry-meta -->
	</article><!-- #post-{{id}} -->`;
	let content = document.getElementById( 'site-content' );

	get_posts();

	window.addEventListener(
		'click',
		function( e ) {

			if ( typeof( e.target.href ) === 'undefined' ) {
				return;
			}

			let path = e.target.href.replace( home_url, '' );

			let results = list.filter(post => post.path == path )

			show_results( '{{content}}', content, results );

			window.history.pushState( "object or string", results[0].title, results[0].path );

			e.preventDefault();
		}
	);

	/**
	 * Run search query.
	 */
	function get_posts() {

		var request = new XMLHttpRequest();
		request.open(
			'GET',
			'/hellish-simplicity-index/',
			true
		);
		request.setRequestHeader( 'Content-type', 'application/json' );
		request.onreadystatechange = function() {
			if ( request.readyState == 4 && request.status == 200 ) {
				list = JSON.parse( request.responseText );

				// If on search page, then run search.
				if ( null !== get_search_param() ) {
					search();
				}

			}
		};

		request.send();
	}

	/**
	 * Display results on the page.
	 */
	function show_results( page_template, content, results ) {

		let page_content = '';
		for ( let i = 0; i < results.length; i++ ) {
			let result = [];

			result.id      = results[i]['id'];
			result.path    = results[i]['path'];
			result.title   = results[i]['title'];
			result.excerpt = results[i]['excerpt'];

			page_content = page_content + Mustache.render( single_template, result );
		}

		let rendered_content = page_template.replace( '{{content}}', page_content );
		content.innerHTML    = rendered_content;
	}

	/**
	 * Get the search parameter.
	 */
	function get_search_param() {
		const url_params   = new URLSearchParams( window.location.search );
		return url_params.get( 's' );
	}

	/**
	 * Run a search query.
	 */
	function search() {

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

		// Get results.
		let fuse_results = fuse.search( get_search_param() );

		let results = [];
		for ( let i = 0; i < fuse_results.length; i++ ) {
			results[i] = fuse_results[i]['item'];
		}

		search_template  = `
		<h1 class="page-title">
			Search Results for: &quot;` + get_search_param() + `&quot; ...
		</h1><!-- .page-title -->

		{{content}}`;

		show_results( search_template, content, results );
	}

}

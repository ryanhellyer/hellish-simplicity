/**

perhaps this code should be compiled into one big JS file generated via PHP to keep things like taxonomies etc. in here.

NEED TO INDEX POSTS IN EACH YEAR DATE ARCHIVE.
NEED TO INDEX ALL TAXONOMY PAGINATION PAGES.
NEED TO HIDE MONTH AND DAY ARCHIVES.

 */

window.onload=function() {
	let fuse;
	let index;
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
			Posted on <a href="{{path}}" title="{{date}}" rel="bookmark"><time class="entry-date updated" datetime="{{date}}">{{date}}</time></a><span class="byline"> by <span class="author vcard"><a class="url fn n" href="/author/{{author_id}}/" title="View all posts by {{author_id}}" rel="author">{{author.display_name}}</a></span></span>
			<span class="sep"> | </span>
			<span class="comments-link"><a href="{{path}}#respond">Leave a comment</a></span>
		</footer><!-- .entry-meta -->
	</article><!-- #post-{{id}} -->`;
	let content = document.getElementById( 'site-content' );

	get_index();

	/**
	 * Add class to body tag (to allow us to style site based on JS being on or not.
	 */
	let body = document.body;
	body.classList.add( 'js' );

	/**
	 * Run search queries as typed into search box.
	 */
	document.getElementById( 's' ).addEventListener(
		'keyup',
		function( e ) {

			// If no value set, then bail out.
			if ( null === e.target.value ) {
				return;
			}

			// If value is blank, then load home page.
			if ( '' === e.target.value ) {
				window.history.pushState( "object or string", index.home_title, index.home_url );
				show_posts_page();
				return;
			}

			let search_string = e.target.value;

			if ( '' === search_string ) {
				return;
			}

			window.history.pushState( "object or string", 'Search Results for "' + search_string + '"', index.home_url + '/?s=' + search_string );
			show_search_page();
		}
	);

	/**
	 * Handle click events.
	 */
	window.addEventListener(
		'click',
		function( e ) {

			if ( typeof( e.target.href ) === 'undefined' ) {
				return;
			}

			let raw_path = e.target.href.replace( index.home_url, '' );
			path         = raw_path.split( '#' )[0]; // Strip anchor links.

			let posts_index = index.posts;
			let results     = posts_index.filter(post => post.path == path )

			show_results( '{{content}}', content, results );

			window.history.pushState( "object or string", results[0].title, raw_path );

			e.preventDefault();
		}
	);

	/**
	 * Get the index.
	 */
	function get_index() {

		var request = new XMLHttpRequest();
		request.open(
			'GET',
			'/hellish-simplicity-index/',
			true
		);
		request.setRequestHeader( 'Content-type', 'application/json' );
		request.onreadystatechange = function() {
			if ( request.readyState == 4 && request.status == 200 ) {
				index = JSON.parse( request.responseText );

				// If on search page, then run search.
				if ( null !== get_search_param() ) {
					show_search_page();
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
			result.slug    = results[i]['slug'];
			result.path    = results[i]['path'];
			result.title   = results[i]['title'];
			result.excerpt = results[i]['excerpt'];

			result.date    = date( index.date_format, results[i]['timestamp'] );
			result.modified_date    = results[i]['modified_timestamp'];
			result.term_ids    = results[i]['term_ids'];

			// Authors.
			let author_id              = results[i]['author_id'];
			result.author_id           = author_id;
			authors_list               = JSON.parse( index.authors );
			result.author              = authors_list[ author_id ];
			result.author.display_name = result.author.display_name;

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
	 * Show the search page and run query.
	 */
	function show_search_page() {

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

		fuse = new Fuse( index.posts, options );

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

	/**
	 * Display the posts page.
	 */
	function show_posts_page() {
		let results = [];
		let key     = 0;

		for ( let i = 0; i < index.posts.length; i++ ) {

			if (
				'post' === index.posts[i].post_type
				&&
				key < index.posts_per_page
			) {
				results[key] = index.posts[i];
				key++;
			}

		}
console.log(results);
		template  = '{{content}}';

		show_results( template, content, results );
	}

}

/**

perhaps this code should be compiled into one big JS file generated via PHP to keep things like taxonomies etc. in here.

NEED TO INDEX POSTS IN EACH YEAR DATE ARCHIVE.
NEED TO INDEX ALL TAXONOMY PAGINATION PAGES.
NEED TO HIDE MONTH AND DAY ARCHIVES.

 */
// this part is the service worker:
//     if('serviceWorker' in navigator){
        // Register service worker
//        console.log('Service Worker is supported');
//    }

//salert('test');
//window.addEventListener("load", () => {
//});

window.onload=function() {

/*
console.log('Service workers require https therefore this will not work here ... yet');
//if ( 'serviceWorker' in navigator ) {
console.log('service');
	navigator.serviceWorkerContainer.register( 'wp-content/themes/hellish-simplicity/js/offline.js' ).then(
		function( reg ) {
			console.log( 'Service Worker registration succeeded. Scope is ' + reg.scope );
		}
	).catch(
		function( err ) {
			console.error( 'Service Worker registration failed with error ' + err );
		}
	);
//}
*/


	let fuse;
	let index;
	let excerpt_template = `
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
			{{{content}}}
		</div><!-- .entry-content -->
		<footer class="entry-meta">
			Posted on <a href="{{path}}" title="{{date}}" rel="bookmark"><time class="entry-date updated" datetime="{{date}}">{{date}}</time></a><span class="byline"> by <span class="author vcard"><a class="url fn n" href="/author/{{author_id}}/" title="View all posts by {{author_id}}" rel="author">{{author.display_name}}</a></span></span>
			<span class="sep"> | </span>
			<span class="comments-link"><a href="{{path}}#respond">Leave a comment</a></span>
		</footer><!-- .entry-meta -->
	</article><!-- #post-{{id}} -->`;
	let page_template = `
	<article id="post-{{id}}" class="post-{{id}} post type-post status-publish format-standard hentry">
		<header class="entry-header">
			<h2 class="entry-title">
				<a href="{{path}}" title="Permalink to {{title}}" rel="bookmark">
					{{title}}
				</a>
			</h2><!-- .entry-title -->
		</header><!-- .entry-header -->
		<div class="entry-content">
			{{{content}}}
		</div><!-- .entry-content -->
		<footer class="entry-meta">
			<span class="comments-link"><a href="{{path}}#respond">Leave a comment</a></span>
		</footer><!-- .entry-meta -->
	</article><!-- #post-{{id}} -->`;
	let content = document.getElementById( 'site-content' );
	let pagination_wrapper = '<ul id="numeric-pagination">{{{content}}}</ul>';
	let pagination_item = '<li><a href="{{url}}">{{text}}</a></li>';

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
				show_posts_page();
				return;
			}

			let search_string = e.target.value;

			if ( '' === search_string ) {
				return;
			}

			window.history.pushState( 'object or string', 'Search Results for "' + search_string + '"', index.home_url + '/?s=' + search_string );
			show_search_page();
		}
	);

	/**
	 * Handle click events.
	 */
	window.addEventListener(
		'click',
		function( e ) {

			// Get the href.
			let href = '';
			if ( 'undefined' === typeof( e.target.href ) ) {

				if ( 'undefined' === typeof( e.target.parentNode.href ) ) {
					return;
				}

				href = e.target.parentNode.href;
			} else {
				href = e.target.href;
			}

			let raw_path = href.replace( index.home_url, '' );
			path         = raw_path.split( '#' )[0]; // Strip anchor links.

			// If pagination of home page.
			var path_split = path.split( '/' );
			if (
				'/' === path
				||
				'' === path
				||
				(
					path_split[1] === index.pagination_page_text
					&&
					! isNaN( path_split[2] )
				)
			) {
				show_posts_page();
				e.preventDefault();
				return;
			}

			let posts_index = index.posts;
			let results     = posts_index.filter(post => post.path == path );

			show_results( '{{main_content}}', content, results, single_template );

			window.history.pushState( 'object or string', results[0].title, raw_path );

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
			'/hellish-simplicity.json',
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
	function show_results( wrapper_template, content, results, template ) {

		let page_content = '';
		for ( let i = 0; i < results.length; i++ ) {
			let result = [];

			result.id            = results[ i ]['id'];
			result.slug          = results[ i ]['slug'];
			result.path          = results[ i ]['path'];
			result.title         = results[ i ]['title'];
			result.excerpt       = results[ i ]['excerpt'];
			result.content       = results[ i ]['content'];
			result.date          = date( index.date_format, results[ i ]['timestamp'] );
			result.modified_date = results[ i ]['modified_timestamp'];
			result.term_ids      = results[ i ]['term_ids'];

			// Authors.
			let author_id              = results[ i ]['author_id'];
			result.author_id           = author_id;
			authors_list               = JSON.parse( index.authors );
			result.author              = authors_list[ author_id ];
			result.author.display_name = result.author.display_name;

			if ( 'page' === results[ i ].post_type ) {
//				let template = single_template;
			} else {
//				if ( 'page' === results[ i ].post_type ) {
			}

			page_content = page_content + Mustache.render( template, result );
		}

		let rendered_content = wrapper_template.replace( '{{main_content}}', page_content );
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
			results[ i ] = fuse_results[ i ]['item'];
		}

		search_template  = `
		<h1 class="page-title">
			Search Results for: &quot;` + get_search_param() + `&quot; ...
		</h1><!-- .page-title -->

		{{main_content}}`;

		show_results( search_template, content, results, excerpt_template );
	}

	/**
	 * Display the posts page.
	 */
	function show_posts_page() {
		let results = [];
		let key     = 0;
		let counter = 0;

		// Calculate pagination level.
		var path_split = path.split( '/' );
		let pagination = 1;
		if (
			'/' === path
			||
			'' === path
			||
			(
				path_split[1] === index.pagination_page_text
				&&
				! isNaN( path_split[2] )
			)
		) {
			pagination = path_split[2];
console.log( path_split );
console.log( pagination );
		}

		for ( let i = 0; i < index.posts.length; i++ ) {

console.log( 'i: ' + i + '; pagination: ' + pagination + '; index.posts_per_page: ' + index.posts_per_page );

			// If not on a 'post', then ignore it.
			if ( 'post' !== index.posts[ i ].post_type ) {
				continue;
			}

			// If sticky put on front.
/*			if (
				true === index.posts[ i ].sticky 
				&&
				1 === pagination
			 ) {
				results.unshift( index.posts[ i ] );
				key++;
			} else if (
				i < index.posts_per_page
				&&
				1 === pagination
			) {
				results[ key ] = index.posts[ i ];
				key++;
			} else 
			*/
i = parseInt( i );
pagination = parseInt( pagination );
index.posts_per_page = parseInt( index.posts_per_page );
if ( isNaN( i ) ) {
	console.log( 'not a number i' );
	console.log( i );
}
if ( isNaN( pagination ) ) {
	console.log( 'not a number pag' );
	console.log( pagination );
}
if ( isNaN( index.posts_per_page ) ) {
	console.log( 'not a number index' );
	console.log( index.posts_per_page );
}

			if (
//				1 !== pagination
//				&&
//				(
//				i >= ( ( pagination - 1 ) * index.posts_per_page )
//				&&
//3 < ( 2 * 3 )
				i < ( pagination * index.posts_per_page )
//				)
			) {
				results[ key ] = index.posts[ i ];
console.log( 'SUCCESS key: ' + key + '; index.posts[ i ]: ' + index.posts[ i ] + '; i: ' + i );
				key++;
			} else {
console.log( 'FAIL key: ' + key + '; index.posts[ i ]: ' + index.posts[ i ] + '; i: ' + i );
			}

			counter++;
		}

//index.posts_per_page

console.log( results );
console.log('-------------');
		pagination_wrapper = pagination_wrapper.replace( '{{{content}}}', show_pagination( counter ) );

		// Get URL based on pagination.
		let url = index.home_url;
		if (
			1 !== get_current_pagination_number()
			&&
			'' !== get_current_pagination_number()
			&&
			! isNaN( get_current_pagination_number() )
		) {
			url = index.home_url + '/' + index.pagination_page_text + '/' + get_current_pagination_number() + '/';
		}

		window.history.pushState( 'object or string', index.home_title, url );

		show_results( '{{main_content}}' + pagination_wrapper, content, results, excerpt_template );
	}

	/**
	 * Show the pagination.
	 *
	 * @param int counter The number of items to paginate.
	 * @return string pagination_items The pagination items.
	 */
	function show_pagination( counter ) {
		let number_of_pages      = Math.ceil( counter / index.posts_per_page );
		let this_pagination_item = '';
		let pagination_items     = '';
		let spacer               = null;

		for ( let i = 1; i <=  number_of_pages; i++ ) {

			// Add spacer.
			let gap = i - get_current_pagination_number();
			if (
				( Math.abs( gap ) > 2 ) // only show items in batches of 3.
				&&
				number_of_pages !== ( gap + 1 )
				&&
				1 !== i
				&&
				number_of_pages !== i
			) {

				if ( null !== spacer ) {
					continue;
				}

				pagination_items = pagination_items + '<li>&#8230;</li>';
				spacer           = i;
				continue;
			}

			// Set item HTML.
			this_pagination_item = pagination_item.replace( '{{text}}', i );
			this_pagination_item = this_pagination_item.replace( '{{url}}', index.home_url + '/' + index.pagination_page_text + '/' + i + '/' );

			// Set current page as active.
			if ( get_current_pagination_number() === i ) {
				spacer               = null;
				this_pagination_item = this_pagination_item.replace( '<li>', '<li class="active">' );
			}

			pagination_items = pagination_items + this_pagination_item;
		}

		// Show previous button.
		if ( 1 !== get_current_pagination_number() ) {
			pagination_items = '<li><a href="' + index.home_url + '/">' + index.prev_button_text + '</a></li>' + pagination_items;
		}

		// Show next button.
		if ( number_of_pages !== get_current_pagination_number() ) {
			pagination_items = pagination_items + '<li><a href="' + index.home_url + '/' + index.pagination_page_text + '/' + ( get_current_pagination_number() + 1 ) + '/">' + index.next_button_text + '</a></li>';
		}

		return pagination_items;
	}

	/**
	 * Get the current pagination number.
	 *
	 * @return int The page number.
	 */
	function get_current_pagination_number() {
		let path = window.location.href.replace( index.home_url, '' );
		let number;
		number = path.replace( '/' + index.pagination_page_text + '/', '' );
		number = number.replace( '/', '' );

		return number;
	}

}

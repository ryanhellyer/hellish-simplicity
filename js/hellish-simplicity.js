// NEEDS TO CHECK FOR CLICKS, THEN LOAD URLS ACCORDINGLY.

window.onload=function() {
	let fuse;
	let list;
	let template = `
	<article id="post-{{id}}" class="post-{{id}} post type-post status-publish format-standard hentry">
		<header class="entry-header">
			<h2 class="entry-title">
				<a href="{{path}}" title="Permalink to {{title}}" rel="bookmark">
					{{title}}
				</a>
			</h2><!-- .entry-title -->
		</header><!-- .entry-header -->
		<div class="entry-content">
			{{excerpt}}
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
//console.log( e.target.href );
			let path = e.target.href.replace( home_url, '' );

			let results = list.filter(post => post.path == path )

			set_result( content, results );

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
				let results = fuse.search( 'test' );

				set_result( content, results );
			}
		};

		request.send();
	}

	/**
	 * Run search query.
	 */
	function set_result( content, results ) {
		content.innerHTML = '';
		for ( let i = 0; i < results.length; i++ ) {
			let result = [];

			result.id      = results[i]['id'];
			result.path    = results[i]['path'];
			result.title   = results[i]['title'];
			result.excerpt = results[i]['excerpt'];

			content.innerHTML = content.innerHTML + Mustache.render( template, result );
		}
	}

}

/*
		for ( let i = 0; i < results.length; i++ ) {
			let result = [];

			result.id      = results[i]['item']['id'];
			result.path    = results[i]['item']['path'];
			result.title   = results[i]['item']['title'];
			result.excerpt = results[i]['item']['excerpt'];

			content.innerHTML = content.innerHTML + Mustache.render( template, result );
		}
*/
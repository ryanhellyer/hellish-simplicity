// NEEDS TO CHECK FOR CLICKS, THEN LOAD URLS ACCORDINGLY.

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

console.log( list );
let blax = list.filter(post => post.path == '/sample-page/' )
console.log( blax );

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
				results = fuse.search( 'test' );

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

				for ( let i = 0; i < results.length; i++ ) {
					let result = [];
					result.id      = results[i]['item']['id'];
					result.path    = results[i]['item']['path'];
					result.title   = results[i]['item']['title'];
					result.excerpt = results[i]['item']['excerpt'];

					content.innerHTML = Mustache.render( template, result );
				}

			}
		};

		request.send();
	}

	search_query();

}
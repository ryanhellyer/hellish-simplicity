window.addEventListener(
	'load',
	function( event ) {
		let index;

		let content           = document.getElementById( 'site-content' );
		let scroll_to_element = document.getElementById( 'main' );

		get_index();

		/**
		 * Add class to body tag (to allow us to style site based on JS being on or not.
		 */
		let body = document.body;
		body.classList.add( 'js' );

		/**
		 * Handle click events.
		 * Also handles ENTER clicks during keyboard navigation.
		 */
		window.addEventListener(
			'click',
			function( e ) {
				let href, found;

				// Bail out now if index not built yet.
				if ( typeof index === 'undefined' ) {
					return;
				}

				// Get the href.
				href = '';
				if ( 'undefined' !== typeof( e.target.href ) ) {
					href = e.target.href;
				} else if ( 'undefined' !== typeof( e.target.parentNode.href ) ) {
					href = e.target.parentNode.href;
				} else if ( 'undefined' !== typeof( e.target.parentNode.parentNode.href ) ) {
					href = e.target.parentNode.parentNode.href;
				}

				// If href is empty, then bail.
				if ( '' === href ) {
					return;
				}

				// Get the raw path.
				let raw_path = href.replace( index.home_url, '' );

				path = strip_anchor_and_query_vars( raw_path );

				// Handle paths
				if ( is_post( path ) ) {
					display_post( path );

					found = true;
				} else if ( is_archive( path ) ) {
					display_archive( path );
						// MAYBE SHOULD ADD EACH ARCHIVE TYPE HERE INDIVIDUALLY INSTEAD OF COMBINED.
					found = true;
				}

				// If a page was found, then stop the page refreshing.
				if ( true === found ) {
					scroll_to_element.scrollIntoView();

const title = 'something';

					window.history.pushState( 'object or string', title, raw_path );
					document.title  = title; // Required due to pushstate not supporting title tag changes ... https://github.com/whatwg/html/issues/2174*/

					e.preventDefault();
					return;
				}
			}
		);

		/**
		 * Get the index.
		 */
		function get_index() {
			const request = new XMLHttpRequest();
			request.open(
				'GET',
				'/hellish-simplicity.json',
				true
			);

			request.setRequestHeader( 'Content-type', 'application/json' );
			request.onreadystatechange = function() {
				if ( request.readyState == 4 && request.status == 200 ) {
					index = JSON.parse( request.responseText );

					console.log( index );

				}
			};

			request.send();
		}

		/**
		 * Is it a post?
		 *
		 * @param string path.
		 * @return bool true if is a post.
		 */
		function is_post( path ) {

			if ( null === get_post( path ) ) {
				return false;
			} else {
				return true;
			}

		}

		/**
		 * Get post data from path.
		 *
		 * @param string path.
		 * @return object The post data.
		 */
		function get_post( path ) {
			let result;
			let posts = index.posts;
			let post  = posts.filter( post => post.path == path );
			if ( 1 === post.length ) {
				post = post[0];

				return post;
			}

			return null;
		}

		/**
		 * Get post data from ID.
		 *
		 * @param string post_id.
		 * @return object The post data.
		 */
		function get_post_from_id( post_id ) {
			let result;
			let posts = index.posts;
			let post  = posts.filter( post => post.id == post_id );
			if ( 1 === post.length ) {
				post = post[0];

				return post;
			}

			return null;
		}

		/**
		 * Is it an archive?
		 *
		 * @param string path.
		 * @return bool true if is an archive.
		 */
		function is_archive( path ) {

			if ( is_home_archive( path ) ) {
				return true
			} else if ( is_term_archive( path ) ) {
				return true;
			} else if ( is_date_archive( path ) ) {
				return true;
			}

			return false;
		}

		/**
		 * Get archive data from path.
		 *
		 * @param string path.
		 * @return object The archive data.
		 */
		function get_archive( path ) {

			if ( is_home_archive( path ) ) {
				return get_home_archive( path );
			} else if ( is_term_archive( path ) ) {
				return get_term_archive( path );
			} else if ( is_date_archive( path ) ) {
				return get_date_archive( path );
			}

			// Check if it's a date archive.

			return null;
		}

		/**
		 * Get posts for home page.
		 *
		 * @param string path.
		 * @return object The posts.
		 */
		function get_home_archive( path ) {
			let archive = [];
			archive.title = 'home page yo';
			archive.name = 'home name yo';

			let posts     = get_posts_of_post_type( 'post', index.posts );
			let post_ids  = get_post_ids_from_posts( posts ); // Avoids storing the post data separately.

			post_ids = strip_post_ids_for_pagination( path, post_ids );

			archive.post_ids = post_ids;

			return archive;
		}

		/**
		 * Get posts for a term archive.
		 *
		 * @param string path.
		 * @return object The posts.
		 */
		function get_term_archive( path ) {
			let archive = [];

//			path = strip_anchor_and_query_vars( path );

			let base_path = strip_pagination( path );
			let terms = index.terms;
			let term  = terms.filter( term => term.path == base_path );

			if ( 1 === term.length ) {
				term = term[0];

				archive.title = term.name + ' term archive page yo';
				archive.name = term.name + 'term archive name yo';

				let posts;
				posts = get_posts_with_term( term.id, index.posts );
				posts = get_posts_of_post_type( 'post', posts );

				let post_ids  = get_post_ids_from_posts( posts ); // Avoids storing the post data separately.

				post_ids = strip_post_ids_for_pagination( path, post_ids );

				archive.post_ids = post_ids;

				return archive;
			}

			return false;
		}

		/**
		 * Get posts for a date archive.
		 *
		 * @param string path.
		 * @return object The posts.
		 */
		function get_date_archive( path ) {
			let archive = [];

			let base_path = strip_pagination( path );
			const split   = base_path.split( '/' );
			const year    = split[1];

			archive.title = year + ' date archive page yo';
			archive.name  = year + ' date archive name yo';

			let posts;
			posts = get_posts_from_year( year, index.posts );
			posts = get_posts_of_post_type( 'post', posts );

			let post_ids  = get_post_ids_from_posts( posts ); // Avoids storing the post data separately.

			post_ids = strip_post_ids_for_pagination( path, post_ids );

			archive.post_ids = post_ids;

			return archive;
		}

		/**
		 * Strip post IDs for pagination.
		 * 
		 * @param string path The path.
		 * @param array post_ids The post IDs.
		 * @return array Only post IDs for the desired pagination.
		 */
		function strip_post_ids_for_pagination( path, post_ids ) {
			let page  = get_pagination( path );
			let limit = index.posts_per_page * page;
			if ( limit > post_ids.length ) {
				limit = post_ids.length;
			}

			let start = ( page - 1 ) * index.posts_per_page;

			let new_post_ids = [];
			let x = 0;
			for ( let i = start; i < limit; i++ ) {

				new_post_ids[ x ] = post_ids[ i ];
				x++;
			}

			return new_post_ids;
		}

		/**
		 * Is this a home archive?
		 *
		 * @param string path.
		 * @return bool true if this is the home archive.
		 */
		function is_home_archive( path ) {
			path = strip_pagination( path );

			if ( '/' === path ) {
				return true;
			}

			return false;
		}

		/**
		 * Is this a path for a term archive?
		 *
		 * @param string path.
		 * @return bool true if is a term archive.
		 */
		function is_term_archive( path ) {
			path = strip_pagination( path );

			let terms = index.terms;
			let term  = terms.filter( term => term.path == path );
			if ( 1 === term.length ) {
				return true;
			}

			return false;
		}

		/**
		 * Is this a path for a date archive?
		 *
		 * @param string path.
		 * @return bool true if is a date archive.
		 */
		function is_date_archive( path ) {
			path = strip_pagination( path );

			let dates = index.date_archives;

			if ( dates.indexOf( path ) !== -1 ) {
				return true;
			}

			return false;
		}

		/**
		 * Strip pagination string from end of path.
		 * 
		 * @param string path The path.
		 * @return string The path without pagination string.
		 */
		function strip_pagination( path ) {
			let split = path.split( '/' );

			if (
				is_a_number( split[ split.length - 2 ] )
				&&
				index.pagination_page_text === split[ split.length - 3 ]
			) {

				split.pop().pop;
				split.pop().pop;
				split.pop().pop;

				path = split.join( '/' ) + '/';

				return path;
			}

			return path;
		}

		/**
		 * Get the pagination number.
		 * 
		 * @param string path The path.
		 * @return int The pagination number.
		 */
		function get_pagination( path ) {
//			path = strip_anchor_and_query_vars( path );

			let split = path.split( '/' );
			if (
				is_a_number( split[ split.length - 2 ] )
				&&
				index.pagination_page_text === split[ split.length - 3 ]
			) {
				return split[ split.length - 2 ];
			}

			return 1;
		}

		/**
		 * Strip anchors and query variables from the path.
		 *
		 * @param string The path.
		 * @return string The modified path.
		 */
		function strip_anchor_and_query_vars( path ) {
			path = path.split( '?' )[0];
			path = path.split( '#' )[0];

			return path;
		}

		/**
		 * Is this a number?
		 * Works with strings too.
		 * 
		 * @param string|int|number value The input number.
		 * @return bool true if it is a number.
		 */
		function is_a_number( value ){
			return !isNaN( value )
		}

		/**
		 * Get posts with a specific term.
		 *
		 * @param string term_id The term ID.
		 * @param object posts The posts.
		 * @return object The filtered posts.
		 */
		function get_posts_with_term( term_id, posts ) {
			let posts_with_term = [];

			let x = 0;
			for ( let i = 0; i < posts.length; i++ ) {
				let term_ids = posts[ i ].term_ids;
				if ( term_ids.indexOf( term_id ) != -1 ) {
					posts_with_term[ x ] = posts[ i ];
					x++;
				}
			}

			return posts_with_term;
		}

		/**
		 * Get posts with a specific term.
		 *
		 * @param string year The year.
		 * @param object posts The posts.
		 * @return object The filtered posts.
		 */
		function get_posts_from_year( year, posts ) {
			let posts_from_year = [];

			let x = 0;
			for ( let i = 0; i < posts.length; i++ ) {
				const post = posts[ i ];

				const posts_year = date( 'Y', post.timestamp );
				if ( posts_year === year ) {
					posts_from_year[ x ] = posts[ i ];
					x++;
				}

			}

			return posts_from_year;
		}

		/**
		 * Get posts from a specific post-type.
		 *
		 * @param string post_type The post type.
		 * @param object posts The posts.
		 * @return object The filtered posts.
		 */
		function get_posts_of_post_type( post_type, posts ) {
			let posts_of_post_type = [];

			let x = 0;
			for ( let i = 0; i < posts.length; i++ ) {

				// If not on the correct post-type, then ignore it.
				if ( post_type === posts[ i ].post_type ) {
					posts_of_post_type[ x ] = posts[ i ];
					x++;
				}
			}

			return posts_of_post_type;
		}

		/**
		 * Get post_ids from post data.
		 *
		 * @param object posts The posts.
		 * @return object The post IDs.
		 */
		function get_post_ids_from_posts( posts ) {
			let post_ids = [];

			for ( let i = 0; i < posts.length; i++ ) {
				post_ids[ i ] = posts[ i ].id;
			}

			return post_ids;
		}

		/**
		 * Display a single post.
		 *
		 * @param string path.
		 */
		function display_post( path ) {
			let page_content  = Mustache.render( index.templates.single_post, get_post( path ) );
			content.innerHTML = page_content;
		}

		/**
		 * Display an archive.
		 *
		 * @param string path The archives path.
		 */
		function display_archive( path ) {
			let data     = get_archive( path );
			let template = index.templates.archive;
			template     = template.replace( '{{title}}', data.name );

 			// Get the HTML for all of the excerpts.
			let archive = '';
			let i = 0;
			while( i < data.post_ids.length ) {

				let post_id   = data.post_ids[ i ];
				let post      = get_post_from_id( post_id );
				let post_html = Mustache.render( index.templates.excerpt, post );

				archive = archive + post_html;

				i++
			}
			template = template.replace( '{{archive}}', archive );

			content.innerHTML = template;
		}

		/**
		 * Debounce function.
		 * Adapted from underscore.js
		 * https://github.com/jashkenas/underscore
		 *
		 * @license MIT
		 *
		 * @param string func The function to debounce.
		 * @param int wait How long to wait, in milliseconds.
		 * @param bool int If it's meant to be immediate, then do it now.
		 */
		function debounce( func, wait, immediate ) {
			let timeout;
			return function() {
				const context = this, args = arguments;
				const later = function() {
					timeout = null;
					if ( ! immediate) {
						func.apply( context, args );
					}
				};
				if ( immediate && ! timeout ) {
					func.apply( context, args );
				}

				clearTimeout( timeout );
				timeout = setTimeout( later, wait );
			};
		};

	}
);

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

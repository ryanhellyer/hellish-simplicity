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

				// Get the rath path.
				let raw_path = href.replace( index.home_url, '' );
				path         = raw_path.split( '#' )[0]; // Strip anchor links.

				// Handle paths
				if ( is_post( path ) ) {
					display_post( path );

					found = true;
				} else if ( is_archive( path ) ) {
					display_archive( path );

					found = true;
				}

				// If a page was found, then stop the page refreshing.
				if ( true === found ) {
					scroll_to_element.scrollIntoView();

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
			// Check if it's a term archive.
			let terms = index.terms;
			let term  = terms.filter( term => term.path == path );
			if ( 1 === term.length ) {
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

			if ( is_term_archive( path ) ) {
				return get_term_archive( path );
			}

			// Check if it's a date archive.

			return null;
		}

		function is_term_archive( path ) {
			return true;
		}

		function get_term_archive( path ) {
			let terms = index.terms;
			let term  = terms.filter( term => term.path == path );
			if ( 1 === term.length ) {
				term = term[0];

				let posts;
				posts = get_posts_with_term( term.id, index.posts );
				posts = get_posts_of_post_type( 'post', posts );

				let post_ids  = get_post_ids_from_posts( posts ); // Avoids storing the post data separately.
				term.post_ids = post_ids;

				return term;
			}

			return false;
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
			let page_content = Mustache.render( index.templates.single_post, get_post( path ) );
			content.innerHTML    = page_content;
		}

		/**
		 * Display an archive.
		 *
		 * @param string The post title.
		 * @param string The paths in the archive.
		 * @param int The page of pagination.
		 */
		function display_archive( title, paths, page = 1 ) {
			let data = get_archive( path );

			let template = index.templates.archive;
			template = template.replace( '{{title}}', data.name );

			// Get the HTML for all of the excerpts.
			let archive = '';
			for ( let i = 0; i < data.post_ids.length; i++ ) {

				let post_id = data.post_ids[ i ];
				let post = get_post_from_id( post_id );

				let post_html = Mustache.render( index.templates.excerpt, post );

				archive = archive + post_html;
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

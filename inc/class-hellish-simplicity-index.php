<?php
/**
 * Index file.
 * Loads the JSON blob used for generating the site content.
 *
 * @package    Hellish Simplicity
 * @author     Ryan Hellyer <ryanhellyer@gmail.com
 * @copyright  2021 Ryan Hellyer
 */

/**
 * Indexes posts for "one-page-app" functionality.
 *
 * @copyright Copyright (c), Ryan Hellyer
 * @license http://www.gnu.org/licenses/gpl.html GPL
 * @author Ryan Hellyer <ryanhellyer@gmail.com>
 * @package Hellish Simplicity
 * @since Hellish Simplicity 2.2
 */
class Hellish_Simplicity_Index {

	/**
	 * Constructor.
	 */
	public function __construct() {

		if ( isset( $_SERVER['REQUEST_URI'] ) && '/hellish-simplicity.json' === $_SERVER['REQUEST_URI'] ) {
			add_action( 'init', array( $this, 'create_index' ) );
		}

	}

	/**
	 * Grabs list of all posts.
	 */
	public function create_index() {

		header( 'Content-Type: application/json' );

		$index = array(
			'home_url'             => esc_url( home_url() ),
			'taxonomies'           => $this->get_taxonomies_index(),
			'terms'                => $this->get_terms_index(),
			'posts'                => $this->get_posts_index(),
			'date_archives'        => $this->get_date_archives_index(),
			'date_format'          => esc_html( get_option( 'date_format' ) ),
			'home_title'           => esc_html( get_option( 'blogname' ) ) . ' &#8211; ' . esc_js( get_option( 'blogdescription' ) ),
			'posts_per_page'       => absint( get_option( 'posts_per_page' ) ),
			'pagination_page_text' => esc_html__( 'page', 'hellish-simplicity' ),
			'prev_button_text'     => esc_html__( '&laquo; Previous', 'hellish-simplicity' ),
			'next_button_text'     => esc_html__( 'Next &raquo;', 'hellish-simplicity' ),
			'templates'            => $this->get_templates(),
		);

		echo wp_json_encode( $index, JSON_PRETTY_PRINT );
		die;
	}

	/**
	 * Grabs list of all public taxonomies.
	 */
	public function get_taxonomies_index() {

		$taxonomies = array();
		foreach ( $this->get_public_taxonomies() as $taxonomy ) {
			$taxonomy_data = get_taxonomy( $taxonomy );

			$taxonomies[] = array(
				'name'        => $taxonomy_data->name,
				'label'       => $taxonomy_data->label,
				'description' => $taxonomy_data->description,
			);

		}

		return $taxonomies;
	}

	/**
	 * Grabs list of all taxonomy terms with posts.
	 */
	public function get_terms_index() {

		$terms = array();
		foreach ( $this->get_public_taxonomies() as $taxonomy ) {
			$new_terms = get_terms(
				$taxonomy,
				array(
					'hide_empty' => false,
				)
			);

			foreach ( $new_terms as $term_data ) {

				$terms[] = array(
					'id'       => $term_data->term_id,
					'path'     => str_replace( home_url(), '', get_term_link( $term_data ) ),
					'name'     => $term_data->name,
					'slug'     => $term_data->slug,
					'taxonomy' => $term_data->taxonomy,
				);
			}
		}

		return $terms;
	}

	/**
	 * Grabs list of all posts.
	 *
	 * @global object $wpdb The WordPress database object.
	 */
	public function get_posts_index() {
		global $wpdb;

		$post_types           = array( 'post', 'page' );
		$post_type_string     = "'" . implode( "','", $post_types ) . "'";
		$post_statuses        = array( 'publish' );
		$post_statuses_string = "'" . implode( "','", $post_statuses ) . "'";
		$posts_table_name     = "{$wpdb->prefix}posts";
		$rel_table_name       = "{$wpdb->prefix}term_relationships";
		$term_tax_table_name  = "{$wpdb->prefix}term_taxonomy";
		$taxonomies           = get_taxonomies( array( 'public' => true ) );
		$taxonomies_string    = '("' . implode( '","', $taxonomies ) . '")';
// QUERY SHOULD BE SIMPLIFIED
		$query_string =
			'SELECT p.*, GROUP_CONCAT(tt.term_id) as term_ids FROM `' . $posts_table_name . '` AS p '
			. 'LEFT JOIN `' . $rel_table_name . '` tr ON tr.object_id = p.id '
			. 'LEFT JOIN `' . $term_tax_table_name . '` tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy IN '
			. $taxonomies_string . ' '
			. ' WHERE post_status IN ( ' . $post_statuses_string . ' ) 
			AND post_type IN ( ' . implode( ',', array_fill( 0, count( $post_types ), '%s' ) ) . ' ) '
			. 'GROUP BY p.id';

		$query = $wpdb->prepare( $query_string, $post_types );

		$posts = $wpdb->get_results( $query );

		$post_index = array();
		foreach ( $posts as $key => $post ) {

			// Collect the term IDs.
			$term_ids = array();
			foreach ( (array) $post->term_ids as $key => $term_id ) {
				$term_ids[] = absint( $term_id );
			}

			/*
			// Work out if sticky or not.
			$sticky = false;
			if ( is_sticky( $post->ID ) ) {
				$sticky = true;
			}
			*/

			$post_index[] = array(
				'id'                 => absint( $post->ID ),
				'path'               => esc_html( str_replace( home_url(), '', get_permalink( $post ) ) ),
				//'author_id'          => absint( $post->post_author ),
				'timestamp'          => strtotime( $post->post_date_gmt ),
				'content'            => apply_filters( 'the_content', wp_kses_post( $post->post_content ) ),
				'title'              => wp_kses_post( $post->post_title ),
				'excerpt'            => apply_filters( 'the_content', wp_kses_post( $this->get_the_excerpt( $post ) ) ),
				'slug'               => esc_attr( $post->post_name ),
				'modified_timestamp' => strtotime( $post->post_modified_gmt ),
				'term_ids'           => $term_ids,
				'post_type'          => esc_html( $post->post_type ),
				//'sticky'             => $sticky,
			);

		}

		// Put posts in order of timestamp.
		usort(
			$post_index,
			function( $a, $b ) {
				return $b['timestamp'] <=> $a['timestamp'];
			}
		);

		return $post_index;
	}

	/**
	 * Grabs list of all date archives.
	 */
	private function get_date_archives_index() {
		$archive_html = '';
		$types        = array( 'yearly', ); // Also possible are 'daily' and 'monthly'. 
		foreach ( $types as $type ) {
			$archive_html .= wp_get_archives(
				array(
					'type'   => $type,
					'format' => 'custom',
					'echo'   => false,
				)
			);
		}
		$archive_blobs = explode( "	<a href='" . home_url(), $archive_html );
		$paths = array();
		foreach ( $archive_blobs as $key => $blob ) {
			$blob = explode( "'>", $blob );
			if ( ! empty( $blob[0] ) ) {
				$paths[] = $blob[0];
			}

		}

		return $paths;
	}

	private function get_templates() {
		$templates = array(
			'excerpt' => '
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
	</article><!-- #post-{{id}} -->',

		'single_post' => '
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
	</article><!-- #post-{{id}} -->',

			'archive' => '
		<h1 class="page-title">
			{{title}}
		</h1><!-- .page-title -->

		{{archive}}',

		);

		return $templates;
	}

	/**
	 * Return the post excerpt, if one is set, else generate it using the
	 * post content. If original text exceeds $num_of_words, the text is
	 * trimmed and an ellipsis (…) is added to the end.
	 *
	 * Based on https://gist.github.com/kellenmace/6209d5f1e465cdcc800e690b472f8f16.
	 *
	 * @param object $post The WordPress post object.
	 * @return string The generated excerpt.
	 */
	private function get_the_excerpt( $post ) {
		$text = get_the_excerpt( $post );

		if ( ! $text ) {
			$text = $post->post_content;
		}

		$generated_excerpt = wp_trim_words( $text, 55 );

		return apply_filters( 'get_the_excerpt', $generated_excerpt, $post );
	}


	/**
	 * Get public taxonomies.
	 *
	 * @return array The public taxonomies.
	 */
	private function get_public_taxonomies() {

		$args = array(
			'public'   => true,
			'_builtin' => true,
		);

		$taxonomies = array();
		foreach( get_taxonomies( $args ) as $taxonomy ) {
			$taxonomies[] = $taxonomy;
		}

		return $taxonomies;
	}

}

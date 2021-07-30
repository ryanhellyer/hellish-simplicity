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
 * Indexes the posts for use by FuseJS.
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
			$this->create_index();
		}
	}

	/**
	 * Grabs list of all posts.
	 *
	 * @global object $wpdb The WordPress database object.
	 */
	public function create_index() {
		header( 'Content-Type: application/json' );

		$users = get_users();
		foreach ( $users as $key => $user ) {
			$user_id = absint( $user->data->ID );

			if ( 0 < count_user_posts( $user_id ) ) {
				$authors[ $user_id ] = array(
					'display_name' => esc_html( $user->data->display_name ),
					'url'          => esc_url( str_replace( home_url(), '', get_author_posts_url( $user->data->ID ) ) ),
				);
			}
		}

		$index = array(
			'home_url'             => esc_url( home_url() ),
			'posts'                => $this->index_posts(),
			'authors'              => wp_json_encode( $authors ),
			'date_format'          => esc_html( get_option( 'date_format' ) ),
			'home_title'           => esc_html( get_option( 'blogname' ) ) . ' &#8211; ' . esc_js( get_option( 'blogdescription' ) ),
			'posts_per_page'       => absint( get_option( 'posts_per_page' ) ),
			'pagination_page_text' => esc_html__( 'page', 'hellish-simplicity' ),
			'prev_button_text'     => esc_html__( '&laquo; Previous', 'hellish-simplicity' ),
			'next_button_text'     => esc_html__( 'Next &raquo;', 'hellish-simplicity' ),
		);

		echo wp_json_encode( $index );
		die;
	}

	/**
	 * Grabs list of all posts.
	 *
	 * @global object $wpdb The WordPress database object.
	 */
	public function index_posts() {
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

			// Work out if sticky or not.
			$sticky = false;
			if ( is_sticky( $post->ID ) ) {
				$sticky = true;
			}

			$post_index[] = array(
				'id'                 => absint( $post->ID ),
				'path'               => esc_html( str_replace( home_url(), '', get_permalink( $post ) ) ),
				'author_id'          => absint( $post->post_author ),
				'timestamp'          => strtotime( $post->post_date_gmt ),
				'content'            => apply_filters( 'the_content', wp_kses_post( $post->post_content ) ),
				'title'              => wp_kses_post( $post->post_title ),
				'excerpt'            => apply_filters( 'the_content', wp_kses_post( $this->get_the_excerpt( $post ) ) ),
				'slug'               => esc_attr( $post->post_name ),
				'modified_timestamp' => strtotime( $post->post_modified_gmt ),
				'term_ids'           => $term_ids,
				'post_type'          => esc_html( $post->post_type ),
				'sticky'             => $sticky,
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

}

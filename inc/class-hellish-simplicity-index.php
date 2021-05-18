<?php

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

		if ( '/hellish-simplicity-index/' === $_SERVER['REQUEST_URI'] ) {
			$this->index_posts();
		}
	}

	/**
	 * Grabs list of all posts.
	 *
	 * @param bool $search Whether to return search data or not.
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
			AND post_type IN ( ' . implode(',', array_fill(0, count( $post_types ), '%s') ) . ' ) '
			. 'GROUP BY p.id';

		$query = $wpdb->prepare( $query_string, $post_types );

		$posts = $wpdb->get_results( $query );

		$index = array();
		foreach ( $posts as $key => $post ) {

			$term_ids = array();
			foreach ( (array) $post->term_ids as $key => $term_id ) {
				$term_ids[] = absint( $term_id );
			}

			$index[] = array(
				'id'                 => absint( $post->ID ),
				'path'               => esc_html( str_replace( home_url(), '', get_permalink( $post ) ) ),
				'author_id'          => absint( $post->post_author ),
				'timestamp'          => strtotime( $post->post_date_gmt ),
				'content'            => wp_kses_post( $post->post_content ),
				'title'              => esc_html( $post->post_title ),
				'excerpt'            => wp_kses_post( $post->post_excerpt ),
				'slug'               => esc_attr( $post->post_name ),
				'modified_timestamp' => strtotime( $post->post_modified_gmt ),
				'term_ids'           => $term_ids,
			);
		}


		echo json_encode( $index );
		die;
	}

}

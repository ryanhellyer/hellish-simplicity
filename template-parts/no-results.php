<?php

/**
 * The template part for displaying a message that posts cannot be found.
 *
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package Hellish Simplicity
 * @since Hellish Simplicity 1.1
 */

// Set heading tags
if ( is_search() ) {
	$post_heading_tag = 'h2';
} else {
	$post_heading_tag = 'h1';
}

?>

<article id="post-0" class="post no-results not-found last-post">
	<header class="entry-header">
		<<?php echo $post_heading_tag; // WPCS: XSS OK. ?> class="entry-title"><?php esc_html_e( 'Nothing Found', 'hellish-simplicity' ); ?></<?php echo $post_heading_tag; // WPCS: XSS OK. ?>>
	</header><!-- .entry-header -->

	<div class="entry-content">

		<?php if ( is_search() ) {
			echo '<p>' . esc_html__( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'hellish-simplicity' ) . '</p>';
		} else {
			echo '<p>' . esc_html__( 'It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.', 'hellish-simplicity' ) . '</p>';
		}

		get_search_form();
		?>

	</div><!-- .entry-content -->
</article><!-- #post-0 .post .no-results .not-found .last-post -->

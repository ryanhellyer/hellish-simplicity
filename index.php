<?php

/**
 * The main template file.
 *
 * @package Hellish Simplicity
 * @since Hellish Simplicity 1.1
 */

get_header(); ?>

<div id="content-area">
	<div id="site-content" role="main"><?php

// If on search page, then display what we searched for.
if ( is_search() ) { ?>
		<h1 class="page-title">
			<?php printf( esc_html__( 'Search Results for: "%s" ...', 'hellish-simplicity' ), get_search_query() ); ?>
		</h1><!-- .page-title --><?php
}

// Set heading tags.
if ( is_home() || is_search() ) {
	$post_heading_tag = 'h2';
} else {
	$post_heading_tag = 'h1';
}

// Load main loop.
if ( have_posts() ) {

	// Start of the Loop.
	while ( have_posts() ) {
		the_post();
		?>

		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

			<header class="entry-header">
				<<?php echo $post_heading_tag; // WPCS: XSS OK. ?> class="entry-title"><?php

					// Don't display links on singular post titles.
					if ( is_singular() ) {
						the_title();
					} else {
						?><a href="<?php the_permalink(); ?>" title="<?php echo esc_attr( sprintf( __( 'Permalink to %s', 'hellish-simplicity' ), the_title_attribute( 'echo=0' ) ) ); ?>" rel="bookmark"><?php the_title(); ?></a><?php
					}

					?></<?php echo $post_heading_tag; // WPCS: XSS OK. ?>><!-- .entry-title -->
			</header><!-- .entry-header -->

			<div class="entry-content"><?php

				// Display full content for home page and single post pages.
				if ( is_home() || is_singular() ) {
					the_content( esc_html__( 'Continue reading <span class="meta-nav">&rarr;</span>', 'hellish-simplicity' ) );
					wp_link_pages( array( 'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'hellish-simplicity' ), 'after' => '</div>' ) );
				} else {

					// Use the built in thumbnail system, otherwise attempt to display the latest attachment.
					if ( has_post_thumbnail() ) {
						the_post_thumbnail( 'hellish-simplicity-excerpt-thumb' );
					} elseif ( function_exists( 'get_the_image' ) ) {
						get_the_image( array( 'size' => 'thumbnail' ) );
					}
					the_excerpt();
				}
				?>
			</div><!-- .entry-content --><?php

			// Don't display meta information on static pages.
			if ( ! is_page() ) {
				get_template_part( 'template-parts/footer-meta' );
			} ?>

		</article><!-- #post-<?php the_ID(); ?> --><?php

		// If comments are open or we have at least one comment, load up the comment template.
		if ( comments_open() || '0' != get_comments_number() ) {
			comments_template( '', true );
		}

	}

	get_template_part( 'template-parts/numeric-pagination' );

}
else {
	get_template_part( 'template-parts/no-results' );
}
?>

	</div><!-- #site-content --><?php

	// Show sidebar if not on full width template.
	if ( 'full-width.php' != basename( get_page_template() ) ) {
		get_template_part( 'template-parts/sidebar' );
	}

	?>
</div><!-- #content-area -->

<?php get_footer(); ?>
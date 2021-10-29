<?php
/**
 * The Sidebar containing the main widget areas.
 *
 * @package Hellish Simplicity
 * @since Hellish Simplicity 1.1
 */
?>
<div id="sidebar" role="complementary"><?php

	if ( ! dynamic_sidebar( 'sidebar' ) ) { ?>
	<aside>
		<h2 class="widget-title"><?php esc_html_e( 'Recent Posts', 'hellish-simplicity' ); ?></h2>
		<ul><?php
			$recent_posts = wp_get_recent_posts();
			foreach( $recent_posts as $recent ){
				echo '<li><a href="' . esc_url( get_permalink( $recent['ID'] ) ) . '" title="Look ' . esc_attr( $recent['post_title'] ) . '" >' . esc_html( $recent['post_title'] ) . '</a></li>';
			}
		?></ul>
	</aside>
	<aside>
		<h2 class="widget-title"><?php esc_html_e( 'Archives', 'hellish-simplicity' ); ?></h2>
		<ul>
			<?php wp_get_archives( array( 'type' => 'monthly' ) ); ?>
		</ul>
	</aside>
	<aside>
		<h2 class="widget-title"><?php esc_html_e( 'Search', 'hellish-simplicity' ); ?></h2>
		<?php get_search_form(); ?>
	</aside><?php
	}
	?>

</div><!-- #sidebar -->

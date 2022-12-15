<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the id=main div and all content after.
 *
 * @package Hellish Simplicity
 * @since Hellish Simplicity 1.1
 */
?>

</main><!-- #main -->

<footer id="site-footer" role="contentinfo">
	<div class="site-info">
		<?php _e( 'Copyright', 'hellish-simplicity' ); ?> &copy; <?php bloginfo( 'name' ); ?> <?php echo date( 'Y' ); ?>. 
		<?php printf( esc_html__( 'WordPress theme by %s.', 'hellish-simplicity' ), '<a href="https://geek.hellyer.kiwi/" title="Ryan Hellyer">Ryan Hellyer</a>' ); ?>
	</div><!-- .site-info -->
</footer><!-- #site-footer -->

<?php wp_footer(); ?>

<?php
define( 'FINAL_TIME', microtime() );

echo "\n";
echo 'cache_time: ' . ( CACHE_TIME - START_TIME );
echo "\n";
echo 'theme_time: ' . ( THEME_TIME - START_TIME );
echo "\n";
echo 'final_time: ' . ( FINAL_TIME - START_TIME );
echo "\n";

?>

</body>
</html>
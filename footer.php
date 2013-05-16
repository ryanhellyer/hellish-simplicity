<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the id=main div and all content after
 *
 * @package Hellish Simplicity
 * @since Hellish Simplicity 1.1
 */
?>

</div><!-- #main .site-main -->

<footer id="site-footer" role="contentinfo">
	<div id="site-info">
		<?php _e( 'Copyright', 'hellish' ); ?> &copy; <?php bloginfo( 'name' ); ?> <?php echo date( 'Y' ); ?>. 
		<?php _e( 'WordPress theme by', 'hellish' ); ?> <a href="http://geek.ryanhellyer.net/" title="Ryan Hellyer">Ryan Hellyer</a>.
	</div><!-- #site-info -->
</footer><!-- #colophon .site-footer -->

<?php wp_footer(); ?>

</body>
</html>
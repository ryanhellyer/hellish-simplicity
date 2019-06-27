<?php
/**
 * The Header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package Hellish Simplicity
 * @since Hellish Simplicity 1.1
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<?php
if ( 'full-width.php' != basename( get_page_template() ) ) { //we don't show sidebar in full-width template ?>
	<a class="skip-link sr-only-focusable" href="#sidebar"><?php esc_html_e( 'Skip to sidebar', 'hellish-simplicity' ); ?></a>
<?php }
?>

<header id="site-header" role="banner">
	<div class="site-branding">
		<?php

		// Only use H1 tag for home page, since all other pages have their own H1 tag.
		if ( is_home() ) {
			echo '<h1>';
		}

		echo '<a id="page-title" href="' . esc_url( home_url( '/' ) ) . '" title="' . esc_attr( get_bloginfo( 'name', 'display' ) ) . '" rel="home">';
		// Output header text (need fallback to keep WordPress.org them demo happy)
		$header_text = get_option( 'header-text' );
		if ( $header_text ) {
			echo Hellish_Simplicity_Setup::sanitize( $header_text );
		} else {
			echo 'Hellish<span>Simplicity</span><small>.tld</small>';
		}
		echo '</a>';

		// Only use H1 tag for home page, since all other pages have their own H1 tag.
		if ( is_home() ) {
			echo '</h1>';
		}

		?>
		<h2><?php bloginfo( 'description' ); ?></h2>
	</div><!-- .site-branding -->
</header><!-- #site-header -->

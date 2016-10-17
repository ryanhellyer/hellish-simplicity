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

<a class="skip-link screen-reader-text" href="#main"><?php esc_html_e( 'Skip to content', 'hellish-simplicity' ); ?></a>

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

<main id="main">

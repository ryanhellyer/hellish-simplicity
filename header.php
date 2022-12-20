<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Hellish Simplicity
 */

?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">

	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link screen-reader-text" href="#main"><?php esc_html_e( 'Skip to content', 'hellish-simplicity' ); ?></a>

<header id="site-header" role="banner">
	<div class="site-branding">
		<?php

		// Only use H1 tag for home page, since all other pages have their own H1 tag.
		if ( is_home() ) {
			echo '<h1>';
		}

		echo '<a href="' . esc_url( home_url( '/page/2/' ) ) . '">/page/2/</a>';
		echo ' | ';
		echo '<a href="' . esc_url( home_url( '/some/bla/page/2/' ) ) . '">/some/bla/page/2/</a>';
		echo ' | ';
		echo '<a href="' . esc_url( home_url( '/2018/' ) ) . '">/2018/</a>';
		echo ' | ';
		echo '<a href="' . esc_url( home_url( '/2022/' ) ) . '">/2022/</a>';
		echo ' | ';
		echo '<a href="' . esc_url( home_url( '/2018/page/2/' ) ) . '">/2018/page/2/</a>';
		echo ' | ';
		echo '<a href="' . esc_url( home_url( '/2022/page/2/' ) ) . '">/2022/page/2/</a>';
		echo ' | ';
		echo '<a href="' . esc_url( home_url( '/2022a/' ) ) . '">/2022a/</a>';
		echo ' | ';
		echo '<a href="' . esc_url( home_url( '/tag/australia/' ) ) . '">/tag/australia/</a>';
		echo '<a href="' . esc_url( home_url( '/tag/australia/page/2/' ) ) . '">/tag/australia/page/2/</a>';

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

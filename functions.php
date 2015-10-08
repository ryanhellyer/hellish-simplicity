<?php

/**
 * Primary class used to load the Hellish Simplicity theme.
 *
 * @copyright Copyright (c), Ryan Hellyer
 * @license http://www.gnu.org/licenses/gpl.html GPL
 * @author Ryan Hellyer <ryanhellyer@gmail.com>
 * @package Hellish Simplicity
 * @since Hellish Simplicity 1.5
 */
class Hellish_Simplicity_Setup {

	/**
	 * Theme version number.
	 * 
	 * @var string
	 */
	public $version_number = '1.8';

	/**
	 * The default header text.
	 * 
	 * @var string
	 */
	public $default_header_text = 'Custom<span>Header</span><small>.com</small>';

	/**
	 * The header text option name.
	 * 
	 * @var string
	 */
	public $header_text_option = 'header-text';

	/**
	 * Constructor.
	 * Add methods to appropriate hooks and filters.
	 *
	 * @global  int  $content_width  Sets the media widths (unfortunately required as a global due to WordPress core requirements) 
	 */
	public function __construct() {
		global $content_width;
		$content_width = 680;

		// Add action hooks
		add_action( 'admin_init',                                            array( $this, 'add_option' ) );
		add_action( 'after_setup_theme',                                     array( $this, 'theme_setup' ) );
		add_action( 'widgets_init',                                          array( $this, 'widgets_init' ) );
		add_action( 'wp_enqueue_scripts',                                    array( $this, 'stylesheet' ) );
		add_action( 'admin_init',                                            array( $this, 'editor_stylesheet' ) );
		add_action( 'wp_enqueue_scripts',                                    array( $this, 'comment_reply' ) );
		add_action( 'customize_register',                                    array( $this, 'customize_register' ) );
		add_action( 'customize_render_control_' . $this->header_text_option, array( $this, 'customizer_help' ) );
		add_action( 'admin_head',                                            array( $this, 'admin_menu_link' ) );
		add_action( 'admin_bar_menu',                                        array( $this, 'admin_bar_link' ), 999 );

		// Add filters
		add_filter( 'post_class',                                            array( $this, 'add_last_post_class' ) );
	}

	/**
	 * Add the header text option.
	 */
	public function add_option() {
		add_option(
			$this->header_text_option, // The header text option
			$this->default_header_text // The default header text
		);
	}

	/**
	 * Comment reply script.
	 */
	public function comment_reply() {
		if ( is_singular() ) {
			wp_enqueue_script( 'comment-reply' );
		}
	}

	/**
	 * Load editor stylesheet.
	 */
	public function editor_stylesheet() {
		add_editor_style( 'editor-style.css' );
	}

	/**
	 * Load stylesheet.
	 */
	public function stylesheet() {
		if ( ! is_admin() ) {
			wp_enqueue_style( 'style', get_stylesheet_directory_uri() . '/style.min.css', array(), $this->version_number );
		}
	}

	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 */
	public function theme_setup() {

		// Make theme available for translation
		load_theme_textdomain( 'hellish-simplicity', get_template_directory() . '/languages' );

		// Add default posts and comments RSS feed links to head
		add_theme_support( 'automatic-feed-links' );

		// Add title tags
		add_theme_support( 'title-tag' );

		// Enable support for Post Thumbnails
		add_theme_support( 'post-thumbnails' );
		add_image_size( 'excerpt-thumb', 250, 350 );
		add_image_size( 'attachment-page', 1000, 1500 );
	}

	/**
	 * Register widgetized area and update sidebar with default widgets.
	 */
	public function widgets_init() {
		register_sidebar(
			array(
				'name'          => __( 'Sidebar', 'hellish-simplicity' ),
				'id'            => 'sidebar',
				'before_widget' => '<aside id="%1$s" class="%2$s">',
				'after_widget'  => '</aside>',
				'before_title'  => '<h2 class="widget-title">',
				'after_title'   => '</h2>',
			)
		);
	}

	/**
	 * Implements Page Styler theme options into Theme Customizer.
	 *
	 * @param  object  $wp_customize  Theme Customizer object
	 */
	public function customize_register( $wp_customize ) {

		// Theme Footer
		$wp_customize->add_setting( $this->header_text_option, array(
			'type'              => 'option',
			'sanitize_callback' => 'wp_kses_post',
			'capability'        => 'edit_theme_options',
		) );
		$wp_customize->add_section( 'header_text', array(
			'title'             => __( 'Header Text', 'hellish-simplicity' ),
			'priority'          => 10,
		) );
		$wp_customize->add_control( $this->header_text_option, array(
			'section'           => 'header_text',
			'label'             => __( 'Header Text', 'hellish-simplicity' ),
			'type'              => 'text',
		) );

	}

	/**
	 * Adding extra helpful information to the customizer.
	 */
	public function customizer_help() {
		echo '
		<li>
			<p>
				' . __( 'Example text:', 'hellish-simplicity' ) . ' <code>' . esc_html( $this->default_header_text ) . '</code>
			</p>
		</li>';
	}

	/**
	 * Adds a class of .last-post to the last post in a loop.
	 * This method is discussed here https://geek.hellyer.kiwi/tools/add-class-to-last-post-in-loop/
	 * 
	 * @param   array  $classes  The array of post classes
	 * @return  array  The array of post classes, with .last-post added
	 */
	public function add_last_post_class( $classes ) {
		global $wp_query;

		if ($wp_query->current_post == ( $wp_query->post_count - 1 ) ) {
			$classes[] = 'last-post';
		}

		return $classes;
	}

	/**
	 * Adds an admin menu link to the header section of the customizer.
	 *
	 * @global array $submenu
	 */
	public function admin_menu_link() {
		global $submenu;

		// Only display header admin menu link when in admin panel and when user is allowed to edit theme options
		if ( ! is_admin() && ! current_user_can( 'edit_theme_options' ) ) {
			return;
		}

		$themes_submenu[0] = array(
			0 => __( 'Header', 'hellish-simplicity' ),
			1 => 'edit_theme_options',
			2 => 'customize.php?autofocus%5Bcontrol%5D=' . $this->header_text_option,
		);

		// Merging menus together
		$submenu['themes.php'] = array_merge( $submenu['themes.php'], $themes_submenu );
	}

	/**
	 * Adds an admin bar link to the header section of the customizer.
	 * 
	 * @param   object  $wp_admin_bar  The admin bar object
	 */
	public function admin_bar_link( $wp_admin_bar ) {

		// Only display header admin bar link when on frontend and when user is allowed to edit theme options
		if ( is_admin() && ! current_user_can( 'edit_theme_options' ) ) {
			return;
		}

		$args = array(
			'id'     => 'header_text',
			'href'   => admin_url() . 'customize.php?autofocus%5Bcontrol%5D=' . $this->header_text_option,
			'title'  => __( 'Header', 'hellish-simplicity' ),
			'parent' => 'appearance',
		);
		$wp_admin_bar->add_node( $args );
	}

}
new Hellish_Simplicity_Setup;

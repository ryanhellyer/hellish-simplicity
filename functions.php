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
	const VERSION_NUMBER = '2.0';

	/**
	 * The default header text.
	 * 
	 * @var string
	 */
	const DEFAULT_HEADER_TEXT = 'Custom<span>Header</span><small>.com</small>';

	/**
	 * The header text option name.
	 * 
	 * @var string
	 */
	const HEADER_TEXT_OPTION = 'header-text';

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
		add_action( 'customize_render_control_' . self::HEADER_TEXT_OPTION,  array( $this, 'customizer_help' ) );
		add_action( 'admin_head',                                            array( $this, 'admin_menu_link' ) );

		// Add filters
		add_filter( 'post_class',                                            array( $this, 'add_last_post_class' ) );
	}

	/**
	 * Add the header text option.
	 */
	public function add_option() {
		add_option(
			self::HEADER_TEXT_OPTION, // The header text option
			self::DEFAULT_HEADER_TEXT // The default header text
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
		add_editor_style( 'css/editor-style.css' );
	}

	/**
	 * Load stylesheet.
	 */
	public function stylesheet() {
		if ( ! is_admin() ) {
			wp_enqueue_style( 'style', get_stylesheet_directory_uri() . '/css/style.min.css', array(), self::VERSION_NUMBER );
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
				'name'          => esc_html__( 'Sidebar', 'hellish-simplicity' ),
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
		$wp_customize->add_setting( self::HEADER_TEXT_OPTION, array(
			'type'              => 'option',
			'sanitize_callback' => array( $this, 'sanitize' ),
			'capability'        => 'edit_theme_options',
		) );
		$wp_customize->add_section( 'header_text', array(
			'title'             => esc_html__( 'Header Text', 'hellish-simplicity' ),
			'priority'          => 10,
		) );
		$wp_customize->add_control( self::HEADER_TEXT_OPTION, array(
			'section'           => 'header_text',
			'label'             => esc_html__( 'Header Text', 'hellish-simplicity' ),
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
				' . esc_html__( 'Example text:', 'hellish-simplicity' ) . ' <code>' . esc_html( self::DEFAULT_HEADER_TEXT ) . '</code>
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
	 * This is required because this theme does not use a graphical header image.
	 * Standard graphical custom header images automatically add this.
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
			0 => esc_html__( 'Header', 'hellish-simplicity' ),
			1 => 'edit_theme_options',
			2 => 'customize.php?autofocus%5Bcontrol%5D=' . self::HEADER_TEXT_OPTION,
		);

		// Merging menus together
		$submenu['themes.php'] = array_merge( $submenu['themes.php'], $themes_submenu );
	}

	/**
	 * Sanitizing the header text.
	 *
	 * @param  string  $header_text  The header text
	 * @return string  The sanitized header text
	 */
	static public function sanitize( $header_text ) {
		$allowed_html = array(
			'small' => array(),
			'span' => array(),
		);
		return wp_kses( $header_text, $allowed_html );
	}

}
new Hellish_Simplicity_Setup;

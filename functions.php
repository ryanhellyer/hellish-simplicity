<?php
/**
 * Main loading file.
 *
 * @package    Hellish Simplicity
 * @author     Ryan Hellyer <ryanhellyer@gmail.com
 * @copyright  2021 Ryan Hellyer
 */

/**
 * Autoload the classes.
 * Includes the classes, and automatically instantiates them via spl_autoload_register().
 *
 * @param string $class The class being instantiated.
 */
function autoload_hellish_simplicity_support( $class ) {

	// Bail out if not loading a Media Manager class.
	$string = 'Hellish_Simplicity_';
	if ( substr( $class, 0, strlen( $string ) ) !== $string ) {
		return;
	}

	// Convert from the class name, to the classes file name.
	$file_data = strtolower( $class );
	$file_data = str_replace( '_', '-', $file_data );
	$file_name = 'class-' . $file_data . '.php';

	// Get the classes file path.
	$dir  = dirname( __FILE__ );
	$path = $dir . '/inc/' . $file_name;

	// Include the class (spl_autoload_register will automatically instantiate it for us).
	require $path;
}
spl_autoload_register( 'autoload_hellish_simplicity_support' );

/**
 * Instantiate classes.
 */
new Hellish_Simplicity_Setup();
new Hellish_Simplicity_Index();

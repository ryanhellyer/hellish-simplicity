			<footer class="entry-meta">
				<?php
				printf(
					__( 'Posted on <a href="%1$s" title="%2$s" rel="bookmark"><time class="entry-date updated" datetime="%3$s">%4$s</time></a><span class="byline"> by <span class="author vcard"><a class="url fn n" href="%5$s" title="%6$s" rel="author">%7$s</a></span></span>', 'hellish-simplicity' ),
					esc_url( get_permalink() ),
					esc_attr( get_the_time() ),
					esc_attr( get_the_date( 'c' ) ),
					esc_html( get_the_date() ),
					esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
					sprintf( esc_html__( 'View all posts by %s', 'hellish-simplicity' ), get_the_author() ),
					get_the_author()
				);

				// Category listings (only display when we have more than one category)
				$categories_list = get_the_category_list( __( ', ', 'hellish-simplicity' ) );
				$all_categories = get_categories();
				if ( 1 < count( $all_categories ) && $categories_list ) {
					?>
					<span class="cat-links">
						<?php printf( esc_html__( ' in %1$s', 'hellish-simplicity' ), $categories_list ); ?>
					</span><?php
				}

				// Tag listings
				$tags_list = get_the_tag_list( '', esc_html__( ', ', 'hellish-simplicity' ) );
				if ( $tags_list ) {
				?>
				<span class="sep"> | </span>
				<span class="tags-links">
					<?php printf( esc_html__( 'Tagged %1$s', 'hellish-simplicity' ), $tags_list ); ?>
				</span><?php
				}

				// Comments info.
				if ( ! post_password_required() && ( comments_open() || '0' != get_comments_number() ) ) { ?>
				<span class="sep"> | </span>
				<span class="comments-link"><?php comments_popup_link( esc_html__( 'Leave a comment', 'hellish-simplicity' ), esc_html__( '1 Comment', 'hellish-simplicity' ), esc_html__( '% Comments', 'hellish-simplicity' ) ); ?></span><?php
				}

				// Edit link
				edit_post_link( esc_html__( 'Edit', 'hellish-simplicity' ), '<span class="sep"> | </span><span class="edit-link">', '</span>' );
				?>
			</footer><!-- .entry-meta --><?php

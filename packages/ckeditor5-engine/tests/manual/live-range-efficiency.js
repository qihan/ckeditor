/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, console, document */
/* eslint no-alert: 0 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Article from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import Position from '../../src/model/position';
import Range from '../../src/model/range';
import LiveRange from '../../src/model/liverange';

let uid = 1;
window.ranges = new Set();

const maxBlocks = window.prompt( 'How many paragraphs?' );
const forMarkers = window.confirm( 'Accept for Markers, reject for LiveRanges' );
const withConversion = forMarkers && window.confirm( 'With markers conversion?' );

const maxItems = window.prompt( 'How many items?' );

const block = '<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s ' +
	'standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen ' +
	'book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. ' +
	'It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with ' +
	'desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>';

const initialData = createBlocks( maxBlocks );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		initialData,
		plugins: [ Article ],
		toolbar: [ 'heading', '|', 'bold', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;

		if ( withConversion ) {
			editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
				model: 'marker',
				view: () => {
					return {
						classes: [ 'marker' ]
					};
				}
			} );
		}

		createRandomItems( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function createBlocks( number ) {
	let result = '';

	while ( number-- ) {
		result += block;
	}

	return result;
}

function createRandomItems( editor ) {
	const root = editor.model.document.getRoot();
	const charactersInBlock = root.getChild( 0 ).maxOffset;
	const totalCharacters = maxBlocks * charactersInBlock;
	const rangeBound = parseInt( ( totalCharacters / maxItems ) / 2, 10 );

	editor.model.change( writer => {
		for ( let i = 1; i <= maxItems; i++ ) {
			const startCharacterIndex = ( i * rangeBound ) * 2;
			const endCharacterIndex = startCharacterIndex + rangeBound;

			const startBlock = Math.floor( startCharacterIndex / charactersInBlock );
			const startCharacter = startCharacterIndex - ( startBlock * charactersInBlock );

			const endBlock = Math.floor( endCharacterIndex / charactersInBlock );
			const endCharacter = endCharacterIndex - ( endBlock * charactersInBlock );

			const start = new Position( root, [ startBlock, startCharacter ] );
			const end = new Position( root, [ endBlock, endCharacter ] );

			if ( forMarkers ) {
				writer.addMarker( 'marker:' + uid++, {
					range: new Range( start, end ),
					usingOperation: true
				} );
			} else {
				window.ranges.add( new LiveRange( start, end ) );
			}
		}
	} );
}

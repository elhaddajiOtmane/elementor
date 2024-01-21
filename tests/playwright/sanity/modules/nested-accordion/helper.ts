import { expect, Page } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';

/**
 * Set Nested Accordion Title Tag (H1-H6,div,span,p)
 *
 * @param {string} optionToSelect          - value of select option i.e. h1,h2,h3,h4,h5,h6,div,span,p
 * @param {string} nestedAccordionWidgetId - id of the nested accordion widget
 * @param {Object} editor
 * @param {Object} page
 * @return {Promise<void>}
 */
export async function setTitleTextTag( optionToSelect, nestedAccordionWidgetId, editor, page ) {
	const frame = editor.getPreviewFrame();
	await editor.selectElement( nestedAccordionWidgetId );
	await page.selectOption( '.elementor-control-title_tag .elementor-control-input-wrapper > select', optionToSelect );
	await frame.waitForLoadState( 'load' );
}

/**
 * Take a Screenshot of this Widget
 *
 * @param {string} fileName
 * @param {Object} locator
 * @return {Promise<void>}
 */
export async function expectScreenshotToMatchLocator( fileName, locator ) {
	expect.soft( await locator.screenshot( {
		type: 'png',
	} ) ).toMatchSnapshot( fileName );
}

async function getChoicesButtonSelector( choicesControlId, icon ) {
	return '.elementor-control-accordion_' + choicesControlId + ' ' + icon;
}

export async function setTitleIconPosition( direction, editor, breakpoint = 'desktop' ) {
	const icon = Object.freeze( {
		right: '.eicon-h-align-right',
		left: '.eicon-h-align-left',
	} );

	const controlBreakpoint = ( breakpoint.toLowerCase() !== 'desktop' ) ? '_' + breakpoint : '';
	const locator = await getChoicesButtonSelector( 'item_title_icon_position' + controlBreakpoint, icon[ direction ] );
	await editor.page.locator( locator ).click();
}

export async function setTitleHorizontalAlignment( direction, editor, breakpoint = 'desktop' ) {
	const icon = Object.freeze( {
		start: '.eicon-align-start-h',
		end: '.eicon-align-end-h',
		center: '.eicon-h-align-center',
		stretch: '.eicon-h-align-stretch',
		justify: '.eicon-h-align-stretch',
	} );

	const controlBreakpoint = ( breakpoint.toLowerCase() !== 'desktop' ) ? '_' + breakpoint : '';
	const locator = await getChoicesButtonSelector( 'item_title_position_horizontal' + controlBreakpoint, icon[ direction ] );
	await editor.page.locator( locator ).click();
}

export async function setBorderAndBackground( editor, state, color, borderType, borderColor ) {
	await setState();
	await setBackgroundColor();
	await setBorderType();
	await setBorderWidth();
	await setBorderColor();

	async function setBackgroundColor() {
		await editor.page.locator( '.elementor-control-accordion_background_' + state + '_background .eicon-paint-brush' ).click();
		await editor.setColorControlValue( color, 'accordion_background_' + state + '_color' );
	}

	async function setBorderType() {
		await editor.page.selectOption( '.elementor-control-accordion_border_' + state + '_border >> select', { value: borderType } );
	}

	async function setBorderWidth() {
		await editor.page.locator( '.elementor-control-accordion_border_' + state + '_width [data-setting="top"]' ).fill( '5' );
	}

	async function setBorderColor() {
		await editor.setColorControlValue( borderColor, 'accordion_border_' + state + '_color' );
	}

	async function setState() {
		await editor.page.click( '.elementor-control-accordion_' + state + '_border_and_background' );
	}
}

export async function setIconColor( editor, state, color, context ) {
	await setState();
	await setColor();

	async function setColor() {
		await editor.setColorControlValue( color, state + '_' + context + '_color' );
	}

	async function setState() {
		await editor.page.click( '.elementor-control-header_' + state + '_' + context );
	}
}

export async function addIcon( editor: EditorPage, page: Page, iconName: string ) {
	await editor.activatePanelTab( 'content' );
	await page.locator( '.elementor-control-icons--inline__displayed-icon' ).first().click();
	await page.locator( '#elementor-icons-manager__search input' ).fill( iconName );
	await page.locator( '.elementor-icons-manager__tab__item' ).first().click();
	await page.locator( '.dialog-insert_icon' ).click();
}

export async function setIconSize( editor: EditorPage, sizeInPx: string = '10' ) {
	await editor.activatePanelTab( 'style' );
	await editor.openSection( 'section_header_style' );
	await editor.setSliderControlValue( 'icon_size', sizeInPx );
}

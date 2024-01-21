import { useState, useRef, forwardRef } from 'react';
import { Box, Stack, IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import PromptAutocomplete from './prompt-autocomplete';
import EnhanceButton from '../../form-media/components/enhance-button';
import GenerateSubmit from '../../form-media/components/generate-submit';
import ArrowLeftIcon from '../../../icons/arrow-left-icon';
import EditIcon from '../../../icons/edit-icon';
import usePromptEnhancer from '../../../hooks/use-prompt-enhancer';
import Attachments from './attachments';
import { useConfig } from '../context/config';
import { AttachmentPropType } from '../../../types/attachment';

const PROMPT_SUGGESTIONS = Object.freeze( [
	{ text: __( 'Services section with list layout, icons, and service descriptions for [topic]', 'elementor' ) },
	{ text: __( 'Accordion-style FAQ block with clickable questions about [topic]', 'elementor' ) },
	{ text: __( 'Hero section with image, heading, subheading, and CTA button about [topic]', 'elementor' ) },
	{ text: __( 'Full-width call-to-action with background image and overlay text about [topic]', 'elementor' ) },
	{ text: __( 'Carousel testimonial block with user images, names, and feedback about [topic]', 'elementor' ) },
	{ text: __( 'Features block showcasing feature title and brief description about [topic]', 'elementor' ) },
	{ text: __( 'Multi-column minimalistic About Us section with icons for [topic]', 'elementor' ) },
	{ text: __( 'Section with contact form and social media icons for [topic]', 'elementor' ) },
	{ text: __( 'Statistics display in a 3-column layout with numbers and icons for [topic]', 'elementor' ) },
	{ text: __( 'Pricing table section with highlighted option for [topic]', 'elementor' ) },
	{ text: __( 'About Us section combining company history and values for [topic]', 'elementor' ) },
] );

const IconButtonWithTooltip = ( { tooltip, ...props } ) => (
	<Tooltip title={ tooltip }>
		<Box component="span" sx={ { cursor: props.disabled ? 'default' : 'pointer' } }>
			<IconButton { ...props } />
		</Box>
	</Tooltip>
);

IconButtonWithTooltip.propTypes = {
	tooltip: PropTypes.string,
	disabled: PropTypes.bool,
};

const BackButton = ( props ) => (
	<IconButtonWithTooltip size="small" color="secondary" tooltip={ __( 'Back to results', 'elementor' ) } { ...props }>
		<ArrowLeftIcon />
	</IconButtonWithTooltip>
);

const EditButton = ( props ) => (
	<IconButtonWithTooltip
		size="small"
		color="primary"
		tooltip={ __( 'Edit prompt', 'elementor' ) }
		{ ...props }
	>
		<EditIcon />
	</IconButtonWithTooltip>
);

const GenerateButton = ( props ) => (
	<GenerateSubmit
		size="small"
		fullWidth={ false }
		{ ...props }
	>
		{ __( 'Generate', 'elementor' ) }
	</GenerateSubmit>
);

const PromptForm = forwardRef( ( {
	attachments,
	isActive,
	isLoading,
	showActions = false,
	onAttach,
	onDetach,
	onSubmit,
	onBack,
	onEdit,
}, ref ) => {
	const [ prompt, setPrompt ] = useState( '' );
	const { isEnhancing, enhance } = usePromptEnhancer( prompt, 'layout' );
	const previousPrompt = useRef( '' );
	const { attachmentsTypes } = useConfig();

	const isInputDisabled = isLoading || isEnhancing || ! isActive;
	const isInputEmpty = '' === prompt && ! attachments.length;
	const isGenerateDisabled = isInputDisabled || isInputEmpty;

	const attachmentsType = attachments[ 0 ]?.type || '';
	const attachmentsConfig = attachmentsTypes[ attachmentsType ];
	const promptSuggestions = attachmentsConfig?.promptSuggestions || PROMPT_SUGGESTIONS;
	const promptPlaceholder = attachmentsConfig?.promptPlaceholder || __( "Press '/' for suggested prompts or describe the layout you want to create", 'elementor' );

	const handleBack = () => {
		setPrompt( previousPrompt.current );
		onBack();
	};

	const handleEdit = () => {
		previousPrompt.current = prompt;
		onEdit();
	};

	return (
		<Stack
			component="form"
			onSubmit={ ( e ) => onSubmit( e, prompt ) }
			direction="row"
			sx={ { p: 3 } }
			alignItems="start"
			gap={ 1 }
		>
			<Stack direction="row" alignItems="start" flexGrow={ 1 } spacing={ 2 }>
				{
					showActions && (
						isActive ? (
							<BackButton disabled={ isLoading || isEnhancing } onClick={ handleBack } />
						) : (
							<EditButton disabled={ isLoading } onClick={ handleEdit } />
						)
					)
				}

				<Attachments
					attachments={ attachments }
					onAttach={ onAttach }
					onDetach={ onDetach }
					disabled={ isInputDisabled }
				/>

				<PromptAutocomplete
					value={ prompt }
					disabled={ isInputDisabled }
					onSubmit={ ( e ) => onSubmit( e, prompt ) }
					options={ promptSuggestions }
					onChange={ ( _, selectedValue ) => setPrompt( selectedValue.text + ' ' ) }
					renderInput={ ( params ) => (
						<PromptAutocomplete.TextInput
							{ ...params }
							ref={ ref }
							onChange={ ( e ) => setPrompt( e.target.value ) }
							placeholder={ promptPlaceholder }
						/>
					) }
				/>
			</Stack>

			<EnhanceButton
				size="small"
				disabled={ isGenerateDisabled || '' === prompt }
				isLoading={ isEnhancing }
				onClick={ () => enhance().then( ( { result } ) => setPrompt( result ) ) }
			/>

			<GenerateButton disabled={ isGenerateDisabled } />
		</Stack>
	);
} );

PromptForm.propTypes = {
	isActive: PropTypes.bool,
	onAttach: PropTypes.func,
	onDetach: PropTypes.func,
	isLoading: PropTypes.bool,
	showActions: PropTypes.bool,
	onSubmit: PropTypes.func.isRequired,
	onBack: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
	attachments: PropTypes.arrayOf( AttachmentPropType ),
};

export default PromptForm;

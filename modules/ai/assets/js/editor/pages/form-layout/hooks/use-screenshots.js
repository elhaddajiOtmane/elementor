import { useState, useRef } from 'react';
import useScreenshot from './use-screenshot';
import { useConfig } from '../context/config';
import { getUniqueId } from '../../../utils/generate-ids';

const PENDING_VALUE = { isPending: true };

const useScreenshots = ( { onData } ) => {
	const [ screenshots, setScreenshots ] = useState( [] );

	/**
	 * The ids for each request are:
	 * - editorSessionId: a unique id for each editor opening
	 * - sessionId: a unique id for each session. (open the AI builder)
	 * - generateId: a unique id for each generate request. (prompt change)
	 * - batchId: a unique id for each batch of generate requests. (generate, regenerate)
	 * - requestId: a unique id for each generate request.
	 */

	const { currentContext, sessionId, editorSessionId } = useConfig();
	const generateIdRef = useRef( '' );
	const batchId = `batch-${ getUniqueId() }`;

	const screenshotsData = [
		useScreenshot( 0, onData ),
		useScreenshot( 1, onData ),
		useScreenshot( 2, onData ),
	];

	const screenshotsGroupCount = screenshotsData.length;

	const error = screenshotsData.every( ( s ) => s?.error ) ? screenshotsData[ 0 ].error : '';
	const isLoading = screenshotsData.some( ( s ) => s?.isLoading );

	const abortController = useRef( null );

	const abort = () => abortController.current?.abort();

	const createScreenshots = async ( prompt, attachments ) => {
		abortController.current = new AbortController();

		const onGenerate = ( screenshot ) => {
			setScreenshots( ( prev ) => {
				const updatedData = [ ...prev ];
				const pendingIndex = updatedData.indexOf( PENDING_VALUE );

				updatedData[ pendingIndex ] = screenshot;

				return updatedData;
			} );

			return true;
		};

		const onError = () => {
			setScreenshots( ( prev ) => {
				const updatedData = [ ...prev ];
				const pendingIndex = updatedData.lastIndexOf( PENDING_VALUE );

				updatedData[ pendingIndex ] = { isError: true };

				return updatedData;
			} );

			return false;
		};

		const promises = screenshotsData.map( ( { generate } ) => {
			const prevGeneratedIds = screenshots.map( ( screenshot ) => screenshot.baseTemplateId || '' );

			const requestBody = {
				prompt,
				prevGeneratedIds,
				currentContext,
				ids: {
					editorSessionId,
					sessionId,
					generateId: generateIdRef.current,
					batchId,
					requestId: `request-${ getUniqueId() }`,
				},
				attachments: attachments.map( ( { type, content, label, source } ) => {
					// Send only the data that is needed for the generation.
					return {
						type,
						content,
						label,
						source,
					};
				} ),
			};

			return generate( requestBody, abortController.current.signal )
				.then( onGenerate )
				.catch( onError );
		} );

		const results = await Promise.all( promises );
		const isAllFailed = results.every( ( value ) => false === value );

		if ( isAllFailed ) {
			setScreenshots( ( prev ) => {
				const updatedData = [ ...prev ];

				updatedData.splice( screenshotsGroupCount * -1 );

				return updatedData;
			} );
		}
	};

	const generate = ( prompt, attachments ) => {
		const placeholders = Array( screenshotsGroupCount ).fill( PENDING_VALUE );

		generateIdRef.current = `generate-${ getUniqueId() }`;
		setScreenshots( placeholders );

		createScreenshots( prompt, attachments );
	};

	const regenerate = ( prompt, attachments ) => {
		const placeholders = Array( screenshotsGroupCount ).fill( PENDING_VALUE );

		setScreenshots( ( prev ) => [ ...prev, ...placeholders ] );

		createScreenshots( prompt, attachments );
	};

	return {
		generate,
		regenerate,
		screenshots,
		isLoading,
		error,
		abort,
	};
};

export default useScreenshots;

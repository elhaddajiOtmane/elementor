import { Dialog, DialogContent } from '@elementor/ui';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useAttachUrlService } from '../../hooks/use-attach-url-service';
import { AlertDialog } from '../../../../components/alert-dialog';
import { useTimeout } from '../../../../hooks/use-timeout';
import { USER_URL_SOURCE } from '../attachments';
import { CONFIG_KEYS, useRemoteConfig } from '../../context/remote-config';

export const UrlDialog = ( props ) => {
	const iframeRef = useRef( null );
	const { iframeSource } = useAttachUrlService( { targetUrl: props.url } );
	const iframeOrigin = iframeSource ? new URL( iframeSource ).origin : '';
	const [ isTimeout, turnOffTimeout ] = useTimeout( 10_000 );
	const { isLoaded, isError, remoteConfig } = useRemoteConfig();

	useEffect( () => {
		const onMessage = ( event ) => {
			if ( event.origin !== iframeOrigin ) {
				return;
			}

			const { type, html, url } = event.data;

			switch ( type ) {
				case 'element-selector/close':
					props.onClose();
					break;
				case 'element-selector/loaded':
					turnOffTimeout();
					break;
				case 'element-selector/attach':
					props.onAttach( [ {
						type: 'url',
						previewHTML: html,
						content: html,
						label: url ? new URL( url ).host : '',
						source: USER_URL_SOURCE,
					} ] );
					break;
			}
		};

		window.addEventListener( 'message', onMessage );

		return () => {
			window.removeEventListener( 'message', onMessage );
		};
	}, [ iframeOrigin, iframeSource, props, turnOffTimeout ] );

	if ( ! iframeSource ) {
		return (
			<AlertDialog
				message={ __( 'The app is not available. Please try again later.', 'elementor' ) }
				onClose={ props.onClose }
			/>
		);
	}

	if ( ! isLoaded || isError ) {
		return null;
	}

	return (
		<Dialog
			open={ true }
			fullScreen={ true }
			hideBackdrop={ true }
			maxWidth="md"
			sx={ {
				'& .MuiPaper-root': {
					backgroundColor: 'transparent',
				},
			} }
		>
			<DialogContent
				sx={ {
					padding: 0,
				} }
			>
				{
					isTimeout && <AlertDialog
						message={ __( 'The app is not responding. Please try again later.', 'elementor' ) }
						onClose={ props.onClose }
					/>
				}

				{
					! isTimeout && (
						<iframe
							ref={ iframeRef }
							title={ __( 'URL as a reference', 'elementor' ) }
							src={ iframeSource }
							onLoad={ () => {
								iframeRef.current.contentWindow.postMessage( {
									type: 'referrer/info',
									info: {
										page: {
											url: window.location.href,
										},
										authToken: remoteConfig[ CONFIG_KEYS.AUTH_TOKEN ] || '',
									},
								}, iframeOrigin );
							} }
							style={ {
								border: 'none',
								overflow: 'scroll',
								width: '100%',
								height: '100%',
								backgroundColor: 'rgba(255,255,255,0.6)',
							} }
						/>
					) }
			</DialogContent>
		</Dialog>
	);
};

UrlDialog.propTypes = {
	onAttach: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	url: PropTypes.string,
};

/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize, LocalizeProps } from 'i18n-calypso';
import { map } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import CardHeading from 'components/card-heading';
import Gridicon from 'components/gridicon';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { localizeUrl } from 'lib/i18n-utils';

// Mapping eligibility holds to messages that will be shown to the user
// TODO: update supportUrls and maybe create similar mapping for warnings
function getHoldMessages( translate: LocalizeProps[ 'translate' ] ) {
	return {
		NO_BUSINESS_PLAN: {
			title: translate( 'Upgrade to a Business plan' ),
			description: translate(
				"You'll also get to install custom themes, have more storage, and access live support."
			),
			supportUrl: null,
		},
		SITE_PRIVATE: {
			title: translate( 'Public site needed' ),
			description: translate(
				'Change your site\'s Privacy settings to "Public" or "Hidden" (not "Private.")'
			),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/settings/privacy-settings/' ),
		},
		NON_ADMIN_USER: {
			title: translate( 'Site administrator only' ),
			description: translate( 'Only the site administrators can use this feature.' ),
			supportUrl: localizeUrl( 'https://en.support.wordpress.com/user-roles/' ),
		},
		NOT_RESOLVING_TO_WPCOM: {
			title: translate( 'Domain pointing to a different site' ),
			description: translate(
				"Your domain is not properly set up to point to your site. Reset your domain's A records in the Domains section to fix this."
			),
			supportUrl: localizeUrl(
				'https://en.support.wordpress.com/move-domain/setting-custom-a-records/'
			),
		},
		EMAIL_UNVERIFIED: {
			title: translate( 'Confirm your email address' ),
			description: translate(
				"Check your email for a message we sent you when you signed up. Click the link inside to confirm your email address. You may have to check your email client's spam folder."
			),
			supportUrl: null,
		},
		EXCESSIVE_DISK_SPACE: {
			title: translate( 'Upload not available' ),
			description: translate(
				'This site is not currently eligible to install themes and plugins. Please contact our support team for help.'
			),
			supportUrl: localizeUrl( 'https://wordpress.com/help/contact' ),
		},
	};
}

function getBlockingMessages( translate: LocalizeProps[ 'translate' ] ) {
	return {
		BLOCKED_ATOMIC_TRANSFER: {
			message: translate(
				'This site is not currently eligible to install themes and plugins. Please contact our support team for help.'
			),
			status: 'is-error',
			contactUrl: localizeUrl( 'https://wordpress.com/help/contact' ),
		},
		TRANSFER_ALREADY_EXISTS: {
			message: translate(
				'Installation in progress. Just a minute! Please wait until the installation is finisehd, then try again.'
			),
			status: null,
			contactUrl: null,
		},
		NO_JETPACK_SITES: {
			message: translate( 'Try using a different site.' ),
			status: 'is-error',
			contactUrl: null,
		},
		NO_VIP_SITES: {
			message: translate( 'Try using a different site.' ),
			status: 'is-error',
			contactUrl: null,
		},
		SITE_GRAYLISTED: {
			message: translate(
				"There's an ongoing site dispute. Contact us to review your site's standing and resolve the dispute."
			),
			status: 'is-error',
			contactUrl: localizeUrl( 'https://en.support.wordpress.com/suspended-blogs/' ),
		},
		NO_SSL_CERTIFICATE: {
			message: translate(
				'Certificate installation in progress. Hold tight! We are setting up a digital certificate to allow secure browing on your site using "HTTPS".'
			),
			status: null,
			contactUrl: null,
		},
	};
}

interface ExternalProps {
	context: string | null;
	holds: string[];
	isPlaceholder: boolean;
}

type Props = ExternalProps & LocalizeProps;

export const HoldList = ( { context, holds, isPlaceholder, translate }: Props ) => {
	const holdMessages = getHoldMessages( translate );
	const blockingMessages = getBlockingMessages( translate );

	const blockingHold = holds.find( h => isHardBlockingHoldType( h, blockingMessages ) );

	return (
		<>
			{ ! isPlaceholder &&
				blockingHold &&
				isHardBlockingHoldType( blockingHold, blockingMessages ) && (
					<Notice
						status={ blockingMessages[ blockingHold ].status }
						text={ blockingMessages[ blockingHold ].message }
						showDismiss={ false }
					>
						{ blockingMessages[ blockingHold ].contactUrl && (
							<NoticeAction href={ blockingMessages[ blockingHold ].contactUrl } external>
								{ translate( 'Contact us' ) }
							</NoticeAction>
						) }
					</Notice>
				) }
			<Card
				className={ classNames( 'eligibility-warnings__hold-list', {
					'eligibility-warnings__hold-list-dim': blockingHold,
				} ) }
				data-testid="HoldList-Card"
			>
				<CardHeading>
					<span className="eligibility-warnings__hold-heading">
						{ getCardHeading( context, translate ) }
					</span>
				</CardHeading>
				{ isPlaceholder && (
					<div>
						<div className="eligibility-warnings__hold">
							<Gridicon icon="notice-outline" size={ 24 } />
							<div className="eligibility-warnings__message" />
						</div>
						<div className="eligibility-warnings__hold">
							<Gridicon icon="notice-outline" size={ 24 } />
							<div className="eligibility-warnings__message" />
						</div>
					</div>
				) }
				{ ! isPlaceholder &&
					map( holds, hold =>
						! isKnownHoldType( hold, holdMessages ) ? null : (
							<div className="eligibility-warnings__hold" key={ hold }>
								<Gridicon icon="checkmark-circle" size={ 24 } />
								<div className="eligibility-warnings__message">
									<div className="eligibility-warnings__message-title">
										{ holdMessages[ hold ].title }
									</div>
									<div className="eligibility-warnings__message-description">
										{ holdMessages[ hold ].description }
									</div>
								</div>
								{ holdMessages[ hold ].supportUrl && (
									<div className="eligibility-warnings__hold-action">
										<Button
											compact
											disabled={ !! blockingHold }
											href={ holdMessages[ hold ].supportUrl }
											rel="noopener noreferrer"
										>
											{ translate( 'Help' ) }
										</Button>
									</div>
								) }
							</div>
						)
					) }
			</Card>
		</>
	);
};

function getCardHeading( context: string | null, translate: LocalizeProps[ 'translate' ] ) {
	switch ( context ) {
		case 'plugins':
			return translate( "To install plugins, you'll need a couple things:" );
		case 'themes':
			return translate( "To install themes, you'll need a couple things:" );
		default:
			return translate( "To continue, you'll need a couple things:" );
	}
}

function isKnownHoldType(
	hold: string,
	holdMessages: ReturnType< typeof getHoldMessages >
): hold is keyof ReturnType< typeof getHoldMessages > {
	return holdMessages.hasOwnProperty( hold );
}

function isHardBlockingHoldType(
	hold: string,
	blockingMessages: ReturnType< typeof getBlockingMessages >
): hold is keyof ReturnType< typeof getBlockingMessages > {
	return blockingMessages.hasOwnProperty( hold );
}

export default localize( HoldList );

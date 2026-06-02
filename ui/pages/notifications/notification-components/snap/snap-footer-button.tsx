import React, { useCallback, useContext, useState } from 'react';
import useSnapNavigation from '../../../../hooks/snaps/useSnapNavigation';
import SnapLinkWarning from '../../../../components/app/snaps/snap-link-warning';
import { NotificationDetailButton } from '../../../../components/multichain';
import { ButtonVariant } from '../../../../components/component-library';
import { MetaMetricsContext } from '../../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../../shared/constants/metametrics';
import { getNotificationSubtype } from '@metamask/notification-services-controller/notification-services';
import { useNotificationAnalyticsProperties } from '../../notification-hooks/use-notification-analytics-properties';
import { DetailedViewData, SnapNotification } from './types';

export const SnapFooterButton = (props: { notification: SnapNotification }) => {
  const { trackEvent } = useContext(MetaMetricsContext);
  const { profile_id } = useNotificationAnalyticsProperties();
  const { handleSnapNavigate } = useSnapNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const data = props.notification.data as DetailedViewData;
  const footer = data?.detailedView?.footerLink;

  const handleModalClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onClick = useCallback(
    (href: string, isExternal: boolean) => {
      // Analytics
      trackEvent({
        category: MetaMetricsEventCategory.NotificationInteraction,
        event: MetaMetricsEventName.NotificationDetailClicked,
        properties: {
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          notification_id: props.notification.id,
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          notification_type: props.notification.type,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          notification_subtype: getNotificationSubtype(props.notification),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ...(profile_id && { profile_id }),
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          clicked_item: isExternal ? 'external_link' : 'internal_link',
        },
      });

      // Warning / Navigation
      if (isExternal) {
        setIsOpen(true);
      } else {
        handleSnapNavigate(href);
      }
    },
    [handleSnapNavigate, profile_id, props.notification, trackEvent],
  );

  if (!footer) {
    return null;
  }

  const { href, text } = footer;
  const isMetaMaskUrl = href.startsWith('metamask:');
  const isExternal = !isMetaMaskUrl;

  return (
    <>
      <SnapLinkWarning isOpen={isOpen} onClose={handleModalClose} url={href} />
      <NotificationDetailButton
        variant={ButtonVariant.Secondary}
        isExternal={isExternal}
        text={text}
        onClick={() => onClick(href, isExternal)}
      />
    </>
  );
};

import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Text,
  BoxFlexDirection,
  BoxAlignItems,
  BoxJustifyContent,
  TextVariant,
  TextColor,
  FontWeight,
} from '@metamask/design-system-react';
import { useI18nContext } from '../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../shared/constants/metametrics';
import { useNotificationAnalyticsProperties } from '../notifications/notification-hooks/use-notification-analytics-properties';
import {
  selectIsMetamaskNotificationsEnabled,
  getIsUpdatingMetamaskNotifications,
  getValidNotificationAccounts,
} from '../../selectors/metamask-notifications/metamask-notifications';
import { getAccountGroupWithInternalAccounts } from '../../selectors/multichain-accounts/account-tree';
import { useAccountSettingsProps } from '../../hooks/metamask-notifications/useSwitchNotifications';
import { NotificationsSettingsAllowNotifications } from './notifications-settings-allow-notifications';
import { NotificationsSettingsTypes } from './notifications-settings-types';
import { NotificationsSettingsPerAccount } from './notifications-settings-per-account';
import { getNotificationWalletGroups } from './notifications-settings-helpers';

function useNotificationAccountGroups() {
  const accountAddresses = useSelector(getValidNotificationAccounts);
  const accountGroups = useSelector(getAccountGroupWithInternalAccounts);

  return useMemo(
    () => getNotificationWalletGroups(accountGroups, accountAddresses),
    [accountAddresses, accountGroups],
  );
}

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
export function NotificationsSettingsContent() {
  const isMetamaskNotificationsEnabled = useSelector(
    selectIsMetamaskNotificationsEnabled,
  );
  const isUpdatingMetamaskNotifications = useSelector(
    getIsUpdatingMetamaskNotifications,
  );
  const notificationAccountGroups = useNotificationAccountGroups();
  const [loadingAllowNotifications, setLoadingAllowNotifications] =
    useState<boolean>(isUpdatingMetamaskNotifications);
  const accountAddresses = useMemo(
    () =>
      notificationAccountGroups.flatMap((walletGroup) =>
        walletGroup.accounts.map((account) => account.address),
      ),
    [notificationAccountGroups],
  );
  const accountSettingsProps = useAccountSettingsProps(accountAddresses);
  const updatingAccounts = accountSettingsProps.accountsBeingUpdated.length > 0;
  const refetchAccountSettings = async () => {
    await accountSettingsProps.update(accountAddresses);
  };
  const t = useI18nContext();
  const { trackEvent } = useContext(MetaMetricsContext);
  const { profile_id } = useNotificationAnalyticsProperties();

  const handleAccountActivityToggle = useCallback(
    (newState: boolean) => {
      const enabledCount = Object.values(
        accountSettingsProps.data ?? {},
      ).filter(Boolean).length;

      const flippedOn = newState && enabledCount === 0;
      const flippedOff = !newState && enabledCount === 1;

      if (!flippedOn && !flippedOff) {
        return;
      }

      trackEvent({
        category: MetaMetricsEventCategory.NotificationSettings,
        event: MetaMetricsEventName.NotificationsSettingsUpdated,
        properties: {
          settings_type: 'wallet_activity',
          notification_channel: 'all',
          enabled: newState,
          ...(profile_id && { profile_id }),
        },
      });
    },
    [accountSettingsProps.data, profile_id, trackEvent],
  );

  return (
    <Box
      flexDirection={BoxFlexDirection.Column}
      alignItems={BoxAlignItems.Stretch}
      paddingTop={3}
      paddingHorizontal={4}
      gap={6}
    >
      <NotificationsSettingsAllowNotifications
        loading={loadingAllowNotifications}
        setLoading={setLoadingAllowNotifications}
        dataTestId="notifications-settings-allow"
        disabled={updatingAccounts}
      />
      {isMetamaskNotificationsEnabled && (
        <>
          <Box className="w-full h-px border-t border-muted" />
          <NotificationsSettingsTypes
            disabled={loadingAllowNotifications || updatingAccounts}
          />
          <Box className="w-full h-px border-t border-muted" />
          {notificationAccountGroups.length > 0 ? (
            <Box
              flexDirection={BoxFlexDirection.Column}
              alignItems={BoxAlignItems.Stretch}
              gap={6}
              data-testid="notifications-settings-per-account"
            >
              <Box
                flexDirection={BoxFlexDirection.Column}
                alignItems={BoxAlignItems.Start}
                gap={1}
              >
                <Text
                  variant={TextVariant.BodyMd}
                  fontWeight={FontWeight.Medium}
                  color={TextColor.TextDefault}
                >
                  {t('accountActivity')}
                </Text>
                <Text
                  variant={TextVariant.BodyMd}
                  fontWeight={FontWeight.Regular}
                  color={TextColor.TextAlternative}
                >
                  {t('accountActivityText')}
                </Text>
              </Box>
              <Box
                flexDirection={BoxFlexDirection.Column}
                justifyContent={BoxJustifyContent.Start}
                alignItems={BoxAlignItems.Stretch}
                gap={4}
              >
                {notificationAccountGroups.map((walletGroup) => (
                  <Box
                    key={walletGroup.walletId}
                    flexDirection={BoxFlexDirection.Column}
                    alignItems={BoxAlignItems.Stretch}
                    gap={2}
                  >
                    <Text
                      variant={TextVariant.BodyMd}
                      fontWeight={FontWeight.Medium}
                      color={TextColor.TextAlternative}
                    >
                      {walletGroup.walletName}
                    </Text>
                    {walletGroup.accounts.map((account) => (
                      <NotificationsSettingsPerAccount
                        key={account.id}
                        address={account.address}
                        name={account.name}
                        disabledSwitch={
                          accountSettingsProps.initialLoading ||
                          updatingAccounts
                        }
                        isLoading={accountSettingsProps.accountsBeingUpdated.includes(
                          account.address,
                        )}
                        isEnabled={
                          accountSettingsProps.data?.[
                            account.address.toLowerCase()
                          ] ?? false
                        }
                        refetchAccountSettings={refetchAccountSettings}
                        onToggle={handleAccountActivityToggle}
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  );
}

export default NotificationsSettingsContent;

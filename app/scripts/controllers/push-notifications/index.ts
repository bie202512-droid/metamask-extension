// We are defining that this file uses a webworker global scope.
// eslint-disable-next-line spaced-comment
/// <reference lib="webworker" />

import type { PushAnalyticsPayload } from '@metamask/notification-services-controller/push-services';
import ExtensionPlatform from '../../platforms/extension';

const sw = self as unknown as ServiceWorkerGlobalScope;
const extensionPlatform = new ExtensionPlatform();

/**
 * Push receive handler — intentionally a no-op.
 *
 * The FCM payload no longer carries the notification body, so the old
 * `createNotificationMessage` + `showNotification` render path can't run here.
 * The OS renders the banner from the FCM/Webpush payload, and the core
 * `NotificationServicesController` re-fetches the inbox on receive (via its
 * `onNewNotifications` subscription) — so nothing needs to happen here.
 *
 * TODO: confirm with the push-services team that the OS is the sole banner renderer.
 *
 * @param _payload - the push analytics payload (unused).
 */
export function onPushNotificationReceived(
  _payload: PushAnalyticsPayload,
): void {
  // No-op — pending confirmation of banner-render ownership (see TODO above).
}

export async function onPushNotificationClicked(
  event: NotificationEvent,
  payload?: PushAnalyticsPayload,
) {
  // Close notification
  event.notification.close();

  // Get Data
  const data: PushAnalyticsPayload = payload ?? event?.notification?.data;

  // Navigate
  const destination = `${extensionPlatform.getExtensionURL(
    null,
    null,
  )}#notifications/${data.notification_id}`;
  event.waitUntil(sw.clients.openWindow(destination));
}

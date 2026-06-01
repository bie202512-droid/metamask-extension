// We are defining that this file uses a webworker global scope.
// eslint-disable-next-line spaced-comment
/// <reference lib="webworker" />

import type { PushAnalyticsPayload } from '@metamask/notification-services-controller/push-services';
import ExtensionPlatform from '../../platforms/extension';

const sw = self as unknown as ServiceWorkerGlobalScope;
const extensionPlatform = new ExtensionPlatform();

/**
 * Push receive handler. Currently a no-op.
 *
 * The push payload no longer carries the notification body (§4.4), so the
 * previous `createNotificationMessage` + `showNotification` rendering can no
 * longer run here. The *assumption* is that the banner is now rendered by the
 * OS from the FCM `notification` / Webpush payload push-services sends (its
 * Webpush config is commented "added so that the extension doesn't fire
 * twice"), and the controller refreshes the in-app inbox on receive.
 *
 * TODO: Confirm with the notifications / push-services team that the OS/Webpush
 * is the sole banner renderer and the service worker should not render here. If
 * the SW must still render, note there is no fetch-by-id endpoint today (the
 * API only returns the bulk list by address), so the options are: render from
 * the flat FCM fields, or reuse the controller's existing list re-fetch and
 * find the entry by `notification_id`.
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

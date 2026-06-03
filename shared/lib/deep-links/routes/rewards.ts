import { buildDeepLinkUrl } from '../utils';
import {
  createHomeQrCodeDestination,
  HomeQueryParams,
} from './home';
import { Route } from './route';

export const rewards = new Route({
  pathname: '/rewards',
  getTitle: (_: URLSearchParams) => 'deepLink_theRewardsPage',
  handlerSearchParams: 'original',
  handler: function handler(params: URLSearchParams) {
    return createHomeQrCodeDestination(
      HomeQueryParams.RewardsDeeplinkUrl,
      buildDeepLinkUrl('/rewards', params),
    );
  },
});

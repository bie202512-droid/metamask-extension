import { buildDeepLinkUrl } from '../utils';
import {
  createHomeQrCodeDestination,
  HomeQueryParams,
} from './home';
import { Route } from './route';

export const predict = new Route({
  pathname: '/predict',
  getTitle: (_: URLSearchParams) => 'deepLink_thePredictPage',
  handlerSearchParams: 'original',
  handler: function handler(params: URLSearchParams) {
    return createHomeQrCodeDestination(
      HomeQueryParams.PredictDeeplinkUrl,
      buildDeepLinkUrl('/predict', params),
    );
  },
});

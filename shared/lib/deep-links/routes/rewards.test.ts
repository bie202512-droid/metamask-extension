import { rewards } from './rewards';
import { HomeQueryParams } from './home';
import { DEFAULT_ROUTE } from './route';

describe('rewards deep link route', () => {
  it('has the correct pathname', () => {
    expect(rewards.pathname).toBe('/rewards');
  });

  it('returns the correct title key', () => {
    expect(rewards.getTitle(new URLSearchParams())).toBe(
      'deepLink_theRewardsPage',
    );
  });

  it('uses original query parameters in the QR deeplink', () => {
    expect(rewards.handlerSearchParams).toBe('original');
  });

  it('opens the default route with QR modal params and preserves every query parameter in the encoded deeplink', () => {
    const params = new URLSearchParams(
      'referral=ABC123&sig_params=referral&sig=signature&utm_source=twitter&_hsenc=value&attributionId=attr',
    );

    const destination = rewards.handler(params);

    expect(destination).toHaveProperty('path');
    expect((destination as { path: string }).path).toBe(DEFAULT_ROUTE);
    expect(
      (destination as { query: URLSearchParams }).query.get(
        HomeQueryParams.RewardsDeeplinkUrl,
      ),
    ).toBe(
      'https://link.metamask.io/rewards?referral=ABC123&sig_params=referral&sig=signature&utm_source=twitter&_hsenc=value&attributionId=attr',
    );
  });
});

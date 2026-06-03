import { withFixtures } from '../../helpers';
import { Driver } from '../../webdriver/driver';
import LoginPage from '../../page-objects/pages/login-page';
import HomePage from '../../page-objects/pages/home/homepage';
import { REWARDS_ROUTE } from '../../../../ui/helpers/constants/routes';
import { navigateDeepLinkToDestination } from '../../page-objects/flows/deep-link.flow';
import {
  bytesToB64,
  generateECDSAKeyPair,
  getConfig,
  prepareDeepLinkUrl,
  shouldRenderCheckbox,
} from './helpers';

describe('Deep Link - Rewards Route', function () {
  it('handles rewards deep link route', async function () {
    const keyPair = await generateECDSAKeyPair();
    const deepLinkPublicKey = bytesToB64(
      await crypto.subtle.exportKey('raw', keyPair.publicKey),
    );

    await withFixtures(
      await getConfig({
        title: this.test?.fullTitle(),
        deepLinkPublicKey,
      }),
      async ({ driver }: { driver: Driver }) => {
        // ensure the background is ready to process deep links (by waiting
        // for the UI to load)
        console.log('Navigating to initial page');
        await driver.navigate();
        const loginPage = new LoginPage(driver);
        console.log('Checking if login page is loaded');
        await loginPage.checkPageIsLoaded();

        // log in so the deep link's `continue` button can skip the lock screen
        console.log('Logging in to homepage');
        await loginPage.loginToHomepage();

        console.log('Checking if home page is loaded');
        const homePage = new HomePage(driver);
        await homePage.checkPageIsLoaded();

        const preparedUrl = await prepareDeepLinkUrl({
          route: REWARDS_ROUTE,
          signed: 'signed with sig_params',
          privateKey: keyPair.privateKey,
        });

        await navigateDeepLinkToDestination(
          driver,
          preparedUrl,
          'unlocked',
          shouldRenderCheckbox('signed with sig_params'),
          HomePage,
        );

        await driver.waitForSelector(
          '[data-testid="deeplink-qrcode-container"]',
        );
      },
    );
  });
});

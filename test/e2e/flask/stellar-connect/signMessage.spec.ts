import { TestDappStellar } from '../../page-objects/pages/test-dapp-stellar';
import { WINDOW_TITLES } from '../../constants';
import { connectStellarTestDapp } from '../../page-objects/flows/stellar-dapp.flow';
import SnapSignMessageConfirmation from '../../page-objects/pages/confirmations/snap-sign-message-confirmation';
import { DEFAULT_STELLAR_TEST_DAPP_FIXTURE_OPTIONS } from './testHelpers';
import { withStellarAccountSnap } from './common-stellar';

describe('Stellar Connect - Sign Message - e2e tests', function () {
  it('Signs a message', async function () {
    await withStellarAccountSnap(
      {
        ...DEFAULT_STELLAR_TEST_DAPP_FIXTURE_OPTIONS,
        title: this.test?.fullTitle(),
      },
      async (driver) => {
        const messageToSign = 'Hello, Stellar!';
        const testDappStellar = new TestDappStellar(driver);

        await testDappStellar.openTestDappPage();

        await connectStellarTestDapp(driver, testDappStellar);

        await testDappStellar.setMessage(messageToSign);
        await testDappStellar.signMessage();

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

        const signMessageConfirmation = new SnapSignMessageConfirmation(driver);
        await signMessageConfirmation.checkPageIsLoaded();
        await signMessageConfirmation.clickFooterConfirmButton();
        await driver.switchToWindowWithTitle(WINDOW_TITLES.StellarTestDApp);

        await testDappStellar.findSignedMessagePresent();
      },
    );
  });
});

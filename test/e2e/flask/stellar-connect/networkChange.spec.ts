import { TestDappStellar } from '../../page-objects/pages/test-dapp-stellar';
import { WINDOW_TITLES } from '../../constants';
import { connectStellarTestDapp } from '../../page-objects/flows/stellar-dapp.flow';
import { switchToNetworkFromNetworkSelect } from '../../page-objects/flows/network.flow';
import { DEFAULT_STELLAR_TEST_DAPP_FIXTURE_OPTIONS } from './testHelpers';
import { withStellarAccountSnap } from './common-stellar';

describe('Stellar Connect - Network change event - e2e tests', function () {
  it('Reflects wallet network switch in the connected dapp', async function () {
    await withStellarAccountSnap(
      {
        ...DEFAULT_STELLAR_TEST_DAPP_FIXTURE_OPTIONS,
        title: this.test?.fullTitle(),
      },
      async (driver) => {
        const testDappStellar = new TestDappStellar(driver);

        await testDappStellar.openTestDappPage();

        await connectStellarTestDapp(driver, testDappStellar, {
          includeTestnet: true,
        });

        await testDappStellar.findHeaderConnectedState();

        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );
        await switchToNetworkFromNetworkSelect(driver, 'Stellar', 'Stellar');
        await testDappStellar.switchTo();
        await testDappStellar.findSelectedNetwork('pubnet');

        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );
        await switchToNetworkFromNetworkSelect(
          driver,
          'Stellar',
          'Stellar Testnet',
        );
        await testDappStellar.switchTo();
        await testDappStellar.findHeaderConnectedState();
        await testDappStellar.findSelectedNetwork('testnet');
      },
    );
  });
});

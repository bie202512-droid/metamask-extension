import { withFixtures } from '../../helpers';
import FixtureBuilderV2 from '../../fixtures/fixture-builder-v2';
import { Driver } from '../../webdriver/driver';
import { login } from '../../page-objects/flows/login.flow';
import NonEvmHomepage from '../../page-objects/pages/home/non-evm-homepage';
import AssetListPage from '../../page-objects/pages/home/asset-list';
import SendPage from '../../page-objects/pages/send/send-page';
import SnapTransactionConfirmation from '../../page-objects/pages/confirmations/snap-transaction-confirmation';
import NetworkManager from '../../page-objects/pages/network-manager';
import ActivityListPage from '../../page-objects/pages/home/activity-list';
import {
  mockStellarApis,
  STELLAR_RECIPIENT_ADDRESS,
} from '../stellar/mocks/common-stellar';

describe('Send Stellar', function () {
  it('it should be possible to send XLM', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilderV2().build(),
        title: this.test?.fullTitle(),
        testSpecificMock: mockStellarApis,
      },
      async ({ driver }: { driver: Driver }) => {
        await login(driver);

        const networkManager = new NetworkManager(driver);
        await networkManager.openNetworkManager();
        await networkManager.selectTab('Popular');
        await networkManager.selectNetworkByNameWithWait('Stellar');

        const nonEvmHomepage = new NonEvmHomepage(driver);
        const assetListPage = new AssetListPage(driver);
        await assetListPage.checkExpectedTokenBalanceIsDisplayed(
          '6.072',
          'XLM',
        );
        const snapTransactionConfirmation = new SnapTransactionConfirmation(
          driver,
        );
        await nonEvmHomepage.clickOnSendButton();
        const sendPage = new SendPage(driver);
        await sendPage.selectToken('stellar:pubnet', 'XLM');

        await sendPage.fillRecipient(STELLAR_RECIPIENT_ADDRESS);
        await sendPage.fillAmount('1');
        await sendPage.pressContinueButton();
        await snapTransactionConfirmation.checkPageIsLoaded();
        await snapTransactionConfirmation.clickFooterConfirmButton();
        const activityList = new ActivityListPage(driver);
        await activityList.checkNoFailedTransactions();
      },
    );
  });
});

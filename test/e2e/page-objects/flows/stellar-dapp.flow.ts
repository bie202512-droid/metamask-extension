import { Driver } from '../../webdriver/driver';
import { TestDappStellar } from '../pages/test-dapp-stellar';
import { WINDOW_TITLES } from '../../constants';
import ConnectAccountConfirmation from '../pages/confirmations/connect-account-confirmation';
import { largeDelayMs } from '../../helpers';

const tryConnectWithRetry = async (
  driver: Driver,
  testDapp: TestDappStellar,
  retries: number,
) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await testDapp.connect();

      const modal = await testDapp.getWalletModal();
      await modal.connectToMetaMaskWallet();

      await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

      return;
    } catch (error) {
      console.warn(
        `Retrying clicking on stellar dapp wallet modal (attempt ${attempt + 1}/${retries})`,
      );

      if (attempt === retries - 1) {
        throw error;
      }

      await driver.delay(largeDelayMs);
    }
  }
};

export const connectStellarTestDapp = async (
  driver: Driver,
  testDapp: TestDappStellar,
): Promise<void> => {
  await testDapp.checkPageIsLoaded();
  await tryConnectWithRetry(driver, testDapp, 3);

  const connectAccountConfirmation = new ConnectAccountConfirmation(driver);
  await connectAccountConfirmation.checkPageIsLoaded();
  await connectAccountConfirmation.confirmConnect();

  await testDapp.switchTo();
};

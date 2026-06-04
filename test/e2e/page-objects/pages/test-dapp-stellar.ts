import { dataTestIds } from '@metamask/test-dapp-stellar';
import { Driver } from '../../webdriver/driver';
import { WINDOW_TITLES } from '../../constants';

const DAPP_HOST_ADDRESS = '127.0.0.1:8080';
const DAPP_URL = `http://${DAPP_HOST_ADDRESS}`;

export class TestDappStellar {
  private readonly driver: Driver;

  private readonly stellarChainDisplay = {
    text: 'stellar:pubnet',
    css: 'div',
  };

  private readonly walletModalSelector = '.wallet-adapter-modal-wrapper';

  private readonly metamaskButtonSelector = {
    css: '.wallet-adapter-button',
    text: 'MetaMask',
  };

  private readonly connectButtonSelector = {
    testId: dataTestIds.testPage.header.connect,
    tag: 'button',
  };

  private readonly disconnectButtonSelector = {
    testId: dataTestIds.testPage.header.disconnect,
    tag: 'button',
  };

  private readonly connectionStatusSelector = (
    text: 'Connected' | 'Not connected',
  ) => ({
    css: `[data-testid="${dataTestIds.testPage.header.connectionStatus}"]`,
    text,
  });

  private readonly connectedAccountSelectorTestId = `[data-testid="${dataTestIds.testPage.header.account}"]`;

  private readonly signedMessageSelectorTestId = `[data-testid="${dataTestIds.testPage.signMessage.signedMessage}"]`;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  async openTestDappPage({
    url = DAPP_URL,
  }: {
    url?: string;
  } = {}): Promise<void> {
    await this.driver.openNewPage(url);
    await this.checkPageIsLoaded();
  }

  async checkPageIsLoaded(): Promise<void> {
    try {
      await this.driver.waitForSelector(this.stellarChainDisplay);
    } catch (e) {
      console.log(
        'Timeout while waiting for Stellar Test Dapp page to be loaded',
        e,
      );
      throw e;
    }
    console.log('Stellar Test Dapp page is loaded');
  }

  async switchTo() {
    await this.driver.switchToWindowWithTitle(WINDOW_TITLES.StellarTestDApp);
    await this.checkPageIsLoaded();
  }

  async getWalletModal() {
    await this.driver.waitForSelector(this.walletModalSelector);

    return {
      connectToMetaMaskWallet: async () => {
        await this.driver.clickElement(this.metamaskButtonSelector);
      },
    };
  }

  async findHeaderConnectedState() {
    await this.driver.findElement(this.connectionStatusSelector('Connected'));
  }

  async findHeaderNotConnectedState() {
    await this.driver.findElement(
      this.connectionStatusSelector('Not connected'),
    );
  }

  async connect() {
    await this.driver.clickElement(this.connectButtonSelector);
  }

  async disconnect() {
    await this.driver.clickElement(this.disconnectButtonSelector);
  }

  async findConnectedAccount(account: string) {
    await this.driver.findElement({
      css: this.connectedAccountSelectorTestId,
      text: account,
    });
  }

  async setMessage(message: string) {
    await this.driver.fill(
      { testId: dataTestIds.testPage.signMessage.message },
      message,
    );
  }

  async signMessage() {
    await this.driver.clickElement({
      testId: dataTestIds.testPage.signMessage.signMessage,
    });
  }

  async findSignedMessage(signedMessage: string) {
    await this.driver.findElement({
      css: this.signedMessageSelectorTestId,
      text: signedMessage,
    });
  }

  async findSignedMessagePresent() {
    const element = await this.driver.findElement({
      css: this.signedMessageSelectorTestId,
    });
    const text = await element.getText();
    if (!text || text.trim().length === 0) {
      throw new Error('Expected signed message to be present');
    }
  }
}

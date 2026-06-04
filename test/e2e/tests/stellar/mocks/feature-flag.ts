import { Mockttp, MockedEndpoint } from 'mockttp';

export const FEATURE_FLAGS_URL =
  'https://client-config.api.cx.metamask.io/v1/flags';

export const BIP44_STAGE_TWO_STELLAR = {
  enableMultichainAccountsState2: {
    enabled: true,
    featureVersion: '2',
    minimumVersion: '12.19.0',
  },
  bitcoinAccounts: {
    enabled: true,
    minimumVersion: '13.6.0',
  },
  tronAccounts: {
    enabled: true,
    minimumVersion: '13.6.0',
  },
  stellarAccounts: {
    enabled: true,
    minimumVersion: '13.6.0',
  },
};

export async function mockStellarFeatureFlags(
  mockServer: Mockttp,
): Promise<MockedEndpoint> {
  return mockServer
    .forGet(FEATURE_FLAGS_URL)
    .withQuery({
      client: 'extension',
      distribution: 'main',
      environment: 'dev',
    })
    .thenCallback(() => ({
      statusCode: 200,
      json: [BIP44_STAGE_TWO_STELLAR],
    }));
}

/* eslint-disable @typescript-eslint/naming-convention */
import { Mockttp, MockedEndpoint } from 'mockttp';
import {
  mockTokensV2SupportedNetworks,
  mockTokensV3Assets,
} from '../../btc/mocks/tokens-api';
import {
  FEATURE_FLAGS_URL,
  mockStellarFeatureFlags,
} from './feature-flag';

export const STELLAR_ACCOUNT_ADDRESS =
  'GABCDEFGHJKLMNPQRSTUVWXYZ234567ABCDEFGHJKLMNPQRSTUVWXYZ2';
export const STELLAR_RECIPIENT_ADDRESS =
  'GABCDEFGHJKLMNPQRSTUVWXYZ234567ABCDEFGHJKLMNPQRSTUVWXYZ3';
export const STELLAR_CHAIN_ID = 'stellar:pubnet';
export const STELLAR_NATIVE_ASSET_ID = `${STELLAR_CHAIN_ID}/slip44:148`;

// XLM balance in stroops (7 decimal places)
export const XLM_BALANCE = 60723920; // ~6.0723920 XLM
export const XLM_TO_USD_RATE = 0.12;
export const STROOPS_PER_XLM = 10_000_000;

export { FEATURE_FLAGS_URL } from './feature-flag';

const HORIZON_MAINNET_BASE = 'https://horizon\\.stellar\\.org';
const HORIZON_TESTNET_BASE = 'https://horizon-testnet\\.stellar\\.org';

function horizonMainnetUrl(path: string): RegExp {
  return new RegExp(`^${HORIZON_MAINNET_BASE}${path}$`, 'u');
}

function horizonTestnetUrl(path: string): RegExp {
  return new RegExp(`^${HORIZON_TESTNET_BASE}${path}$`, 'u');
}

function buildHorizonAccountResponse(balanceStroops: number) {
  return {
    id: STELLAR_ACCOUNT_ADDRESS,
    account_id: STELLAR_ACCOUNT_ADDRESS,
    sequence: '123456789',
    subentry_count: 0,
    balances: [
      {
        balance: String(balanceStroops),
        buying_liabilities: '0',
        selling_liabilities: '0',
        asset_type: 'native',
      },
    ],
    signers: [
      {
        weight: 1,
        key: STELLAR_ACCOUNT_ADDRESS,
        type: 'ed25519_public_key',
      },
    ],
    flags: {
      auth_required: false,
      auth_revocable: false,
      auth_immutable: false,
      auth_clawback_enabled: false,
    },
    thresholds: {
      low_threshold: 0,
      med_threshold: 0,
      high_threshold: 0,
    },
  };
}

export async function mockHorizonAccount(
  mockServer: Mockttp,
  mockZeroBalance?: boolean,
): Promise<MockedEndpoint> {
  const balance = mockZeroBalance ? 0 : XLM_BALANCE;
  const accountJson = buildHorizonAccountResponse(balance);

  return mockServer
    .forGet(
      horizonMainnetUrl(`/accounts/${STELLAR_ACCOUNT_ADDRESS}($|\\?)`),
    )
    .always()
    .thenCallback(() => ({
      statusCode: 200,
      json: accountJson,
    }));
}

export async function mockHorizonTransactions(
  mockServer: Mockttp,
): Promise<MockedEndpoint> {
  return mockServer
    .forGet(
      horizonMainnetUrl(
        `/accounts/${STELLAR_ACCOUNT_ADDRESS}/transactions($|\\?)`,
      ),
    )
    .always()
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        _embedded: {
          records: [
            {
              id: 'stellar-tx-mock-1',
              hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
              successful: true,
              created_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
      },
    }));
}

export async function mockHorizonPayments(
  mockServer: Mockttp,
): Promise<MockedEndpoint> {
  return mockServer
    .forGet(
      horizonMainnetUrl(`/accounts/${STELLAR_ACCOUNT_ADDRESS}/payments($|\\?)`),
    )
    .always()
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        _embedded: {
          records: [],
        },
      },
    }));
}

export async function mockHorizonFeeStats(
  mockServer: Mockttp,
): Promise<MockedEndpoint> {
  const endpoints = [
    horizonMainnetUrl('/fee_stats'),
    horizonTestnetUrl('/fee_stats'),
  ];

  const mock = await mockServer
    .forGet(endpoints[0])
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        last_ledger: '12345',
        ledger_capacity_usage: '0.5',
        fee_charged: { max: '100', min: '100', mode: '100', p10: '100', p20: '100', p30: '100', p40: '100', p50: '100', p60: '100', p70: '100', p80: '100', p90: '100', p95: '100', p99: '100' },
        max_fee: { max: '100', min: '100', mode: '100', p10: '100', p20: '100', p30: '100', p40: '100', p50: '100', p60: '100', p70: '100', p80: '100', p90: '100', p95: '100', p99: '100' },
      },
    }));

  await mockServer.forGet(endpoints[1]).thenCallback(() => ({
    statusCode: 200,
    json: {
      last_ledger: '12345',
      ledger_capacity_usage: '0.5',
      fee_charged: { max: '100', min: '100', mode: '100', p10: '100', p20: '100', p30: '100', p40: '100', p50: '100', p60: '100', p70: '100', p80: '100', p90: '100', p95: '100', p99: '100' },
      max_fee: { max: '100', min: '100', mode: '100', p10: '100', p20: '100', p30: '100', p40: '100', p50: '100', p60: '100', p70: '100', p80: '100', p90: '100', p95: '100', p99: '100' },
    },
  }));

  return mock;
}

export async function mockStellarSpotPrices(
  mockServer: Mockttp,
): Promise<MockedEndpoint> {
  return mockServer
    .forGet(/^https:\/\/price\.api\.cx\.metamask\.io\/v\d+\/spot-prices/u)
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        [STELLAR_NATIVE_ASSET_ID]: {
          usd: XLM_TO_USD_RATE,
        },
      },
    }));
}

export async function mockStellarFiatExchangeRates(
  mockServer: Mockttp,
): Promise<MockedEndpoint> {
  return mockServer
    .forGet(/^https:\/\/price\.api\.cx\.metamask\.io\/v\d+\/exchange-rates/u)
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        usd: {
          name: 'US Dollar',
          ticker: 'USD',
          value: 1,
        },
      },
    }));
}

export async function mockStellarHistoricalPrices(
  mockServer: Mockttp,
): Promise<MockedEndpoint> {
  return mockServer
    .forGet(/^https:\/\/price\.api\.cx\.metamask\.io\/v\d+\/historical-prices/u)
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        [STELLAR_NATIVE_ASSET_ID]: {
          prices: [[Date.now(), XLM_TO_USD_RATE]],
        },
      },
    }));
}

export async function mockStellarSubmitTransaction(
  mockServer: Mockttp,
): Promise<MockedEndpoint> {
  return mockServer
    .forPost(horizonMainnetUrl('/transactions'))
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
        successful: true,
      },
    }));
}

export async function mockStellarApis(
  mockServer: Mockttp,
  mockZeroBalance?: boolean,
): Promise<MockedEndpoint[]> {
  return [
    await mockTokensV2SupportedNetworks(mockServer),
    await mockTokensV3Assets(mockServer),
    await mockStellarFeatureFlags(mockServer),
    await mockHorizonAccount(mockServer, mockZeroBalance),
    await mockHorizonTransactions(mockServer),
    await mockHorizonPayments(mockServer),
    await mockHorizonFeeStats(mockServer),
    await mockStellarSpotPrices(mockServer),
    await mockStellarFiatExchangeRates(mockServer),
    await mockStellarHistoricalPrices(mockServer),
    await mockStellarSubmitTransaction(mockServer),
  ];
}

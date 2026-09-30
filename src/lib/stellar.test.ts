import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  truncateAddress,
  truncateHash,
  formatTimeAgo,
  explorerTxUrl,
  explorerAccountUrl,
} from './stellar'
import { STELLAR_EXPERT_URL } from './constants'

describe('truncateAddress', () => {
  it('returns empty string for empty input', () => {
    expect(truncateAddress('')).toBe('')
  })

  it('returns empty string for undefined/null input', () => {
    expect(truncateAddress('')).toBe('')
  })

  it('truncates with default 6 chars prefix and 4 chars suffix', () => {
    const address = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
    expect(truncateAddress(address)).toBe('GBBD47...FLA5')
  })

  it('truncates with custom chars parameter', () => {
    const address = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
    expect(truncateAddress(address, 4)).toBe('GBBD...FLA5')
  })

  it('handles strings shorter than truncation length', () => {
    const shortAddress = 'GBBD47'
    expect(truncateAddress(shortAddress, 10)).toBe('GBBD47...BD47')
  })

  it('handles strings exactly at truncation length', () => {
    const address = 'GBBD47IF'
    expect(truncateAddress(address, 4)).toBe('GBBD...47IF')
  })
})

describe('truncateHash', () => {
  it('returns empty string for empty input', () => {
    expect(truncateHash('')).toBe('')
  })

  it('returns empty string for undefined/null input', () => {
    expect(truncateHash('')).toBe('')
  })

  it('truncates with default 8 chars prefix and 6 chars suffix', () => {
    const hash = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
    expect(truncateHash(hash)).toBe('a1b2c3d4...x4y5z6')
  })

  it('truncates with custom chars parameter', () => {
    const hash = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
    expect(truncateHash(hash, 4)).toBe('a1b2...x4y5z6')
  })

  it('handles strings shorter than truncation length', () => {
    const shortHash = 'a1b2c3'
    expect(truncateHash(shortHash, 10)).toBe('a1b2c3...a1b2c3')
  })

  it('handles strings exactly at truncation length', () => {
    const hash = 'a1b2c3d4e5f6'
    expect(truncateHash(hash, 4)).toBe('a1b2...d4e5f6')
  })
})

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "0s ago" for current time', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatTimeAgo(now.toISOString())).toBe('0s ago')
  })

  it('returns seconds for times less than 60 seconds', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T11:59:30Z')
    expect(formatTimeAgo(past.toISOString())).toBe('30s ago')
  })

  it('boundary: 59 seconds returns "59s ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T11:59:01Z')
    expect(formatTimeAgo(past.toISOString())).toBe('59s ago')
  })

  it('boundary: 60 seconds returns "1m ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T11:59:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('1m ago')
  })

  it('boundary: 61 seconds returns "1m ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T11:58:59Z')
    expect(formatTimeAgo(past.toISOString())).toBe('1m ago')
  })

  it('returns minutes for times less than 60 minutes', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T11:30:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('30m ago')
  })

  it('boundary: 59 minutes returns "59m ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T11:01:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('59m ago')
  })

  it('boundary: 60 minutes returns "1h ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T11:00:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('1h ago')
  })

  it('boundary: 61 minutes returns "1h ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T10:59:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('1h ago')
  })

  it('returns hours for times less than 24 hours', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2024-01-01T06:00:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('6h ago')
  })

  it('boundary: 23 hours returns "23h ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2023-12-31T13:00:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('23h ago')
  })

  it('boundary: 24 hours returns "1d ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2023-12-31T12:00:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('1d ago')
  })

  it('boundary: 25 hours returns "1d ago"', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2023-12-31T11:00:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('1d ago')
  })

  it('returns days for times greater than 24 hours', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const past = new Date('2023-12-30T12:00:00Z')
    expect(formatTimeAgo(past.toISOString())).toBe('2d ago')
  })

  it('handles future dates (returns negative seconds)', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const future = new Date('2024-01-01T12:01:00Z')
    expect(formatTimeAgo(future.toISOString())).toBe('-60s ago')
  })

  it('handles future dates with negative seconds', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    const future = new Date('2024-01-01T13:00:00Z')
    expect(formatTimeAgo(future.toISOString())).toBe('-3600s ago')
  })
})

describe('explorerTxUrl', () => {
  it('generates correct transaction URL', () => {
    const hash = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
    expect(explorerTxUrl(hash)).toBe(`${STELLAR_EXPERT_URL}/tx/${hash}`)
  })

  it('generates URL pointing to the correct network', () => {
    const hash = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
    const url = explorerTxUrl(hash)
    expect(url).toContain(STELLAR_EXPERT_URL)
    expect(url).toContain('/tx/')
  })
})

describe('explorerAccountUrl', () => {
  it('generates correct account URL', () => {
    const address = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
    expect(explorerAccountUrl(address)).toBe(`${STELLAR_EXPERT_URL}/account/${address}`)
  })

  it('generates URL pointing to the correct network', () => {
    const address = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
    const url = explorerAccountUrl(address)
    expect(url).toContain(STELLAR_EXPERT_URL)
    expect(url).toContain('/account/')
  })
})

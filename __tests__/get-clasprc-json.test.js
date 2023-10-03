/**
 * Unit tests for src/getClasprcJSON.js
 */

const { expect } = require('@jest/globals')
const {
  getClasprcJSON,
  defaultGlobalScope,
  defaultLocalScope
} = require('../src/get-clasprc-json')

describe('getClasprcJson', () => {
  it('return correct formatted clasprc json', () => {
    const ret = getClasprcJSON('testId', 'testSecret', 'testToken')
    expect(Object.keys(ret).sort()).toEqual(
      ['token', 'oauth2ClientSettings', 'isLocalCreds'].sort()
    )
    expect(Object.keys(ret.token).sort()).toEqual(
      [
        'access_token',
        'scope',
        'token_type',
        'expiry_date',
        'refresh_token'
      ].sort()
    )
    expect(Object.keys(ret.oauth2ClientSettings).sort()).toEqual(
      ['clientId', 'clientSecret', 'redirectUri'].sort()
    )

    expect(ret).toMatchObject({
      token: {
        access_token: expect.any(String),
        scope: expect.any(String),
        token_type: 'Bearer',
        expiry_date: expect.any(Number),
        refresh_token: expect.any(String)
      },
      oauth2ClientSettings: {
        clientId: expect.any(String),
        clientSecret: expect.any(String),
        redirectUri: 'http://localhost'
      },
      isLocalCreds: expect.any(Boolean)
    })
  })

  it('return global clasprc json by default', () => {
    const ret = getClasprcJSON('testId', 'testSecret', 'testToken')

    expect(ret).toMatchObject({
      token: {
        access_token: '',
        scope: defaultGlobalScope,
        token_type: 'Bearer',
        expiry_date: 0,
        refresh_token: 'testToken'
      },
      oauth2ClientSettings: {
        clientId: 'testId',
        clientSecret: 'testSecret',
        redirectUri: 'http://localhost'
      },
      isLocalCreds: false
    })
  })

  it('return local clasprc json default scope', () => {
    const ret = getClasprcJSON('testId', 'testSecret', 'testToken', true)

    expect(ret).toMatchObject({
      token: {
        access_token: '',
        scope: defaultLocalScope,
        token_type: 'Bearer',
        expiry_date: 0,
        refresh_token: 'testToken'
      },
      oauth2ClientSettings: {
        clientId: 'testId',
        clientSecret: 'testSecret',
        redirectUri: 'http://localhost'
      },
      isLocalCreds: true
    })
  })

  it('return specific scope', () => {
    const ret = getClasprcJSON(
      'testId',
      'testSecret',
      'testToken',
      true,
      'testScope'
    )

    expect(ret).toMatchObject({
      token: {
        access_token: '',
        scope: 'testScope',
        token_type: 'Bearer',
        expiry_date: 0,
        refresh_token: 'testToken'
      },
      oauth2ClientSettings: {
        clientId: 'testId',
        clientSecret: 'testSecret',
        redirectUri: 'http://localhost'
      },
      isLocalCreds: true
    })
  })
})

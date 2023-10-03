/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */
const core = require('@actions/core')
const main = require('../src/main')
const { getClasprcJSON } = require('../src/get-clasprc-json')
const { expect } = require('@jest/globals')
const os = require('os')
const path = require('path')

// file system mocking
const fs = require('fs')
const { vol } = require('memfs')
jest.mock('fs')

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
let testForLocalFile = false
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation(name => {
  switch (name) {
    case 'client-id':
      return 'testIdGlobal'
    case 'client-secret':
      return 'testSecret'
    case 'refresh-token':
      return 'testToken'
    case 'gcp-client-id':
      return testForLocalFile ? 'testIdLocal' : ''
    case 'gcp-client-secret':
      return testForLocalFile ? 'testSecretLocal' : ''
    case 'gcp-refresh-token':
      return testForLocalFile ? 'testTokenLocal' : ''
    default:
      return ''
  }
})

// Mock getClasprcJson
jest.mock('../src/get-clasprc-json', () => ({
  getClasprcJSON: jest.fn()
}))
getClasprcJSON.mockImplementation(clientId =>
  clientId === 'testIdGlobal'
    ? { MyTestContent: 'global' }
    : { MyTestContent: 'local' }
)

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    vol.reset()
    testForLocalFile = false
  })

  it('create global cred file', async () => {
    // Set Virtual Home Path
    const home = os
      .homedir()
      .replace(/^[a-zA-Z]:/, '')
      .replaceAll('\\', '/')
    vol.mkdirSync(home, { recursive: true })

    await main.run()

    // Test No Fail
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()

    // Test interaction with getInput
    expect(getInputMock).toHaveBeenCalledWith('client-id', expect.anything())
    expect(getInputMock).toHaveBeenCalledWith(
      'client-secret',
      expect.anything()
    )
    expect(getInputMock).toHaveBeenCalledWith(
      'refresh-token',
      expect.anything()
    )
    expect(getInputMock).toHaveBeenCalledWith('gcp-client-id')
    expect(getInputMock).toHaveBeenCalledWith('gcp-client-secret')
    expect(getInputMock).toHaveBeenCalledWith('gcp-refresh-token')

    // Test interaction with getClasprcJSON
    expect(getClasprcJSON).toHaveBeenCalledTimes(1)
    expect(getClasprcJSON).toHaveBeenCalledWith(
      'testIdGlobal',
      'testSecret',
      'testToken'
    )

    // Test created file
    const filePath = path.join(home, '.clasprc.json')
    expect(vol.existsSync(filePath)).toBe(true)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    expect(fileContent).toBe('{"MyTestContent":"global"}')
  })

  it('create local cred file', async () => {
    // Set Virtual Home Path
    const home = os
      .homedir()
      .replace(/^[a-zA-Z]:/, '')
      .replaceAll('\\', '/')
    vol.mkdirSync(home, { recursive: true })
    // activate input for local file
    testForLocalFile = true
    // Set Local Path
    const local = process
      .cwd()
      .replace(/^[a-zA-Z]:/, '')
      .replaceAll('\\', '/')
    vol.mkdirSync(local, { recursive: true })

    await main.run()

    // Test No Fail
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()

    // Test interaction with getInput
    expect(getInputMock).toHaveBeenCalledWith('client-id', expect.anything())
    expect(getInputMock).toHaveBeenCalledWith(
      'client-secret',
      expect.anything()
    )
    expect(getInputMock).toHaveBeenCalledWith(
      'refresh-token',
      expect.anything()
    )
    expect(getInputMock).toHaveBeenCalledWith('gcp-client-id')
    expect(getInputMock).toHaveBeenCalledWith('gcp-client-secret')
    expect(getInputMock).toHaveBeenCalledWith('gcp-refresh-token')

    // Test interaction with getClasprcJSON
    expect(getClasprcJSON).toHaveBeenCalledTimes(2)
    expect(getClasprcJSON).toHaveBeenCalledWith(
      'testIdGlobal',
      'testSecret',
      'testToken'
    )
    expect(getClasprcJSON).toHaveBeenCalledWith(
      'testIdLocal',
      'testSecretLocal',
      'testTokenLocal'
    )

    // Test global created file
    let filePath = path.join(home, '.clasprc.json')
    expect(vol.existsSync(filePath)).toBe(true)
    let fileContent = fs.readFileSync(filePath, 'utf-8')
    expect(fileContent).toBe('{"MyTestContent":"global"}')

    // Test local created file
    filePath = path.join(local, '.clasprc.json')
    expect(vol.existsSync(filePath)).toBe(true)
    fileContent = fs.readFileSync(filePath, 'utf-8')
    expect(fileContent).toBe('{"MyTestContent":"local"}')
  })

  it('fails if no required input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'client-id':
          throw new Error('Input required and not supplied: client-id')
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: client-id'
    )
  })
})

const core = require('@actions/core')
const fs = require('fs')
const { getClasprcJSON } = require('./get-clasprc-json')
const homeDir = require('os').homedir()

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const clientId = core.getInput('client-id', { required: true })
    const clientSecret = core.getInput('client-secret', { required: true })
    const refreshToken = core.getInput('refresh-token', { required: true })
    const gcpClientId = core.getInput('gcp-client-id')
    const gcpClientSecret = core.getInput('gcp-client-secret')
    const gcpRefreshToken = core.getInput('gcp-refresh-token')

    const claspGlobalJSON = getClasprcJSON(clientId, clientSecret, refreshToken)
    await fs.promises.writeFile(
      require('path').join(homeDir, '.clasprc.json'),
      JSON.stringify(claspGlobalJSON)
    )

    if (
      gcpClientId !== '' &&
      gcpClientSecret !== '' &&
      gcpRefreshToken !== ''
    ) {
      core.debug(`Local file generation requested`)
      const claspLocalJSON = getClasprcJSON(
        gcpClientId,
        gcpClientSecret,
        gcpRefreshToken
      )
      await fs.promises.writeFile(
        '.clasprc.json',
        JSON.stringify(claspLocalJSON)
      )
    }

    // // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    // core.debug(`Waiting ${ms} milliseconds ...`)

    // // Log the current timestamp, wait, then log the new timestamp
    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // // Set outputs for other workflow steps to use
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}

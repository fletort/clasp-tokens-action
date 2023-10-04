const defaultGlobalScope =
  'https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/logging.read https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/script.webapp.deploy https://www.googleapis.com/auth/script.deployments https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/service.management'
const defaultLocalScope = 'https://www.googleapis.com/auth/script.webapp.deploy'

/**
 * Create .clasprc.json file content
 * @param {string} clientID The oauth2 client Id
 * @param {string} arg_clientSecret The oauth2 client Secret
 * @param {string} refreshToken The refreshToken
 * @param {string} isLocalCred Indicates if credential are global (false) or local (true). False by default.
 * @param {string} arg_scope The token scope, set to default scope of local file by default.
 * @returns {String} .clasprc.json file content
 */
function getClasprcJSON(
  clientID,
  arg_clientSecret,
  refreshToken,
  isLocalCred = false,
  arg_scope = null
) {
  if (arg_scope == null) {
    arg_scope = isLocalCred ? defaultLocalScope : defaultGlobalScope
  }

  return {
    token: {
      access_token: '',
      scope: arg_scope,
      token_type: 'Bearer',
      expiry_date: 0,
      refresh_token: refreshToken
    },
    oauth2ClientSettings: {
      clientId: clientID,
      clientSecret: arg_clientSecret,
      redirectUri: 'http://localhost'
    },
    isLocalCreds: isLocalCred
  }
}

module.exports = { getClasprcJSON, defaultGlobalScope, defaultLocalScope }

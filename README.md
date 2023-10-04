# Clasp Tokens Action

This action allows you to create global and local `.clasprc.json` files.

It give a "way" to use clasp (and so Google Apps Script API) from CI/CD
context. This workaround is needed as Google Apps Script API doesn't work with
service accounts (See below)

Global `.clasprc.json` file (in the home directory) is needed to push projects
in Google App Script.

Local `.clasprc.json` file (in the project directory) is needed to run the
current project from the command line.
In this context, the Google App Script needs to be linked to a custom Google
Cloud Project and local `.clasprc.json`is used to authenticate to this
**G**oogle **C**loud **P**lateform project.
This link explains what is required to can _run_ your script remotely:
<https://developers.google.com/apps-script/api/how-tos/execute>.

## Inputs

### Inputs dedicated to global App Script authentication

#### `client-id`

**Required** The ClientID of the project.

#### `client-secret`

**Required** The ClientSecret of the project.

#### `refresh-token`

**Required** RefreshToken of the user.

### Inputs dedicated to local GCP authentication

#### `gcp-client-id`

The ClientID of the Google Cloud Project.

#### `gcp-client-secret`

The ClientSecret of the Google Cloud Project.

#### `gcp-refresh-token`

RefreshToken of the GCP user.

## How to get the value of the inputs

### Global App Script authentication

You need to install [clasp](https://github.com/google/clasp) to get the values.

- Install clasp

```bash
npm install -g @google/clasp
```

- Login to clasp

```bash
clasp login
```

- Get values from generated file in your home directory

```bash
cat ~/.clasprc.json
```

- Put theses values in GitHub secret. This can be done at a high level
([organization/account][github-organization-secret]) or
[environment][github-env-secret] as this credential is unique
for all the app script project of your account.

### Local GCP authentication

- You need to follow this Setup [Instructions][clasp-run-instructions] that
explain how to link your project to a custom Google Cloud Project to get
your GCP credential. This step must be done from a valid AppScript project
directory. This setup is the quick-howto version of the given previous
link: <https://developers.google.com/apps-script/api/how-tos/execute>.

- Get values from generated file on the project (local) directory

```bash
cat ./.clasprc.json
```

- Put theses values in GitHub secret. Usually this will be done at
[repository level][github-repo-secret] as this credential is dedicated to the
targeted GCP project.
In the case that your GCP project is linked to all your AppScript project
(use only for run from ci/cd context for exemple), then these secrets could
also be defined at a higher level.

## Example usage

Define only the global authentication for clasp :

```bash
uses: fletort/clasp-tokens-action@v1.0.0
with:
  client-id: ${{ secrets.GASP_CLIENT_ID }}
  client-secret: ${{ secrets.GASP_CLIENT_SECRET }}
  refresh-token: ${{ secrets.GASP_REFRESH_TOKEN }}
```

Define global and local authentication for clasp/GCP:

```bash
uses: fletort/clasp-tokens-action@v1.0.0
with:
  client-id: ${{ secrets.GASP_CLIENT_ID }}
  client-secret: ${{ secrets.GASP_CLIENT_SECRET }}
  refresh-token: ${{ secrets.GASP_REFRESH_TOKEN }}
  gcp-client-id: ${{ secrets.GASP_GCP_CLIENT_ID }}
  gcp-client-secret: ${{ secrets.GASP_GCP_CLIENT_SECRET }}
  gcp-refresh-token: ${{ secrets.GASP_GCP_REFRESH_TOKEN }}
```

You can specify the clasp command in your npm scripts. For example

package.json

```bash
{
  "name": "my-project",
  "version": "0.0.1",
  "script": {
    "push-to-app": "clasp push",
    "run-in-gasp": "clasp run"
  }
}
```

## The correct way: GCP Service Accounts

The whole system described here copying the credentials out of your
two `.clasprc.json` files.

The "correct" way to setup a server to server connection like is through
a GCP service account. It is possible to login clasp using a key file
for a service account. However, the [Apps Scripts API][apps-script-sapi] does
not work with service accounts.

- [Execution API - cant use service account](https://issuetracker.google.com/issues/36763096)
- [Can the Google Apps Script Execution API be called by a service account?](https://stackoverflow.com/questions/33306299/can-the-google-apps-script-execution-api-be-called-by-a-service-account)
  
### Related Issues

- [Provide instructions for deploying via CI #707](https://github.com/google/clasp/issues/707)
- [Handle rc files preferring local over global to make clasp more CI friendly #486](https://github.com/google/clasp/pull/486)
- [Integration with CI pipeline and Jenkins #524](https://github.com/google/clasp/issues/524)
- [How to use a service account for CI deployments #225](https://github.com/google/clasp/issues/225)

## Credits

- This action is mainly inspired from [clasp-token-action] with multiples modifications/enhancements
(add local pipeline, add local authentication, ...)
- Thanks also to @ericanastas  for its research around its project [deploy-google-app-script-action]

[github-organization-secret]: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-an-organization
[github-env-secret]: https://docs.github.com/en/actions/security-guides/
[github-repo-secret]: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository
[clasp-run-instructions]: https://github.com/google/clasp/blob/master/docs/run.md#setup-instructions
[apps-script-sapi]: https://developers.google.com/apps-script/api/concepts
[clasp-token-action]: https://github.com/namaggarwal/clasp-token-action
[deploy-google-app-script-action]: https://github.com/ericanastas/deploy-google-app-script-action

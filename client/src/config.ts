// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
// ya52zhfxqe
// const apiId = 'ya52zhfxqe'
const apiId = 'x3ld0qhyr9'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-4qddwwc2.auth0.com',            // Auth0 domain
  clientId: 'MgXMov3fjmaoHfolsiJmTpZ7et6UwXTS',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

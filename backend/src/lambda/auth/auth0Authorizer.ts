import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJAJXakqFolzDNMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi00cWRkd3djMi5hdXRoMC5jb20wHhcNMjAwNDE5MjI0NjUzWhcNMzMx
MjI3MjI0NjUzWjAhMR8wHQYDVQQDExZkZXYtNHFkZHd3YzIuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm4j/xWFmvBsUgCqdei+Mj6Zu
2BVPvkSiS9RDSY3E3i0s7agBZIvVzeh5EYBRqBTA8kZHCwIslkyeBLwXwLU+vSCd
rLoG0rMtc9cdVyXpB6dTOfDBO+RQCOAsL+tCU4oUJFdB16zOpAPkoETOM8WI97Ja
rzKTVwtF5tgGIhIOf/Wo5GtokX5rQyucEZWeu6nym7BSKswKSmFL1nl78k6CUrtx
klrVlpxUpg+QXoM5c7jQfz4UTQ2iw2jSkKnSnJdPEAMqTn+pai+tzIOqoPIouUAV
G4x/GamuEeWVbgxi+7psZ0p4cqcmQXX1O1UwkuAU/g1jSFjnmU9t8PzdxqadMwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQM7kyqImuf+lIHBxAS
wizijqyW6jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBABwHLHCw
uKGpRyimd4tXvtpA4hseFoMRqT2xshrhKWBQ0Eg2MU1+bMLD17Fr9w8oKUxhRIE9
/L5ZphuHc59Jc7Q6rw8CgIQZkinvJDyb7VE7+rdBK6vbAXd0gPewWSV9JQtNdfzX
yHW10boMGsN4ZlKJ2KJGK744v8gDoBTJqMm4smw1Hzrw24NCOLlR554aG6SzEuT/
MZXQtjYSxYQhq+2SjxJViL1hp8SNi2cMnq6ZuFGxcqVxPw5Q7XNI/GR30o9EifWH
udiiMx7Dg4VE5omGCmzyWv5LlIdtfE/k5ZMWcpYVsGKE99PbiX0NBrfmshCZXovb
Q3HFvSMoR9PpzR8=
-----END CERTIFICATE-----`


// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-4qddwwc2.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  console.log(jwt)
  
  const retJwt = verify(token, cert, { algorithms: ['RS256']}) as JwtPayload

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
 
  return retJwt

}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
# Indigestion

[![npm version](https://img.shields.io/npm/v/indigestion.svg?style=plastic)](https://www.npmjs.org/package/indigestion)
[![node version](https://img.shields.io/node/v/indigestion?style=plastic&color=blue)](https://www.npmjs.org/package/indigestion)
[![install size](https://packagephobia.now.sh/badge?p=indigestion)](https://packagephobia.now.sh/result?p=indigestion)

Digest Authentication header generator. Takes the `www-authenticate` header response and returns the `Digest...` header as a string.

## Setup

- In your project, install via `npm install indigestion`

## Use

- Import `indigestion`

```
import indigestion = require("indigestion");
```

- Pass in the appropriate information to the `generateDigestAuth()` function

```
const digest = indigestion.generateDigestAuth({
    authenticateHeader: `Digest qop="auth-int", realm="realm", nonce="nonce"`,
    username: "username",
    password: "password",
    uri: "uri"
    method: "method",
    cnonce: "cnonce", //optional
    nc: "nc", //optional
    entityBody: "entityBody" //optional
})
```

### Notes

- If `cnonce` is not provided, it will default to `""`.
- If `nc` (nonce count) is not provided, it will default to `"00000000"`.
  - If `nc` is provided, the returned `nc` will be the provided `nc` + 1 (in hexadecimal)
- If using `qop=auth-int`, `entityBody` is not optional

## Nonce Count

- If the nonce count is needed for subsequent calls, use the `findNonceCount()` function to easily parse the information

```
const nc = indigestion.findNonceCount(`Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" qop=auth-int nc=1234ABCD cnonce="" response=04f863229e7ea0b17120ab0ef97e4649`);
```

The above will return `1234ABCD`.

## FAQs

- What is the purpose of this library?
  - This library will return a digest authentication header. Simply pass in the required information, including the `www-authenticate` response header from the initial 401 response.
- Why not use an existing Digest Authentication library?
  - This library is for use cases not covered by existing libraries, such as `axios-digest`, `digest-fetch` or `node-digest-auth-client`, where you want to control the request being sent and just need to be able to pass in the auth header.
  - What would that look like? Using `axios`, something like this...

```
import axios = require("axios");
import indigestion = require("indigestion);

return new Promise((resolve, reject) => {
      axios
        .get("http://www.test.com/test")
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          if (error.response.status !== 401) reject(error);
          else {
              // If we get a 401 response, we know we have to generate a header.
              // Pull the `www-authenticate` header from the response headers
              const authenticateHeader = error.response.headers["www-authenticate"];
              // Pass in required information to indigestion, which returns the auth string
              const authorization = indigestion.generateDigestAuth({
                  authenticateHeader,
                  username: "username",
                  password: "password",
                  uri: "/test"
                  method: "GET"
              })
              // Try the GET again, this time with the Authorization header specified.
              axios
                .get("http://www.test.com/test", { headers: {Authorization: authorization}})
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    reject(error);
                })
          }
        });
    });
```

- I found an issue with the library or have a suggestion to improve the library.
  - Please raise an issue or suggestion on the github. Or, if you feel so inclined, create a PR to fix the problem or implement the suggestion.
- Why does this library require node v12.0.0 or above?
  - The `String.prototype.matchAll()` functionality used requires node v12.0.0 and above.

## Caveats

- I've only been able to do extensive testing with real devices for the case where:
  - `qop=auth`
  - `opaque` is insignificant and NOT provided by the `www-authenticate` header
  - `cnonce` is insignificant and NOT provided by the `www-authenticate` header
  - `algorithm` is not specified in `www-authenticate` header, so `md5` is defaulted
- This means I've been unable to test:
  - `qop=auth-int` or `qop` is not provided by `www-authenticate` header
  - `opaque` is significant and provided by `www-authenticate` header
  - `cnonce` is signficant and provided by `www-authenticate` header
  - `algorithm` is specified as `md5` or `md5-sess`

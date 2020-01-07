# Indigestion

## Setup

- In your project, install via `npm install indigestion`
  - To include the associated types, `npm install @types/indigestion`

## Use

- Import `indigestion`

```
import dg = require("indigestion");
```

- Pass in the appropriate information to the `generateDigestAuth()` function

```
const digest = dg.generateDigestAuth({
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
const nc = dg.findNonceCount(`Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" qop=auth-int nc=00000000 cnonce="" response=04f863229e7ea0b17120ab0ef97e4649`);
```

The above will return `00000000`.

## FAQs

- What is the purpose of this library?
  - This library will return a digest authentication header. Simply pass in the required information, including the `www-authenticate` response header from the initial 401 response.
- Why not use an existing Digest Authentication library?
  - This library is for use cases not covered by existing libraries, such as `axios-digest`, `digest-fetch` or `node-digest-auth-client`, where you want to control the request being sent and just need to be able to pass in the auth header.
- I found and issue with the library or have a suggestion to improve the library.
  - Please raise an issue or suggestion on the github. Or, if you feel so inclined, create a PR to fix the problem or implement the suggestion.
- Why does this library require node v12.0.0 or above?
  - The `String.prototype.matchAll()` functionality used requires node v12.0.0 and above.

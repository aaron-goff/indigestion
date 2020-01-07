import * as generator from "../src/modules/generator";
import assert = require("assert");

describe("Generator tests", () => {
  const username = "username";
  const password = "password";
  const uri = "/uri";
  const realm = "realm";
  const nonce = "ce16c4a1092c8152f673edab4e56cbdc";
  const method = "GET";
  const qop = "auth";

  function generateHeader() {
    return `Digest qop="${qop}", realm="${realm}", nonce="${nonce}"`;
  }

  it("Should Generate the Correct Digest Header if algorithm is not present", () => {
    const expectedResponse = `Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" qop=auth nc=00000000 cnonce="" response=2251b33018e338aa337f7ab0236cd106`;
    const response = generator.generateDigestAuth({
      authenticateHeader: generateHeader(),
      username,
      password,
      uri,
      method
    });

    assert.deepEqual(
      response,
      expectedResponse,
      "Expected response does not match actual response!"
    );
  });

  it("Should Generate the Correct Digest Header if algorithm is MD5-sess", () => {
    const expectedResponse = `Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5-sess" qop=auth nc=00000000 cnonce="" response=37aa907fbcf51a5f4297392525885c3a`;
    let header = generateHeader();
    header += `, algorithm="MD5-sess"`;
    const response = generator.generateDigestAuth({
      authenticateHeader: header,
      username,
      password,
      uri,
      method
    });

    assert.deepEqual(
      response,
      expectedResponse,
      "Expected response does not match actual response!"
    );
  });

  it("Should Generate the Correct Digest Header if Nonce Count increases", () => {
    const expectedResponse = `Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" qop=auth nc=1234abce cnonce="" response=238db766879fb1cd9d55d51cec507839`;
    const response = generator.generateDigestAuth({
      authenticateHeader: generateHeader(),
      username,
      password,
      uri,
      method,
      nc: "1234ABCD"
    });

    assert.deepEqual(
      response,
      expectedResponse,
      "Expected response does not match actual response!"
    );
  });

  it("Should Return the Correct Nonce Count", () => {
    const response = generator.generateDigestAuth({
      authenticateHeader: generateHeader(),
      username,
      password,
      uri,
      method,
      nc: "3456CBAF"
    });

    const expectedNc = "3456CBB0";
    const nc = generator.findNonceCount(response).toUpperCase();

    assert.deepEqual(
      nc,
      expectedNc,
      "Expected nonce count does not match actual nonce count"
    );
  });

  it("Should Generate the Correct Digest Header if Client Nonce is provided", () => {
    const expectedResponse = `Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" qop=auth nc=00000000 cnonce="ABCD1234" response=5ab953554a06aa8c22f54241f11585f9`;
    const response = generator.generateDigestAuth({
      authenticateHeader: generateHeader(),
      username,
      password,
      uri,
      method,
      cnonce: "ABCD1234"
    });

    assert.deepEqual(
      response,
      expectedResponse,
      "Expected response does not match actual response!"
    );
  });

  it("Should Generate the Correct Digest Header if Method is lowercase", () => {
    const expectedResponse = `Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" qop=auth nc=00000000 cnonce="" response=2251b33018e338aa337f7ab0236cd106`;
    const response = generator.generateDigestAuth({
      authenticateHeader: generateHeader(),
      username,
      password,
      uri,
      method: "get"
    });

    assert.deepEqual(
      response,
      expectedResponse,
      "Expected response does not match actual response!"
    );
  });

  it("Should Generate the Correct Digest Header if Opaque is provided", () => {
    const expectedResponse = `Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" qop=auth nc=00000000 cnonce="" opaque="EDCB0987" response=2251b33018e338aa337f7ab0236cd106`;
    let header = generateHeader();
    header += `, opaque="EDCB0987"`;
    const response = generator.generateDigestAuth({
      authenticateHeader: header,
      username,
      password,
      uri,
      method
    });

    assert.deepEqual(
      response,
      expectedResponse,
      "Expected response does not match actual response!"
    );
  });

  it("Should Generate the Correct Digest Header if qop is omitted", () => {
    const expectedResponse = `Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" response=ed0c3abc6c936b2a16d54e819ae31b93`;
    const header = `Digest realm="${realm}", nonce="${nonce}"`;
    const response = generator.generateDigestAuth({
      authenticateHeader: header,
      username,
      password,
      uri,
      method
    });

    assert.deepEqual(
      response,
      expectedResponse,
      "Expected response does not match actual response!"
    );
  });

  it("Should Generate the Correct Digest Header if qop is auth-int", () => {
    const expectedResponse = `Digest username="username" realm="realm" nonce="ce16c4a1092c8152f673edab4e56cbdc" uri="/uri" algorithm="MD5" qop=auth-int nc=00000000 cnonce="" response=04f863229e7ea0b17120ab0ef97e4649`;
    const header = `Digest qop="auth-int", realm="${realm}", nonce="${nonce}"`;
    const response = generator.generateDigestAuth({
      authenticateHeader: header,
      username,
      password,
      uri,
      method,
      entityBody: "This is the entity body"
    });

    assert.deepEqual(
      response,
      expectedResponse,
      "Expected response does not match actual response!"
    );
  });
});

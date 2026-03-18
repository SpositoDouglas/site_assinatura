const crypto = require('crypto');

describe('Testes de Validação de Assinatura (Positivo e Negativo)', () => {
  let publicKey, privateKey, validSignature;
  const textContent = "Este é um documento importante para o teste.";

  beforeAll(() => {
    const keys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
  });

  test('Teste de Validação POSITIVA: Assinatura autêntica e texto inalterado', () => {
    const sign = crypto.createSign('SHA256');
    sign.update(textContent);
    sign.end();
    validSignature = sign.sign(privateKey, 'base64');

    const verify = crypto.createVerify('SHA256');
    verify.update(textContent);
    verify.end();
    const isValid = verify.verify(publicKey, validSignature, 'base64');

    expect(isValid).toBe(true);
  });

  test('Teste de Validação NEGATIVA: Texto alterado após a assinatura', () => {
    const alteredText = "Este é um documento importante para o teste. - FRAUDE";

    const verify = crypto.createVerify('SHA256');
    verify.update(alteredText);
    verify.end();
    const isValid = verify.verify(publicKey, validSignature, 'base64');

    expect(isValid).toBe(false);
  });
});
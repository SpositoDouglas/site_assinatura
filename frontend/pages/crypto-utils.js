function cleanPem(pem) { return pem.replace(/-----BEGIN[^-]+-----|-----END[^-]+-----|\s/g, ''); }

async function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

async function importPrivateKey(pemKey) {
    const cleanBase64 = cleanPem(pemKey);
    const binaryDer = await base64ToArrayBuffer(cleanBase64);
    return window.crypto.subtle.importKey(
        'pkcs8', binaryDer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
    );
}

async function signTextReal(text, privateKeyPem) {
    const privateKey = await importPrivateKey(privateKeyPem);
    const encodedText = new TextEncoder().encode(text);
    const signatureBuffer = await window.crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, encodedText);
    return arrayBufferToBase64(signatureBuffer);
}
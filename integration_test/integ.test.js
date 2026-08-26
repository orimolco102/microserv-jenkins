const { test, before, after } = require("node:test");
const assert = require('node:assert');
const { execSync } = require("child_process");
const { resolve } = require("node:dns");
const { getAssetAsBlob } = require("node:sea");

async function waitForService(url, timeoutMs = 15000, interMs = 500) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(url);
            if (res.ok) return true;
        } catch (err) {
            
        }
        await new Promise(resolve => setTimeout(resolve, interMs));
    }
    throw new Error(`service at ${url} did not become ready within ${timeoutMs}ms `)
}

before(async () => {
    //מעלה את הדוקרים ומפעיל את הפונקציה שבודקת האם הקונטירים עלו בהצלחה
    execSync('docker compose up -d --build', {stdio: 'inherit'});
    await waitForService('http://localhost:8080/health');
    await waitForService('http://localhost:8080/status');
});

test('status returns 200 and is ok', async () => {
    const res = await fetch('http://localhost:8080/status');
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
});

test('stastus returns the build and commit', async () => {
    const res = await fetch('http://localhost:8080/status');
    const data = await res.json();

    assert.ok(data.build, 'build num is defined');
    assert.ok(data.commit, 'commit num is defined');
});

test('api sends currect messages', async () => {
    const res = await fetch('http://localhost:8080/status');
    const data = await res.json();
    
    assert.strictEqual(data.message, 'The api and front end are talking!!!');
});

test('random function with currect input', async () => {
    const res = await fetch ('http://localhost:8080/random?min=7&max=7');
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.result, 7);
});

test('random test with invalid input returns 400', async () => {
    const res = await fetch ('http://localhost:8080/random?min=adsf&max=7');

    assert.strictEqual(res.status, 400);
});

after(() => {
    //מכבה את הקונטיינרים לאחר שכל הבדיקות הסתיימו
    execSync('docker compose down', { stdio: 'inherit' });
});
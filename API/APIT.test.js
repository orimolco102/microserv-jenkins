const test = require('node:test');
const assert = require('assert');
const request = require('supertest');
const {app} = require('./api.js');

test('GET /health returns the status and build number', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok('build' in res.body);
    assert.ok('commit' in res.body);
});

test('/data returns the currect default message', async () => {
    const res = await request(app).get('/data');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, 'The api and front end are talking!!!');
});

test('GET /random returns a default value', async () => {
    const res = await request(app).get('/random?min=7&max=7');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.result, 7);
});

test('GET /random returns 400 with invalid input', async () => {
    const res = await request(app).get('/random?min=abc&max=10');
    assert.strictEqual(res.status, 400);
});

test('GET /random with min value grater then max', async () => {
    const res = await request(app).get('/random?min=10&max=1');
    assert.strictEqual(res.status, 400);
});
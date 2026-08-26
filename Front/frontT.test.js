const test = require('node:test');
const assert = require('assert');
const request = require('supertest');
const { app } = require('./server.js');
const { error } = require('console');


test('GET /status the API returns the currect values', async () => {
    const originalFetch = global.fetch;

    global.fetch = async (url) => {
        //call 1 to the health url
        if (url.includes('/health')) {
            return {
                ok: true,
                json: async () => ({
                    status: 'ok',
                    build: '1',
                    commit: 'abc123'
                })
            };
        }
        //call 2 to the data url
        if (url.includes('/data')) {
            return {
                ok: true,
                json: async () => ({ message: "The api and front end are talking!!!" })
            };
        }
    };

    try {
        const res = await request(app).get('/status');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.build, '1');
        assert.strictEqual(res.body.commit, 'abc123');
        assert.strictEqual(res.body.message, 'The api and front end are talking!!!');
    } finally {
        global.fetch = originalFetch;
    }
});

test('GET /status returns 500 api health is bad', async () => {
    const originalFetch = global.fetch;

    global.fetch = async () => ({
        ok: false,
        status: 500
    });

    try {
        const res = await request(app).get('/status');
        assert.strictEqual(res.status, 500);
    } finally {
        global.fetch = originalFetch;
    }
});

test('GET /health returns values without the API', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok('build' in res.body);
    assert.ok('commit' in res.body);  
});

test('GET /test sends the request and getting the res from the API', async () => {
    const originalFetch = global.fetch;

    global.fetch = async () => ({
        ok: true,
        status:  200,
        json: async () => ({ result: 7})
    });

    try {
        const res = await request(app).get('/random?min=7&max=7');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.result, 7);
    } finally {
        global.fetch = originalFetch;
    }
});

test('GET /random returns invalid values', async () => {
    const originalFetch = global.fetch;

    global.fetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: 'min value is grater hten max'})
    });

    try {
        const res = await request(app).get('/random?min=45&max=5');
        assert.strictEqual(res.status, 400);
        assert.ok('error' in res.body);
    } finally {
        global.fetch = originalFetch;
    }
});
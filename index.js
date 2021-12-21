/*
encrypt and decrypt are from: https://gist.github.com/lyquix-owner/2ad6459672c1b8ec826b0b59f4e220d3
*/
const express = require('express');
var requestify = require('requestify');
const {
    text
} = require('body-parser');
//const axios = require("axios")
const frida = require("frida")
const app = express();
function encrypt(key, plaintext) {
    let cyphertext = [];
    // Convert to hex to properly handle UTF8
    plaintext = Array.from(plaintext).map(function(c) {
        if (c.charCodeAt(0) < 128) return c.charCodeAt(0).toString(16).padStart(2, '0');
        else return encodeURIComponent(c).replace(/\%/g, '').toLowerCase();
    }).join('');
    // Convert each hex to decimal
    plaintext = plaintext.match(/.{1,2}/g).map(x => parseInt(x, 16));
    // Perform xor operation
    for (let i = 0; i < plaintext.length; i++) {
        cyphertext.push(plaintext[i] ^ key.charCodeAt(Math.floor(i % key.length)));
    }
    // Convert to hex
    cyphertext = cyphertext.map(function(x) {
        return x.toString(16).padStart(2, '0');
    });
    return cyphertext.join('');
}
function decrypt(key, cyphertext) {
    try {
        cyphertext = cyphertext.match(/.{1,2}/g).map(x => parseInt(x, 16));
        let plaintext = [];
        for (let i = 0; i < cyphertext.length; i++) {
            plaintext.push((cyphertext[i] ^ key.charCodeAt(Math.floor(i % key.length))).toString(16).padStart(2, '0'));
        }
        return decodeURIComponent('%' + plaintext.join('').match(/.{1,2}/g).join('%'));
    }
    catch(e) {
        return false;
    }
}
app.use(text({
    type: () => 1
}));
app.post('/sb9838/tools/frida-compile', (req, res) => {
    //const result = compileToBytecode(req.body)
    async function attachToSystemSession() {
        let frida;

        try {
            frida = require('frida');
        } catch (e) {
            throw new Error('frida module is not installed');
        }

        return await frida.attach(0);
    }

    function getSystemSession() {
        getSystemSessionRequest = attachToSystemSession();
        return getSystemSessionRequest;
    }

    async function compileToBytecode(source) {
        const systemSession = await getSystemSession();
        const bytecode = await systemSession.compileScript(source)
        return bytecode;
    }
    //  console.log(result)
    //const db = result.toString('hex');

    async function sender() {
        db = await compileToBytecode(req.body);
        //console.log('sending... ')
        await res.end(db)
    }
    if (req.body) {
        sender()
    } else {
        res.end("S.B's api say: WRONG USAGE\nERROR: A REQUIRED ARGUMENT IS MISSING");
    }
});
app.post('/sb9838/tools/encrypt', (req, res) => {
    //console.log("new connection!");
    //console.log(req.headers.key);
    async function setupenc() {
        result = await encrypt(req.headers.key, req.body)
        await res.end(result)
    }
    if (req.body && req.headers.key) {
        setupenc();
    } else {
        res.end("S.B's api say: WRONG USAGE\nERROR: A REQUIRED ARGUMENT IS MISSING")
    }
});
app.post('/sb9838/tools/decrypt', (req, res) => {
    //console.log("new connection!");
    async function setupdec() {
        result = await decrypt(req.headers.key, req.body)
        await res.end(result)
    }
    if (req.body && req.headers.key) {
        setupdec();
    } else {
        res.end("S.B's api say: WRONG USAGE\nERROR: A REQUIRED ARGUMENT IS MISSING")
    }
});


app.get('/', (req, res) => {
    const welcomer = "Welcome to S.B's api. Click here to join the discord server!"
    res.end(welcomer.link("https://discord.gg/b2ejYcJjqA").bold());
});
app.listen(3000, () => console.log(`S.B's api started!`));

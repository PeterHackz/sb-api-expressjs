/*
** Original code by S.B (SB-9898)
** Improved by tailsjs.
*/

const express = require('express');
const app = express();
const frida = require("frida");

app.use(express.text({
    type: () => 1
}));

app.post('/sb9838/tools/frida-compile', async(req, res) => {
    if(!req.body)return res.send("APIError! Required argument is missing.");

    const compiled = await frida.attach(0).compileScript(req.body);

    return res.send(compiled)
});

app.post('/sb9838/tools/encrypt', async(req, res) => {
    if(!req.body && !req.headers.key)return res.send("APIError! Required argument is missing.");
    
    return await encrypt(req.headers.key, req.body)
});

app.post('/sb9838/tools/decrypt', async(req, res) => {
    if(!req.body && !req.headers.key)return res.send("APIError! Required argument is missing.");
    
    return await decrypt(req.headers.key, req.body)
});


app.get('/', (req, res) => {
    return res.send('<a href="https://discord.gg/b2ejYcJjqA"><b>Welcome to S.B\'s api. Click here to join the discord server!</b></a>')
});

app.listen(3000, () => console.log(`S.B's api started!`));

function encrypt(key, plaintext) {
    let cyphertext = [];
    plaintext = Array.from(plaintext).map(function(c) {
        if (c.charCodeAt(0) < 128) return c.charCodeAt(0).toString(16).padStart(2, '0');
        else return encodeURIComponent(c).replace(/\%/g, '').toLowerCase();
    }).join('');
    plaintext = plaintext.match(/.{1,2}/g).map(x => parseInt(x, 16));

    for (let i = 0; i < plaintext.length; i++) 
        cyphertext.push(plaintext[i] ^ key.charCodeAt(Math.floor(i % key.length)));

    cyphertext = cyphertext.map(function(x) {
        return x.toString(16).padStart(2, '0');
    });
    return cyphertext.join('');
}
/*
** encrypt and decrypt are from: https://gist.github.com/lyquix-owner/2ad6459672c1b8ec826b0b59f4e220d3 (s.b comment)
*/
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

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
	Buffer
} from 'node:buffer';
const Mustache = require('mustache');
let count = 0;

async function imageUrlToBase64(url) {
	try {
		const response = await fetch(url);

		const blob = await response.arrayBuffer();

		const contentType = response.headers.get('content-type');

		const base64String = `data:${contentType};base64,${Buffer.from(
      blob,
    ).toString('base64')}`;

		return base64String;
	} catch (err) {
		console.log(err);
	}
}

export default {
	async fetch(request, env, ctx) {
		try {
			const url = new URL(request.url);

			if (url.pathname === "/") {
				return new Response(`{"usage": "${url.origin}/<url>"}`);
			}


			count++

			let response;

			if (url.pathname.endsWith('.svg')) {
				let options = {
					headers: {
						"content-type": "image/svg+xml",
						"Cache-Control": "no-cache"
					}
				}
				if (url.pathname.startsWith('/user') && url.searchParams.has('nickname')) {
					let nickname = url.searchParams.get('nickname');
					let dataUser = await fetch('https://shikimori.one/api/users/' + nickname).then(r => r.json());
					let avatarURI1 = await imageUrlToBase64(dataUser.image.x160);
					let file = await fetch('https://pastebin.com/raw/nQwviCs6').then(r => r.text());
					//console.log(file);
					const output = Mustache.render(file, {
						avatarURI: avatarURI1,
						lastOnline: dataUser.last_online
					});

					response = new Response(output, options);
					return response
				} else if (url.pathname.startsWith('/time')) {
					let date = new Date();
					response = new Response(date);
					return response
				} else if (url.pathname.startsWith('/torrent')) {
					let ll = {
						rand: function() {
								return (Math.random() * (100 - 1) + 1).toFixed(2);
							}
						}
					let file = await fetch('https://pastebin.com/raw/Td5nf0Qk').then(r => r.text());
					const output = Mustache.render(file, ll);
					return new Response(output, options);
					}
				}

				response = new Response('no')
				//addHeaders(response);
				return response;
			} catch (e) {
				return new Response(e.stack || e, {
					status: 500
				});
			}
		},
	};

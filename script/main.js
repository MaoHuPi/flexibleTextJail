const THEME_COLOR = '#92deff';
const THEME_COLOR_DARK = '#36687e';

(async () => {
	/* basic canvas setup */
	const cvs = document.querySelector('#view-canvas');
	const ctx = cvs.getContext('2d');
	const [CW, CH] = [1920, 1080];
	[cvs.width, cvs.height] = [CW, CH];
	cvs.style.setProperty('--w-h-ratio', `${CW}/${CH}`);

	/* get all manner of materials */
	async function getData(url) {
		return await fetch(url).then(r => r.json());
	}
	function loadMaterial(url, _constructor, eventName = 'onload') {
		return new Promise(resolve => {
			let element = new _constructor();
			element[eventName] = () => {
				resolve(element);
			};
			element.src = url;
		});
	}
	const imageCatch = {};
	async function getImage(url) {
		if (url in imageCatch) {
			return imageCatch[url];
		} else {
			let image = await loadMaterial(url, Image);
			imageCatch[url] = image;
			return (image);
		}
	}
	const audioCatch = {};
	async function getAudio(url) {
		if (url in audioCatch) {
			return audioCatch[url];
		} else {
			let audio = await loadMaterial(url, Audio, 'oncanplaythrough');
			audioCatch[url] = audio;
			return (audio);
		}
	}
	let bgm;
	let currentBgm = { url: '', volume: 0 };
	const bgmAudioObjPool = {};
	async function changeBgm(url, volume) {
		if (currentBgm.url !== url || currentBgm.volume !== volume) {
			bgm?.pause ? bgm.pause() : false;
			currentBgm = { url, volume };
			bgm = new PerfectLoop();
			if (!(url in bgmAudioObjPool)) bgmAudioObjPool[url] = [];
			while (bgmAudioObjPool[url].length < 2) bgmAudioObjPool[url].push((await getAudio(url))/* .cloneNode() */);
			for (let i = 0; i < 2; i++) {
				let audio = bgmAudioObjPool[url][i];
				audio.volume = volume;
				bgm.push(audio);
			}
			bgm.play();
			if (bgm.paused) {
				currentBgm = { url: '', volume: 0 };
			}
		}
	}
	// await changeBgm('audio/MaoHuPi - horrorWasteland_loop.wav', 0.5);
	// function playBgmOnce() {
	// 	bgm.play();
	// 	document.body.removeEventListener('click', playBgmOnce);
	// }
	// document.body.addEventListener('click', playBgmOnce);

	/* render method */
	const menuData = await getData('data/menu.json');
	const dialogData = await getData('data/dialog.json');
	async function renderMenu(menuName) {
		const data = menuData[menuName];
		if (!data) return;
		let newMH = false;
		ctx.save();
		async function drawButton(element) {
			ctx.strokeStyle = THEME_COLOR_DARK;
			ctx.fillStyle = THEME_COLOR_DARK;
			ctx.lineWidth = 5;
			ctx.font = '50px 微軟正黑';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			if (
				MX > element.display?.x && MY > element.display?.y &&
				MX < element.display?.x + element.display?.w && MY < element.display?.y + element.display?.h
			) {
				newMH = true;
				ctx.strokeStyle = THEME_COLOR;
				ctx.fillStyle = THEME_COLOR;
				if (MC) {
					currentScenes = element.destination;
					(await getAudio('audio/select.wav')).play().catch(e => { });
					MC = false;
				}
			}
			ctx.strokeRect(element.display?.x, element.display?.y, element.display?.w, element.display?.h);
			ctx.save();
			ctx.fillStyle = '#00000055';
			ctx.fillRect(element.display?.x, element.display?.y, element.display?.w, element.display?.h);
			ctx.restore();
			ctx.fillText(element.label, element.display?.x + element.display?.w / 2, element.display?.y + element.display?.h / 2);
		}
		for (let element of data.elements) {
			switch (element.type) {
				case 'rect':
					if (element.fill !== undefined) {
						ctx.fillStyle = element.fill;
						ctx.fillRect(element.display?.x, element.display?.y, element.display?.w, element.display?.h);
					}
					if (element.stroke !== undefined) {
						ctx.strokeStyle = element.stroke;
						ctx.strokeRect(element.display?.x, element.display?.y, element.display?.w, element.display?.h);
					}
					break;
				case 'image':
					ctx.drawImage(await getImage(element.url), element.display?.x, element.display?.y, element.display?.w, element.display?.h);
					break;
				case 'button':
					await drawButton(element);
					break;
				case 'buttonList':
					for (let i = 0; i < element.button.length; i++) {
						let buttonDisplayData = {
							x: element.display?.x + (element.display?.xInc !== undefined ? element.display?.xInc : 0) * i,
							y: element.display?.y + (element.display?.yInc !== undefined ? element.display?.yInc : 0) * i,
							w: element.display?.w,
							h: element.display?.h
						}
						await drawButton({ display: buttonDisplayData, label: element.button[i].label, destination: element.button[i].destination });
					}
					break;
				case 'buttonGrid':
					for (let r = 0; r < element.button.length; r++) {
						for (let c = 0; c < element.button[r].length; c++) {
							let buttonDisplayData = {
								x: element.display?.x + (element.display?.xInc !== undefined ? element.display?.xInc : 0) * c,
								y: element.display?.y + (element.display?.yInc !== undefined ? element.display?.yInc : 0) * r,
								w: element.display?.w,
								h: element.display?.h
							}
							await drawButton({ display: buttonDisplayData, label: element.button[r][c].label, destination: element.button[r][c].destination });
						}
					}
					break;
			}
		}
		ctx.restore();
		MC = false;
		if (newMH !== MH) {
			MH = newMH;
			if (newMH) {
				let audio = await getAudio('audio/select.wav');
				audio.volume = 0.4;
				audio.play().catch(e => { });
			}
		}
	}
	const gameVariable = {};
	gameVariable['place'] = '房間';
	gameVariable['object'] = '無';
	gameVariable['s'] = '';
	gameVariable['v'] = '';
	gameVariable['o'] = '';
	async function renderScenes(scenesName) {
		if (scenesName.includes('menu-')) {
			await changeBgm('audio/MaoHuPi - horrorWasteland_loop.wav', 0.5);
			await renderMenu(scenesName.replace('menu-', ''));
		}
		else {
			switch (scenesName) {
				case 'dialog':
					await changeBgm('audio/MaoHuPi - horrorDesert_loop.wav', 0.5);
					let action = `${gameVariable['s']}-${gameVariable['v']}-${gameVariable['o']}`;
					let dialog = {
						"image": false,
						"message": "",
						"words": [],
						"at": gameVariable['place'],
						"check": gameVariable['object']
					};
					if (`${action}@${gameVariable['place']}>${gameVariable['object']}` in dialogData) {
						dialog = dialogData[`${action}@${gameVariable['place']}>${gameVariable['object']}`];
					} else if (`${action}@${gameVariable['place']}>*` in dialogData) {
						dialog = dialogData[`${action}@${gameVariable['place']}>*`];
					} else if (`${action}@*>*` in dialogData) {
						dialog = dialogData[`${action}@*>*`];
					}
					if (dialog.image) {
						ctx.drawImage(await getImage(dialog.image), 0, 0, CW, CH);
					}
					// else{
					// 	ctx.fillRect();
					// }
					ctx.lineWidth = 5;
					ctx.font = '50px 微軟正黑';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillStyle = '#00000088';
					ctx.strokeStyle = THEME_COLOR;
					ctx.fillRect(470, 730, 1400, 300);
					ctx.strokeRect(470, 730, 1400, 300);
					
					ctx.fillText(dialog.message, 470, 730);
					ctx.fillRect(50, 50, 370, 980);
					ctx.strokeRect(50, 50, 370, 980);
					ctx.strokeStyle = '#ffc107';
					ctx.strokeRect(470, 590, 440, 100);
					ctx.strokeStyle = '#ff5722';
					ctx.strokeRect(470+(440+40), 590, 440, 100);
					ctx.strokeStyle = '#ffc107';
					// ctx.strokeStyle = '#4caf50';
					ctx.strokeRect(470+(440+40)*2, 590, 440, 100);
					break;
			}
		}
	}

	let currentScenes = 'menu-main';
	// let currentScenes = 'dialog';
	async function gameLoop() {
		await renderScenes(currentScenes);
		setTimeout(await gameLoop, 50);
	}
	function main() {
		gameLoop();
	}

	let boundingRect = cvs.getBoundingClientRect();
	let [MX, MY, MC, MH] = [0, 0, false, false];
	cvs.addEventListener('mousemove', event => {
		[MX, MY] = [(event.pageX - boundingRect.x) / boundingRect.width * CW, (event.pageY - boundingRect.y) / boundingRect.height * CH];
	});
	cvs.addEventListener('click', event => {
		[MX, MY] = [(event.pageX - boundingRect.x) / boundingRect.width * CW, (event.pageY - boundingRect.y) / boundingRect.height * CH];
		MC = true;
	});
	window.addEventListener("resize", () => {
		boundingRect = cvs.getBoundingClientRect();
	});
	main();
})();
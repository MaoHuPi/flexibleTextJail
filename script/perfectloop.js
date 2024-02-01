/*
 * 2023 (c) MaoHuPi
 * PerfectLoopJS/perfectloop.js
 */

class PerfectLoop{
	#audioList = [];
	#playingIndex = 0;
	constructor(param = {}){
		param = {
			bringForward: 0.1, 
			...param
		}
		this.bringForward = param.bringForward;
		setInterval(() => {
			let audio = this.#audioList[this.#playingIndex];
			if(audio && audio.duration - audio.currentTime < this.bringForward){
				this.#playingIndex = this.#playingIndex > this.#audioList.length-2 ? 0 : this.#playingIndex+1;
				this.#audioList[this.#playingIndex].play();
			}
		}, 30);
	}
	push(...newAudio){
		newAudio.forEach(audio => {
			audio.loop = false;
			audio.mute = false;
			audio.pause();
			audio.currentTime = 0;
		})
		this.#audioList.push(...newAudio);
	}
	play(){
		this.#audioList[this.#playingIndex]?.play().catch(function(error) {
			// console.log(error);
		});
	}
	pause(){this.#audioList[this.#playingIndex]?.pause();}
	get paused(){return this.#audioList[this.#playingIndex].paused;}
}
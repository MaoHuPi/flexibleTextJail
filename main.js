(() => {
	const cvs = document.querySelector('#view-canvas');
	const ctx = cvs.getContext('2d');
	const [CW, CH] = [1920, 1080];
	[cvs.width, cvs.height] = [CW, CH];
	cvs.style.setProperty('--w-h-ratio', `${CW}/${CH}`);

	let currentScenes = scenes_menu;
	function gameLoop(){
		currentScenes();
		setTimeout(gameLoop, 50);
	}
	function main(){
		gameLoop();
	}

	let  boundingRect = cvs.getBoundingClientRect();
	let [MX, MY, MC] = [0, 0, false];
	cvs.addEventListener('mousemove', event => {
		[MX, MY] = [(event.pageX-boundingRect.x)/boundingRect.width*CW, (event.pageY-boundingRect.y)/boundingRect.height*CH];
	});
	cvs.addEventListener('click', event => {
		[MX, MY] = [(event.pageX-boundingRect.x)/boundingRect.width*CW, (event.pageY-boundingRect.y)/boundingRect.height*CH];
		MC = true;
	});

	function scenes_menu(){
		ctx.save();
		ctx.fillStyle = '#2e2e2e';
		ctx.fillRect(0, 0, CW, CH);
		let buttonData = [
			{label: '章節', destination: scenes_charter}, 
			{label: '設定', destination: scenes_settings}, 
			{label: '關於', destination: scenes_about}, 
		];
		let displayData = {
			x: (CW-CW/2)/2, 
			y: CH/2, 
			width: CW/2, 
			height: CH/2, 
			gap: 50
		};
		let buttonHeight = (displayData.height - displayData.gap)/buttonData.length - displayData.gap;
		for(let i = 0; i < buttonData.length; i++){
			let buttonDisplayData = {
				x: displayData.x+displayData.gap, 
				y: displayData.y+displayData.gap+(buttonHeight+displayData.gap)*i, 
				width: displayData.width - displayData.gap*2, 
				height: buttonHeight
			}
			ctx.strokeStyle = 'gray';
			ctx.fillStyle = 'gray';
			ctx.lineWidth = 5;
			ctx.font = '50px 微軟正黑';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			if(
				MX > buttonDisplayData.x && MY > buttonDisplayData.y && 
				MX < buttonDisplayData.x+buttonDisplayData.width && MY < buttonDisplayData.y+buttonDisplayData.height
			){
				ctx.strokeStyle = 'white';
				ctx.fillStyle = 'white';
				if(MC){
					currentScenes = buttonData[i].destination;
					MC = false;
				}
			}
			ctx.strokeRect(buttonDisplayData.x, buttonDisplayData.y, buttonDisplayData.width, buttonDisplayData.height);
			ctx.fillText(buttonData[i].label, buttonDisplayData.x+buttonDisplayData.width/2, buttonDisplayData.y+buttonDisplayData.height/2);
		}
		ctx.restore();
	}
	function scenes_charter(){
		ctx.save();
		ctx.fillStyle = '#2e2e2e';
		ctx.fillRect(0, 0, CW, CH);
		ctx.restore();
	}
	function scenes_settings(){
		ctx.save();
		ctx.fillStyle = '#2e2e2e';
		ctx.fillRect(0, 0, CW, CH);
		ctx.restore();
	}
	function scenes_about(){
		ctx.save();
		ctx.fillStyle = '#2e2e2e';
		ctx.fillRect(0, 0, CW, CH);
		ctx.restore();
	}

	main();
})();
// Subtle pointer-following glow. The actual visual lives in CSS (body::before);
// here we only feed it the pointer position via custom properties.
const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)');

if (motionOk.matches && window.matchMedia('(pointer: fine)').matches) {
	const root = document.documentElement;
	let frame = 0;
	let targetX = window.innerWidth / 2;
	let targetY = window.innerHeight / 4;

	const apply = () => {
		frame = 0;
		root.style.setProperty('--pointer-x', `${targetX}px`);
		root.style.setProperty('--pointer-y', `${targetY}px`);
	};

	window.addEventListener(
		'pointermove',
		event => {
			targetX = event.clientX;
			targetY = event.clientY;
			if (!frame) frame = requestAnimationFrame(apply);
		},
		{ passive: true }
	);
}

import { SOUND } from "./sound";

export enum ControlKey {
    UP,
    DOWN,
    LEFT,
    RIGHT,
	DEBUG
}

const KEY_MAP: { [id: string]: ControlKey } = {
	"ArrowUp": ControlKey.UP,
	"KeyW": ControlKey.UP,
	"ArrowDown": ControlKey.DOWN,
	"KeyS": ControlKey.DOWN,
	"ArrowLeft": ControlKey.LEFT,
	"KeyA": ControlKey.LEFT,
	"ArrowRight": ControlKey.RIGHT,
	"KeyD": ControlKey.RIGHT,
	"KeyP": ControlKey.DEBUG
};

const keys = {};

function setKey(code: string, down: boolean) {
	const c = KEY_MAP[code];
	if (c != undefined) {
		keys[c] = down;
	}
	SOUND.resume()
}

export function registerKeyboard() {
	window.addEventListener("keydown", evt => {
		setKey(evt.code, true);
		if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(evt.code) > -1) {
			evt.preventDefault();
			return false;
		}
		return true;
	});
	window.addEventListener("keyup", evt => setKey(evt.code, false));
}

export function keyDown(keyCode: ControlKey) {
	return !!keys[keyCode];
}

export function keyPressed(keyCode: ControlKey) {
	if (keys[keyCode]) {
		keys[keyCode] = false;
		return true;
	}
	return false;
}
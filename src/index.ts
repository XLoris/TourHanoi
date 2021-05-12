import * as PIXI from "pixi.js";
import "./style.css";
import sample from "./sample";

declare const VERSION: string;

type GameState = [number[], number[], number[]];

type GraphicsContainer = PIXI.Graphics[];
type DeltaState = {
    from: number;
    to: number;
}[];

console.log(sample.states);

type Palet = {
    position: { x: number; y: number };
    taille: { width: number; height: number };
    color: number;
};

const RECT_HEIGHT = 30;
function taille_of_n(num: number) {
    return num * 70;
}
function color_of_n() {
    return 0xff00ff;
}

const place_column = (x: number) => (column: number[]): Palet[] => {
    return column.map((num, i) => {
        return {
            position: {
                x: x,
                y: 200 - i * RECT_HEIGHT,
            },
            taille: {
                width: taille_of_n(num),
                height: RECT_HEIGHT,
            },
            color: 0xff00ff,
        };
    });
};
function place_palets(state: GameState) {
    const xs = state.map((_, i) => i * 400 + 200);
    return state.flatMap((col, i) => place_column(xs[i])(col));
}

function rectangle(object: Palet) {
    const box = new PIXI.Graphics();
    box.beginFill(object.color);
    box.drawRect(-(object.taille.width / 2), -(object.taille.height / 2), object.taille.width, object.taille.height);
    box.endFill();
    box.position.x = object.position.x;
    box.position.y = object.position.y;
    return box;
}

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}

PIXI.utils.sayHello(type);

const app = new PIXI.Application({
    width: 1250,
    height: 600,
    backgroundColor: 0xffffff,
    resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const container = new PIXI.Container();
app.stage.addChild(container);

const background = PIXI.Texture.from("assets/images/FOND.png");

function setup(nPalets: number) {
    let rectangles: GraphicsContainer = [];
    const bg = new PIXI.Sprite(background);
    bg.anchor.set(0.5);
    bg.scale.set(0.8);
    bg.x = 600;
    bg.y = 250;
    container.addChild(bg);
    let build: Palet[] = [];

    function init(initialState: GameState) {
        build = place_palets(initialState);
        rectangles = build.map((palet) => {
            const forme = rectangle(palet);
            container.addChild(forme);
            return forme;
        });
    }

    return function process(N: number, state: GameState, delta?: DeltaState) {
        if (N === 0) {
            init(state);
        }
        let palets = place_palets(state);
        palets.map((palet, i) => {
            rectangles[i].position.set(palet.position.x, palet.position.y);
            rectangles[i].width = palet.taille.width;
        });
    };
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function test() {
    let process = setup(sample.states[0].state[0].length);
    for (let i = 0; i < sample.states.length; i++) {
        console.log(`etape ${i} ${JSON.stringify(sample.states[i].state)}`);
        process(i, sample.states[i].state as GameState);
        await delay(1000);
    }
}

test();

export { PIXI };

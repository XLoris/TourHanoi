import * as PIXI from "pixi.js";
import "./style.css";
import sample from "./sample";
import { cpuUsage } from "node:process";

declare const VERSION: string;

type GameState = [number[], number[], number[]];

type GraphicsContainer = PIXI.NineSlicePlane[];
type DeltaState = {
    from: number;
    to: number;
}[];

//console.log(sample.states);

type Palet = {
    position: { x: number; y: number };
    taille: { width: number; height: number };
    color: number;
};

const RECT_HEIGHT = 50;

const RECT_COLORS = [0x7101f8, 0x6da2ef, 0x6def94];

function taille_of_n(num: number) {
    return num * 120;
}
function color_of_n(num: number) {
    return RECT_COLORS[num - 1];
}

const place_column = (x: number) => (column: number[]): Palet[] => {
    return column.map((num, i) => {
        return {
            position: {
                x: x,
                y: 330 - i * RECT_HEIGHT,
            },
            taille: {
                width: taille_of_n(num),
                height: RECT_HEIGHT,
            },
            color: color_of_n(num),
        };
    });
};
function place_palets(state: GameState) {
    const xs = state.map((_, i) => i * 400 + 200);
    return state.flatMap((col, i) => place_column(xs[i])(col));
}

function rectangle(object: Palet) {
    const box = new PIXI.NineSlicePlane(plane, 30, 30, 30, 30);
    box.width = object.taille.width;
    box.height = object.taille.height;
    box.tint = object.color;
    box.position.set(object.position.x - box.width / 2, object.position.y - box.height / 2);
    return box;
}

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}

PIXI.utils.sayHello(type);

const size = [window.innerWidth, window.innerHeight];
const ratio = size[0] / size[1];

const app = new PIXI.Application({
    width: size[0],
    height: size[1],
    backgroundColor: 0xafafaf,
    resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);
resize();
function resize() {
    if (window.innerWidth / window.innerHeight >= ratio) {
        var w = window.innerHeight * ratio;
        var h = window.innerHeight;
    } else {
        var w = window.innerWidth;
        var h = window.innerWidth / ratio;
    }
    app.view.style.width = w + "px";
    app.view.style.height = h + "px";
}
window.onresize = function () {
    resize();
};

const container = new PIXI.Container();
app.stage.addChild(container);

const background = PIXI.Texture.from("assets/images/FOND.png");
const plane = PIXI.Texture.from("assets/images/BoxWithRoundedCorners.png");

function setup(nPalets: number) {
    let rectangles: GraphicsContainer = [];
    const bg = new PIXI.Sprite(background);
    bg.anchor.set(0.5);
    bg.scale.set(0.815);
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

    function updateRect(rect: PIXI.NineSlicePlane, palet: Palet) {
        rect.tint = palet.color;
        rect.position.set(palet.position.x - palet.taille.width / 2, palet.position.y - palet.taille.height / 2);
        rect.width = palet.taille.width;
    }

    return function process(N: number, state: GameState, delta?: DeltaState) {
        if (N === 0) {
            init(state);
        }

        let palets = place_palets(state);
        palets.map((palet, i) => {
            updateRect(rectangles[i], palet);
        });
    };
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function test() {
    let process = setup(sample.states[0].state[0].length);
    for (let i = 0; i < sample.states.length; i++) {
        //console.log(`etape ${i} ${JSON.stringify(sample.states[i].state)}`);
        process(i, sample.states[i].state as GameState);
        await delay(1000);
    }
}

test();

export { PIXI };

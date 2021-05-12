import * as PIXI from "pixi.js";
import "./style.css";

declare const VERSION: string;

type GameState = [number[], number[], number[]];

type GraphicsContainer = [PIXI.Graphics[], PIXI.Graphics[], PIXI.Graphics[]];

type DeltaState = [number, number];

const start: GameState = [
    [38, 30, 20, 12], // 0
    [], // 100
    [], // 200
];

const position: GraphicsContainer = [[], [], []];

type Palet = {
    position: { x: number; y: number };
    taille: { width: number; height: number };
    color: number;
};

function centre_to_haut_gauche(
    pos: { x: number; y: number },
    taille: { x: number; y: number }
): { x: number; y: number } {
    return {
        x: pos.x - taille.x / 2,
        y: pos.y - taille.y / 2,
    };
}

const RECT_HEIGHT = 30;
function taille_of_n(num: number) {
    return num * 7;
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
    return state.map((col, i) => place_column(xs[i])(col));
}

function rectangle(object: Palet) {
    const box = new PIXI.Graphics();
    box.beginFill(object.color);
    box.drawRect(-(object.taille.width / 2), -(object.taille.height / 2), object.taille.width, object.taille.height);
    box.endFill();
    box.position.x = object.position.x + object.taille.width / 2;
    box.position.y = object.position.y + object.taille.height / 2;
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

const background = PIXI.Texture.from("images/FOND.png");

function setup(start: GameState, position: GraphicsContainer) {
    const bg = new PIXI.Sprite(background);
    bg.anchor.set(0.5);
    bg.x = 1000;
    bg.y = 100;
    container.addChild(bg);
    const build = place_palets(start);
    for (var i = 0; i < 4; i++) {
        const forme = rectangle(build[0][i]);
        position[0].push(forme);
        container.addChild(position[0][i]);
    }
}

function process(state: GameState, position: GraphicsContainer, delta: DeltaState) {
    state[delta[1]].push(state[delta[0]][state[delta[0]].length - 1]);
    state[delta[0]].pop();
    position[delta[1]].push(position[delta[0]][position[delta[0]].length - 1]);
    position[delta[0]].pop();

    let pos = place_palets(state);
    for (var i = 0; i < 3; i++) {
        position[i].map((rect, z) => rect.position.set(pos[i][z].position.x, pos[i][z].position.y));
    }
}

setup(start, position);

process(start, position, [0, 2]);

console.log(position[0][0].y);

export { PIXI };

import * as PIXI from "pixi.js";
import "./style.css";
import sample from "./sample";
import { cpuUsage } from "node:process";
import { NineSlicePlane, State } from "pixi.js";

declare const VERSION: string;

type GameState = [number[], number[], number[]];

type GraphicsContainer = GraphicPalet[];
type DeltaState = {
    from: number;
    to: number;
}[];

//console.log(sample.states);

type Palet = {
    position: { x: number; y: number };
    taille: { width: number; height: number };
    color: number;
    num: number;
};

const RECT_HEIGHT = 50;

const RECT_WIDTH = 120;

const RECT_COLORS = [0x7101f8, 0x6da2ef, 0x6def94];

function taille_of_n(num: number) {
    return num * RECT_WIDTH; /// Changer num en indice de num
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
            num: num,
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

type Position = {
    x: number;
    y: number;
};

const animation_speed: number = 1 / 2;

class GraphicPalet {
    public id: number;
    private old_pos: Position;
    private target_pos: Position;
    public t: number;
    public graphics_pos: Position;
    public graphics: NineSlicePlane;

    constructor(palet: Palet, id: number) {
        this.id = id;
        this.old_pos = palet.position;
        this.target_pos = palet.position;
        this.graphics_pos = palet.position;
        console.log(this.old_pos);
        this.t = 1;
        this.graphics = rectangle(palet);
    }

    set_pos = (pos: Position) => {
        this.old_pos = this.target_pos;
        this.target_pos = pos;
        if (this.old_pos.x != this.target_pos.x) {
            this.t = 0;
        }
    };

    // chaque frame, (call dans le ticker)
    animate = () => {
        let width = this.graphics.width / 2;
        let height = this.graphics.height / 2;
        this.t = Math.min(1, this.t + animation_speed * (ticker.deltaMS / 1000));
        if (this.t < 1) {
            let posRect: Position = interpChemin(
                [
                    pos(this.old_pos.x - width, this.old_pos.y - height),
                    pos(this.old_pos.x - width, 5),
                    pos(this.target_pos.x - width, 5),
                    pos(this.target_pos.x - width, this.target_pos.y - height),
                ],
                EasingFunctions.linear
            )(this.t);

            this.graphics.x = posRect.x;
            this.graphics.y = posRect.y;
        }
    };
}

type Chemin = Position[];

const interpChemin = (chemin: Chemin, easing: EasingFunction) => (t: number): Position => {
    /** */
    if (chemin.length <= 2) {
        throw new Error("chemin trop court");
    }
    const n = chemin.length;
    for (let i = 0; i < n - 1; i++) {
        // on quitte la boucle si on est pas dans l'intervalle considéré
        if (!(i <= t * (n - 1) && t * (n - 1) <= i + 1)) continue;
        // on se ramene entre 0 et 1
        const _t = t * (n - 1) - i;
        // on renvoie le point correspondant
        return interp(EasingFunctions.easeInOutQuad)(chemin[i], chemin[i + 1], _t);
    }
    return { x: 0, y: 0 };
};

// from https://gist.github.com/gre/1650294
type EasingFunction = (t: number) => number;
const EasingFunctions: Record<string, EasingFunction> = {
    // no easing, no acceleration
    linear: (t) => t,
    // accelerating from zero velocity
    easeInQuad: (t) => t * t,
    // decelerating to zero velocity
    easeOutQuad: (t) => t * (2 - t),
    // acceleration until halfway, then deceleration
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    // accelerating from zero velocity
    easeInCubic: (t) => t * t * t,
    // decelerating to zero velocity
    easeOutCubic: (t) => --t * t * t + 1,
    // acceleration until halfway, then deceleration
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    // accelerating from zero velocity
    easeInQuart: (t) => t * t * t * t,
    // decelerating to zero velocity
    easeOutQuart: (t) => 1 - --t * t * t * t,
    // acceleration until halfway, then deceleration
    easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
    // accelerating from zero velocity
    easeInQuint: (t) => t * t * t * t * t,
    // decelerating to zero velocity
    easeOutQuint: (t) => 1 + --t * t * t * t * t,
    // acceleration until halfway, then deceleration
    easeInOutQuint: (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
};

const interp = (easing: EasingFunction) => (a: Position, b: Position, t: number) => {
    const _t = easing(t);
    return {
        x: b.x * _t + (1 - _t) * a.x,
        y: b.y * _t + (1 - _t) * a.y,
    };
};

function pos(x: number, y: number) {
    return {
        x: x,
        y: y,
    };
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

let img: PIXI.NineSlicePlane;
let distX = 20;
let distY = 0;

let ticker = PIXI.Ticker.shared;
// Set this to prevent starting this ticker when listeners are added.
// By default this is true only for the PIXI.Ticker.shared instance.
ticker.autoStart = false;
// FYI, call this to ensure the ticker is stopped. It should be stopped
// if you have not attempted to render anything yet.
ticker.stop();
// Call this when you are ready for a running shared ticker.

// You may use the shared ticker to render...
let renderer = PIXI.autoDetectRenderer();

document.body.appendChild(renderer.view);

function buildIndices(state: GameState) {
    let flat = state.flat();
    const byValue = (a: number, b: number) => b - a;
    flat.sort(byValue);
    console.log(flat);
    const indices = new Map(flat.map((n, i) => [n, i]));
    return function getIndex(n: number): number | undefined {
        return indices.get(n);
    };
}

function setup(nPalets: number) {
    let rectangles: GraphicsContainer = [];
    const bg = new PIXI.Sprite(background);
    bg.anchor.set(0.5);
    bg.scale.set(0.815);
    bg.x = 600;
    bg.y = 250;
    container.addChild(bg);
    let build: Palet[] = [];
    let getIndex: (n: number) => number | undefined;

    function init(initialState: GameState) {
        getIndex = buildIndices(initialState);
        build = place_palets(initialState);
        //img = rectangle(build[0]);
        //container.addChild(img);
        rectangles = build.map((palet, i) => {
            const forme = new GraphicPalet(palet, initialState[0][i]);
            const element = forme.graphics;
            container.addChild(element);
            return forme;
        });
    }

    function updateRect_init(rect: PIXI.NineSlicePlane, palet: Palet) {
        rect.tint = palet.color;
        rect.position.set(palet.position.x - palet.taille.width / 2, palet.position.y - palet.taille.height / 2);
        rect.width = palet.taille.width;
    }

    function animate(time: number) {
        for (let i = 0; i < rectangles.length; i++) {
            rectangles[i].animate();
        }

        requestAnimationFrame(animate);

        ticker.update(time);
        renderer.render(container);
    }

    function updateRect(rectangle: GraphicPalet, palet: Palet) {
        rectangle.set_pos(palet.position);
    }

    function sortRectangles(state: GameState) {
        let rect_sort: GraphicsContainer = [];

        for (let i = 0; i < state.length; i++) {
            for (let q = 0; q < state[i].length; q++) {
                for (let z = 0; z < rectangles.length; z++) {
                    if (state[i][q] === rectangles[z].id) {
                        rect_sort.push(rectangles[z]);
                    }
                }
            }
        }

        return rect_sort;
    }

    return function process(N: number, state: GameState, delta?: DeltaState) {
        if (N === 0) {
            init(state);
            let palets = place_palets(state);
        }
        if (N > 0) {
            let palets = place_palets(state);

            palets.map((palet) => {
                console.log(palet);
                updateRect(rectangles[getIndex(palet.num) as number], palet);
            });
        }
        animate(performance.now());
    };
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function test() {
    let actualState: GameState;
    let process = setup(sample.states[0].state[0].length);
    for (let i = 0; i < 8; i++) {
        //console.log(`etape ${i} ${JSON.stringify(sample.states[i].state)}`);
        actualState = sample.states[i].state as GameState;
        process(i, actualState);
        await delay(2500);
    }
}

test();

export { PIXI };

const sample = {
    medatata: {
        errors: [],
        won: true,
    },
    states: [
        {
            state: [[3, 2, 1], [], []], /// flat pour obtenir [3, 2, 1] => tri ascendant => créer new Map([10,0],[20,1],[30,2])
            delta: [], /// =>  tableau associatif (pour state = [10, 20, 30]) indices.get(30)
        },
        {
            state: [[3, 2], [], [1]],
            delta: [
                {
                    from: 0,
                    to: 2,
                },
            ],
        },
        {
            state: [[3], [2], [1]],
            delta: [
                {
                    from: 0,
                    to: 1,
                },
            ],
        },
        {
            state: [[3], [2, 1], []],
            delta: [
                {
                    from: 2,
                    to: 1,
                },
            ],
        },
        {
            state: [[], [2, 1], [3]],
            delta: [
                {
                    from: 0,
                    to: 2,
                },
            ],
        },
        {
            state: [[1], [2], [3]],
            delta: [
                {
                    from: 1,
                    to: 0,
                },
            ],
        },
        {
            state: [[1], [], [3, 2]],
            delta: [
                {
                    from: 1,
                    to: 2,
                },
            ],
        },
        {
            state: [[], [], [3, 2, 1]],
            delta: [
                {
                    from: 0,
                    to: 2,
                },
            ],
        },
    ],
};

export default sample;

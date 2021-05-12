const sample = {
    medatata: {
        errors: [],
        won: true,
    },
    states: [
        {
            state: [[3, 2, 1], [], []],
            delta: [],
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

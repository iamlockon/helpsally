const fs = require('fs');
const path = require('path');
const { Graph, Vertex, Edge, Dijkstra, BellmanFord, printPath } = require('./ShortestPath');

// Help Sally
const data = fs.readFileSync(path.join(__dirname, 'input.txt'), {encoding: 'utf-8'});
const delim = '-'.repeat(20) + '\n';
const problems = data.split(delim);

const maps = problems.map( scheme => scheme.trim().split('\n'));
const length = maps.length;
maps[length-1] = maps[length-1].slice(0,20);

const result = [];


// vertex will be wall, rink, or Dad.
function collectEdges(map) {
    const res = [];
    const crushIntoSth = (p, v) => {
        const np = {
            x: p.x + v[0],
            y: p.y + v[1]
        }
        if (np.x < 0 || np.x > 19 || np.y < 0 || np.y > 19) return true;
        return ['#'].includes(map[np.y][np.x]);
    };
    const pointToString = (x, y) => {
        return x + '-' + y;
    }
    // search for S
    const s = {x: null, y: null};
    let y = 0;
    let done = false;
    for (let line of map) {
        if (done) break;
        let x = 0;
        for (let c of line) {
            if (c === 'S') {
                s.x = x;
                s.y = y;
                done = true;
                break;
            }
            x++;
        }
        y++;
    }
    // BFS
    const queue = [];
    const visited = new Map(); // x-y as key
    const directions = {
        east: [+1, 0],
        west: [-1, 0],
        south: [0, +1],
        north: [0, -1]
    };
    queue.push(s);
    while (queue.length > 0) {
        const point = queue.shift();
        for (let key in directions) {
            if (!crushIntoSth(point, directions[key])) {
                const v = directions[key];
                const curr = Object.assign({}, point);
                let prev_x, prev_y;
                let steps = 0;
                while (!crushIntoSth(curr, v)) {
                    steps++;
                    prev_x = curr.x, prev_y = curr.y;
                    curr.x += v[0];
                    curr.y += v[1];
                }
                let np = pointToString(curr.x, curr.y);
                if (visited.get(np)) continue;
                visited.set(np, map[curr.y][curr.x]);
                if (visited.get(np) === 'D') np = 'D'
                const src = pointToString(point.x, point.y) === pointToString(s.x, s.y) ? 'S' : pointToString(point.x, point.y);
                if (np !== src) res.push(new Edge(src, np, steps));
                queue.push(curr);
            }
        }
    }
    return res;
}

/**
 * 
 * @param {Array[20]} map Array of strings of length 20
 */
function mapToGraph(map) {
    const graph = new Graph();
    const edges = collectEdges(map);
    for (let e of edges) {
        graph.insertEdge(e);
    }
    return graph;
}

const p = new Promise((resolve, reject)=> {
    return resolve(maps.forEach( map => {
        const graph = mapToGraph(map);
        const res = Dijkstra(graph, 'S');
        result.push(res);
    }))
})

p.then(() => {
    let i = 0;

    result.forEach(({d, pred}) => {
        console.log(`Map:${i}, Sally's Path : ${printPath(pred, 'D')}, distance : ${d.get('D')}`)
    })
}).catch(err => console.error(err))

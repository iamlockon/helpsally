/**
 * Resouces:
 * https://brilliant.org/wiki/dijkstras-short-path-finder/
 * https://brilliant.org/wiki/bellman-ford-algorithm/
 */
'use strict';
const assert = require('assert')

class MinHeap {
    constructor() {
        this.data = [];
    }
    push(element) {
        this.data.push(element);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        const minElement = this.data[0];
        const endElement = this.data[this.data.length-1];
        this.data.pop();
        if (this.data.length === 0) return minElement; 
        this.data[0] = endElement;
        this.sinkDown(0);
        return minElement;
    }
    update(name, newValue) {
        let idx = 0;
        for (let i of this.data) {
            if (i.name === name) {
                i.value = newValue;
                break;
            }
            idx++;
        }
        this.bubbleUp(idx);
        this.sinkDown(idx);
    }
    bubbleUp(idx) {
        const element = this.data[idx];
        while (idx > 0) {
            const parentIdx = Math.floor((idx+1) / 2) - 1;
            const parent = this.data[parentIdx];
            if (element.value >= parent.value) {
                break;
            }
            this.data[parentIdx] = element;
            this.data[idx] = parent;
            idx = parentIdx;
        }
    }
    sinkDown(idx) {
        const len = this.data.length;
        const element = this.data[idx];
        const elementValue = element.value;
        
        while (true) {
            const leftChildIdx = (idx + 1) * 2, rightChildIdx = leftChildIdx - 1;
            let swap = null;
            if (rightChildIdx < len) {
                const rightChild = this.data[rightChildIdx];
                if (rightChild.value < elementValue) swap = rightChildIdx;
            }
            if (leftChildIdx < len) {
                const leftChild = this.data[leftChildIdx];
                if (leftChild.value < elementValue) swap = leftChildIdx;
            }
            if (swap == null) break;

            this.data[idx] = this.data[swap];
            this.data[swap] = element;
            idx = swap;
        }
    }
    size() {
        return this.data.length;
    }

}

class Edge {
    constructor(src, dest, weight) {
        this.src = src;
        this.dest = dest;
        this.weight = weight;
    }
}

class Vertex {
    constructor(name) {
        this.name = name;
    }
}

class Graph {
    constructor(vert = 0) {
        this.vertices = vert; // number of vertex
        this.adjList = new Map(); // map vertex name to edge
    }
    insertEdge(edge) {
        if (!this.adjList.has(edge.src)) this.insertVert(new Vertex(edge.src))
        if (!this.adjList.has(edge.dest)) this.insertVert(new Vertex(edge.dest))
        this.adjList.get(edge.src).push(edge);
    }
    insertVert(vert) {
        this.vertices++;
        this.adjList.set(vert.name, []);
    }
}

let graph = new Graph();
graph.insertEdge(new Edge('S', 'A', 3))
graph.insertEdge(new Edge('S', 'C', 2))
graph.insertEdge(new Edge('S', 'F', 6))
graph.insertEdge(new Edge('C', 'A', 2))
graph.insertEdge(new Edge('A', 'B', 6))
graph.insertEdge(new Edge('A', 'D', 1))
graph.insertEdge(new Edge('C', 'D', 3))
graph.insertEdge(new Edge('B', 'E', 1))
graph.insertEdge(new Edge('D', 'E', 4))
graph.insertEdge(new Edge('F', 'E', 2))

assert(graph.vertices === 7, 'Graph vertices should be 10')
assert(graph.adjList.get('S').length === 3, 'S should have an outdegree of 3')

/**
 * @param {Map} pred
 */
function printPath(pred, dest) {
    let curr = pred.get(dest);
    let path = [dest];
    while (curr !== null) {
        path.unshift(curr);
        curr = pred.get(curr);
    }
    return path.join('=>');
}

/**
 * 
 * @param {Graph} graph - Graph object
 * @param {String} src - Source Vertex
 */
function BellmanFord(graph, src) {
    // initialize d, predecessor
    const d = new Map(), pred = new Map();
    for (let [k,v] of graph.adjList) {
        d.set(k, Infinity)
        pred.set(k, null);
    }
    d.set(src, 0);
    // repeat V-1 times
    for (let i = 0; i < graph.vertices - 1; i++) {
        // for each edge, try relaxation
        for (let [k, v] of graph.adjList) {
            for (let e of v) {
                if (d.get(e.dest) > d.get(e.src) + e.weight) {
                    d.set(e.dest, d.get(e.src) + e.weight);
                    pred.set(e.dest, e.src);
                }
            }
        }
    }
    // check negative weight cycles
    for (let [k, v] of graph.adjList) {
        for (let e of v) {
            if (d.get(e.dest) > d.get(e.src) + e.weight) return undefined;
        }
    }
    return {d, pred};
}

function Dijkstra(graph, src) {
    // Initialize: MinHeap to extract min value
    const queue = new MinHeap();
    const d = new Map(), pred = new Map();
    for (let [k, v] of graph.adjList) {
        d.set(k, Infinity);
        pred.set(k, null);

        const element = {
            name: k,
            value: Infinity
        }
        if (k === src) element.value = 0;
        queue.push(element);
    }
    d.set(src, 0);
    // Iterate until queue exhausts
    while (queue.size() !== 0) {
        const minElement = queue.pop();
        const outEdge = graph.adjList.get(minElement.name);
        for (let e of outEdge) {
            if (d.get(e.dest) > d.get(e.src) + e.weight) {
                d.set(e.dest, d.get(e.src) + e.weight);
                pred.set(e.dest, e.src);
                queue.update(e.dest, d.get(e.dest));
            }
        }
    }
    return {d, pred};
}

const res = BellmanFord(graph, 'S');
// const res2 = Dijkstra(graph, 'S');

console.log("Shortest path from S to E is ", printPath(res.pred, 'E'), ", distance: ", res.d.get('E'));
console.log("Shortest path from S to D is ", printPath(res.pred, 'D'), ", distance: ", res.d.get('D'));
console.log("Shortest path from S to B is ", printPath(res.pred, 'B'), ", distance: ", res.d.get('B'));
console.log("Shortest path from S to C is ", printPath(res.pred, 'C'), ", distance: ", res.d.get('C'));


module.exports = {
    Graph,
    Vertex,
    Edge,
    Dijkstra,
    BellmanFord,
    printPath
}
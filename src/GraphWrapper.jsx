import React, {useEffect, useRef} from "react";
import { SigmaContainer, useLoadGraph, useSigma } from "@react-sigma/core";
import Graph from "graphology";
import circularLayout from "graphology-layout/circular";
import random from 'graphology-layout/random';
import forceLayout from 'graphology-layout-force';
import axios from 'axios';

import { ControlsContainer, ZoomControl, SearchControl, FullScreenControl } from "@react-sigma/core";

const createMultiGraph = () => {
    const graph = new Graph({ multi: true });
    //in fact the multi graph does not work this way 
    // refer to https://sim51.github.io/react-sigma/docs/example/load-graph/ (search for multi)
  
    // Adding nodes
    for (let i = 0; i < 10; i++) {
      graph.addNode(`n${i}`, { label: `Node ${i}`, x: Math.random(), y: Math.random(), size: 10 });
      //graph.addNode('n5', { label: 'Nina Simone : 1933', size: 25, color: 'orange' });
    }
  
    // Adding multiple edges between the same nodes
    for (let i = 0; i < 20; i++) {
      const source = `n${Math.floor(Math.random() * 10)}`;
      const target = `n${Math.floor(Math.random() * 10)}`;
      graph.addEdgeWithKey(`e${i}-1`, source, target, { label: `Edge ${i}-1` });
    }
  
    return graph;
  };

const GraphComponent = () => {
    const sigma = useSigma();
    const containerRef = useRef(null);

    const loadGraph = useLoadGraph();

    useEffect(() => {

        // axios.get('/graph.json').then(response => {

        //     const graphData = response.data;

        //     if (!Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
        //     throw new Error('Invalid graph data format');
        //     }

        //     const graph = new Graph( {multi: true} );
            
        //     graphData.nodes.forEach((node, index) => {
        //     const key = node.key || `n${index}`;
        //     const x =  node.x !== undefined ? node.x : Math.random();
        //     const y = node.y !== undefined ? node.y : Math.random();
        //     graph.addNode(key, {...node, x, y, size:10});
        //     });

        //     // Ensure each edge has a unique key
        //     graphData.edges.forEach( (edge, index) => {
        //         const key = edge.key || `e${index}`;
        //         //graph.addEdgeWithKey(key, edge.source, edge.target, {...edge});
        //         graph.addEdge(edge.source, edge.target, {...edge});
        //     });
            
        //     console.log('Raw graph data:', graph);

        //     loadGraph(graph, true);
        // })
        // .catch(error => {
        //     console.error('Error fetching the graph data', error);
        // });

        axios.get('/proper-graph.json').then(response => {

            const graphData = response.data;

            if (!Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
            throw new Error('Invalid graph data format');
            }

            const graph = new Graph( {multi: true} );
            graph.import( {
                nodes: graphData.nodes,
                edges: graphData.edges,
            } ),
            
            console.log('Raw graph data:', graph.nodes);
            console.log('Raw graph data:', graph.edges);

            loadGraph(graph, true);
        })
        .catch(error => {
            console.error('Error fetching the graph data', error);
        });

    }, [loadGraph]);

    return null;
};

const GraphWrapper = () => (
    <SigmaContainer>
        <GraphComponent/>
        <ControlsContainer position={"bottom-right"}>
            <ZoomControl/>
            <FullScreenControl/>
        </ControlsContainer>
    </SigmaContainer>
);

export default GraphWrapper;
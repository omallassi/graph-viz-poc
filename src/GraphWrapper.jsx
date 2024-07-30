import React, {useEffect, useState, useRef} from "react";
import { SigmaContainer, useLoadGraph, useSigma } from "@react-sigma/core";
import Graph from "graphology";
import circularLayout from "graphology-layout/circular";
import random from 'graphology-layout/random';
import axios from 'axios';
import MultiDirectedGraph from "graphology";
import EdgeCurveProgram, { DEFAULT_EDGE_CURVATURE, indexParallelEdgesIndex } from "@sigma/edge-curve";

import { ControlsContainer, ZoomControl, SearchControl, FullScreenControl } from "@react-sigma/core";

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

const createMultiGraph = () => {
    //const graph = new Graph({ multi: true, indexParallelEdgesIndex: true});
    const graph = new Graph();
   
    //in fact the multi graph does not work this way 
    // refer to https://sim51.github.io/react-sigma/docs/example/load-graph/ (search for multi)
  
    // Adding nodes
    for (let i = 0; i < 100; i++) {
      graph.addNode(`n${i}`, { label: `Node ${i}`, 
        x: Math.random(), 
        y: Math.random(), 
        size: Math.floor(Math.random() * 15), 
        color: getRandomColor()  
    });
      //
      if (i> 2) {
        let source = `n${i}`;
        let target = `n${i-1}`;
        graph.addEdgeWithKey(`e${i}-1`, source, target, { label: `Edge ${i}-1`, size: Math.random() * 10 });
        
        target = `n${i-2}`;
        graph.addEdgeWithKey(`e${i}-2`, source, target, { label: `Edge ${i}-1`, size: Math.random() * 10 });
      }
    }
  
    // // Adding multiple edges between the same nodes
    // for (let i = 0; i < 20; i++) {
    //   const source = `n${Math.floor(Math.random() * 10)}`;
    //   const target = `n${Math.floor(Math.random() * 10)}`;
    //   graph.addEdgeWithKey(`e${i}-1`, source, target, { label: `Edge ${i}-1` });
    // }

    // indexParallelEdgesIndex(graph, { edgeIndexAttribute: 'parallelIndex', edgeMaxIndexAttribute: 'parallelMaxIndex' });

    // // // Adapt types and curvature of parallel edges for rendering:
    // graph.forEachEdge((edge, { parallelIndex, éparallelMaxIndex }) => {
    //     if (typeof parallelIndex === "number") {
    //       graph.mergeEdgeAttributes(edge, {
    //         type: "curved",
    //         curvature: DEFAULT_EDGE_CURVATURE + (3 * DEFAULT_EDGE_CURVATURE * parallelIndex) / (parallelMaxIndex || 1),
    //       });
    //     } else {
    //       graph.setEdgeAttribute(edge, "type", "straight");
    //     }
    //   });
  
    return graph;
};



const GraphComponent = () => {

    const loadGraph = useLoadGraph();

    //const [layout, setLayout] = useState(null);

    useEffect(() => {
        axios.get('/graph.json').then(response => {
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

        // const graph = createMultiGraph();
        // loadGraph(graph, true);

        // console.log(graph.order);
        // console.log(graph.size);

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
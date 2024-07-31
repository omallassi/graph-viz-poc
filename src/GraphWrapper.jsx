import React, {useEffect, useState, useRef, useMemo} from "react";
import { SigmaContainer, useLoadGraph, useSigma } from "@react-sigma/core";
import Graph from "graphology";
import circularLayout from "graphology-layout/circular";
import random from 'graphology-layout/random';
import { animateNodes } from "sigma/utils";
import { useLayoutNoverlap, useWorkerLayoutNoverlap } from "@react-sigma/layout-noverlap";
import { useLayoutCirclepack } from '@react-sigma/layout-circlepack'
import { useLayoutForce, useWorkerLayoutForce } from "@react-sigma/layout-force";
import axios from 'axios';
import MultiDirectedGraph from "graphology";
import EdgeCurveProgram, { DEFAULT_EDGE_CURVATURE, indexParallelEdgesIndex } from "@sigma/edge-curve";

import { ControlsContainer, ZoomControl, SearchControl, FullScreenControl } from "@react-sigma/core";

const GraphComponent = ( {layout} ) => {
    const sigma = useSigma();
    const loadGraph = useLoadGraph();
    const layoutNoverlap = useLayoutNoverlap();
    const layoutCirclepack = useLayoutCirclepack();
    const layoutForce = useLayoutForce({ maxIterations: 100 });

    const layouts = useMemo( () => {
        return {
            circlepack: {
                layout: layoutCirclepack
            },
            noverlaps: {
                layout: layoutNoverlap
            }, 
            force: {
                layout: layoutForce
            }
        }
    }, []);


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

    useEffect(() => {
      const { positions } = layouts[layout].layout;
      animateNodes(sigma.getGraph(), positions(), { duration: 1000 });
    }, [layouts, layout, sigma]);

    return null;
};

const GraphWrapper = () => {
    const [layout, setLayout] = useState("circlepack");

    return (
        <SigmaContainer>
                <div>
                    <button onClick={ () => setLayout("circlepack") } >circlepack</button>
                    <button onClick={ () => setLayout("noverlaps") } >noverlaps</button>
                    <button onClick={ () => setLayout("force") } >force</button>
                </div>
                <GraphComponent layout={layout}/>
                <ControlsContainer position={"bottom-right"}>
                    <ZoomControl/>
                    <FullScreenControl/>
                </ControlsContainer>
        </SigmaContainer>
    );
};

export default GraphWrapper;
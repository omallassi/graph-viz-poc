import React, {useEffect, useState, useRef, useMemo} from "react";
import { SigmaContainer, useLoadGraph, useRegisterEvents, useSigma, useSetSettings} from "@react-sigma/core";
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

const sigmaSettings = { allowInvalidContainer: true };

const GraphComponent = ( {layout, cipher_query, onNodeClick} ) => {
    const sigma = useSigma();
    const loadGraph = useLoadGraph();
    const layoutNoverlap = useLayoutNoverlap();
    const layoutCirclepack = useLayoutCirclepack();
    const layoutForce = useLayoutForce({ maxIterations: 100 });
    const setSettings = useSetSettings();

    const [hoveredNode, setHoveredNode] = useState(null);

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

    const registerEvents = useRegisterEvents();


    useEffect(() => {
        axios.get('/' + cipher_query + '.json').then(response => {
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

    useEffect(() => {
      const { positions } = layouts[layout].layout;
      animateNodes(sigma.getGraph(), positions(), { duration: 1000 });
    }, [layouts, layout, sigma]);

    useEffect(() => {
        registerEvents({
            clickNode: (event) => {
                // console.warn("clickNode", event.event);
                // console.warn("clickNode", event.node);
                if (sigma.getGraph().hasNode(event.node)) {
                    console.info( "here are the selected node " + JSON.stringify( sigma.getGraph().getNodeAttributes(event.node) ));
                    onNodeClick(event.node, event.event.x, event.event.y, sigma.getGraph().getNodeAttributes(event.node));
                  } else {
                    console.warn("no node found");
                  }
                
            },
            // click: (event) => {
            //     console.warn("click", event.x, event.y);
            //     onNodeClick(event.x, event.y);
            // },
            enterNode: (event) => setHoveredNode(event.node),
            leaveNode: (event) => setHoveredNode(null),
        });
    }, [registerEvents]);

    useEffect(() => {
        setSettings({
            nodeReducer: (node, data) => {
                const graph = sigma.getGraph();
                const newData = { ...data, highlighted: data.highlighted || false };
        
                if (hoveredNode) {
                  if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
                    newData.highlighted = true;
                  } else {
                    newData.color = "#E2E2E2";
                    newData.highlighted = false;
                  }
                }
                return newData;
              },
              edgeReducer: (edge, data) => {
                const graph = sigma.getGraph();
                const newData = { ...data, hidden: false };
        
                if (hoveredNode && !graph.extremities(edge).includes(hoveredNode)) {
                  newData.hidden = true;
                }
                return newData;
              },
        });
    }, [hoveredNode, setSettings, sigma]);

    return null;
};

const GraphWrapper = () => {
    const [layout, setLayout] = useState("circlepack");
    const [selectedNode, setSelectedNode] = useState(null);

    const containerRef = useRef(null);

    const onNodeClick = (node_id, x, y, attributes) => {
        console.info("selected node - " + node_id + " - " + x + " - " + y);
        setSelectedNode({
            id: node_id,
            x: x,
            y: y, 
            attributes: attributes,
        });
    }

    return (
        <div ref={containerRef}>
            <div>
                {selectedNode && (
                    <div>
                        Selected node : id [{selectedNode.id}], x [{selectedNode.x}], y [{selectedNode.y}], [{JSON.stringify(selectedNode.attributes)}]
                    </div>
                )}
                <div>
                    <button onClick={ () => setLayout("circlepack") } >circlepack</button>
                    <button onClick={ () => setLayout("noverlaps") } >noverlaps</button>
                    <button onClick={ () => setLayout("force") } >force</button>
                </div>
                        
                <SigmaContainer settings={sigmaSettings}>
                        <GraphComponent layout={layout} cipher_query='graph-30' onNodeClick={onNodeClick}/>
                        <ControlsContainer position={"top-right"}>
                            <ZoomControl/>
                            <FullScreenControl/>
                        </ControlsContainer>
                </SigmaContainer>
            </div>
            <SigmaContainer settings={sigmaSettings}>
                    <GraphComponent layout={layout} cipher_query='graph-35' onNodeClick={onNodeClick}/>
                    <ControlsContainer position={"top-right"}>
                        <ZoomControl/>
                        <FullScreenControl/>
                    </ControlsContainer>
                    <div>
                        <button onClick={ () => setLayout("circlepack") } >circlepack</button>
                        <button onClick={ () => setLayout("noverlaps") } >noverlaps</button>
                        <button onClick={ () => setLayout("force") } >force</button>
                    </div>
            </SigmaContainer>
        </div>
        
    );
};

export default GraphWrapper;
const overview = (() => {
    const connectionLineWidth = 3;

const updateOverview =  (data, graphoption) => {
	const areas = getSceneData(data);
    const links = createLinks(data);
	updateAreas(areas, links, graphoption);
};

const updateColors = (data) => {
    const links = createLinks(data);
    const svg = window.globalBucket.mainSVGG;
    const currentScene = window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex];
    const visitedNodes = breadthFirstSearch(currentScene.location, links);

    svg.selectAll('.areaData').selectAll('rect').attr('fill', (d) => colormapping(d, visitedNodes));
}

const breadthFirstSearch = (startLocation, links) => {
    let queue = [startLocation];
    let nextLevel = [];
    const visitedNodes = [];
    let levelNodes = 0;

    while(queue.length > 0 || nextLevel.length > 0) {
        if (queue.length === 0) {
            queue = nextLevel;
            nextLevel = [];
            levelNodes++;
        }
        const currentNode = queue.pop();
        visitedNodes.push({location: currentNode, level: levelNodes});

        links.forEach((x) => {
            if (x.source === currentNode && !visitedNodes.find((q) => x.target === q.location) && !nextLevel.find((q) => x.target === q))
            {
                nextLevel.push(x.target);
            }
            else if (x.target === currentNode && !visitedNodes.find((q) => x.source === q.location) && !nextLevel.find((q) => x.source === q)) {
                nextLevel.push(x.source);
            }
        });
    }
    return visitedNodes;
}

const getCenter = ()    => {
    const width = parseInt(window.globalBucket.mainSVG.style("width").replace("px", ""));
    const height = parseInt(window.globalBucket.mainSVG.style("height").replace("px", ""));
    return {x: width/2, y: height/4};
    };
const updateAreas= (areaData, links, graphoption) => {
    let center = getCenter();

    const svg = window.globalBucket.mainSVGG;

	let areaDataList = Object.keys(areaData).map(location =>
		areaData[location]);

	areaDataList.sort((a,b) => a.firstAppearance - b.firstAppearance);


    svg.selectAll('.areaData')
        .remove();

    svg.selectAll('.areaLine')
        .remove();

    svg.selectAll('marker').remove();

	const areas = svg.selectAll('.areaData')
		.data(areaDataList, (d) => d);

    svg.append("defs").selectAll("marker")
        .data(["arrowpoint"])
        .enter().append("marker")
        .attr("id", function(d) { return d; })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    const linkElements = svg.selectAll('.areaLine')
        .data(links)
        .enter().append('path')
        .classed('areaLine', true)
        .attr('stroke-width', 1)
        .attr('z-index', 0)
        .attr('stroke', 'grey')
        .attr("marker-end", function(d) { return "url(#" + "arrowpoint" + ")"; });

    const highlightLines = (areaName) => {
        svg.selectAll('.areaLine')
            .attr('stroke-width', (d) => {return d.source === areaName || d.target === areaName ? connectionLineWidth : 1})
            .attr('stroke', (d) => {return d.source === areaName || d.target === areaName ? 'black' : 'lightgrey'})
    };

    const dissapearLines = (areaName) => {
        svg.selectAll('.areaLine')
            .attr('stroke-width', (d) => {return d.source === areaName || d.target === areaName ? connectionLineWidth : 0})
    };
    const turnLinesBack = () => svg.selectAll('.areaLine').attr('stroke-width', 1).attr('stroke', 'grey');

    const areaContainer = areas.enter().append('g')
    	.classed('areaData', true)
        .attr('transform', (node,i) => "translate( " +[100 * i, 100 * i].join(',') + ")")
        .on("mouseover", d => highlightLines(d.location))
        .on("mouseout", turnLinesBack);

	const drawnAreas = areaContainer.append('rect')
		.attr('width', 100)
		.attr('height', 100)
		// .attr('fill', (d) => colormapping(d))
        .attr('stroke', 'black')
		.attr('stroke-width', 2)
		.attr('rx', '20')
        .attr('ry', '20')
        .attr('z-index', 1);

    const areaText = areaContainer.append('text')
        .classed('areaText', true)
        .text(node => node.location)
        .attr('font-size', 14)
        .attr('x', 0)
        .attr('y', 120);

    const dragDrop = d3.drag()
        .on('start', node => {
            node.fx = node.x;
            node.fy = node.y;
        })
        .on('drag', node => {
            simulation.alphaTarget(0.7).restart();
            node.fx = d3.event.x;
            node.fy = d3.event.y;
        })
        .on('end', node => {
            if (!d3.event.active) {
                simulation.alphaTarget(0)
            }
            node.fx = null;
            node.fy = null;
        });

	areaContainer.call(dragDrop);

	drawnAreas
        .append('title').text((d) => {return d.location; });

    graphoption = graphoption ? graphoption : 'Centered';
    const simulation =changeForceGraph(graphoption);
    overview.simulation = simulation;

    simulation.force('link', d3.forceLink()
        .id(link => link.id)
        .strength(link => link.strength));

	let nodeAreaConnector = {};
    areaDataList.forEach((area,i) => nodeAreaConnector[area.location] =  areaContainer.nodes()[i]);

    const linksWithNodes = links.filter(link => link.source === link.target).map(link => { return {source: nodeAreaConnector[link.source],
		target: nodeAreaConnector[link.target], strength: link.strength}});

    simulation.force('link').links(linksWithNodes);
    simulation.nodes(areaDataList).on('tick', () => {
        areaContainer
            .attr('transform', node => "translate( " +[node.x, node.y].join(',') + ")")
        	.attr('vx', node => node.x)
        	.attr('vy', node => node.y);
        linkElements
			// TODO hardcoded center of rectangle here for testing
            .attr("d", (link) => {
                const x1 = parseFloat(nodeAreaConnector[link.source].getAttribute('vx')) + 50;
                const y1 = parseFloat(nodeAreaConnector[link.source].getAttribute('vy')) + 50;
                const x2 = parseFloat(nodeAreaConnector[link.target].getAttribute('vx')) + 50;
                const y2 = parseFloat(nodeAreaConnector[link.target].getAttribute('vy')) + 50;

                const circle1 = pointOnCircle(x2, y2, x1, y1, 50);
                const circle2 = pointOnCircle(x1, y1,x2, y2, 50);

                const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                if(d > 0) {
                    return "M" + [circle1.x, circle1.y + "A" + d, d + " 0 0,1 " + circle2.x, circle2.y].join(', ');
                } else {
                    return "M" + [x1, y1 + "A" + d, d + " 0 0,1 " + x1, y2].join(', ');
                }

            });
    // characters.updateClusters();
    });

    simulation.restart();
};

const colormapping = (d, visitedNodes) => {
    // const currentScene = window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex];
    const nodeLevel = visitedNodes.find((node) => d.location === node.location).level;
    if (nodeLevel > 7) {
        return utils.areaColor[0];
    }
    return utils.areaColor[utils.areaColor.length - nodeLevel - 1];
}

const pointOnCircle = (cx, cy, px, py, radius) => {
    const vx = px- cx;
    const vy = py - cy;
    const distance = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
    return {x: cx + vx / distance * radius, y: cy + vy / distance * radius};
};

const zooming = (zoomFactor) => {
    if(zoomFactor < 0.5) {
        window.globalBucket.mainSVG.selectAll('.areaText').attr('opacity', 0);
    } else {
        window.globalBucket.mainSVG.selectAll('.areaText').attr('opacity', 1);
    }

    window.globalBucket.mainSVG.selectAll('.areaText')
        .attr('font-size', 14 * (1/zoomFactor))
        .attr('y', 110 + 10 * (1/zoomFactor));
    };

const forceFalloff = (amount) => Math.pow(amount, 0.8);

const changeForceGraph = (key) => {
    updateColors(window.globalBucket.data);
    if(key in forceGraphRepresentations){
        return forceGraphRepresentations[key]();
    }
};

const forceCenter = () => {
    const center = getCenter();
    const strength = -100;
    const forceperScene = 100;
    return d3.forceSimulation().force('charge', d3.forceManyBody().strength(strength)) //.strength(-40))
        .force('center', d3.forceCenter(center.x, center.y))
        .force("collide",d3.forceCollide( function(d){return forceFalloff(d.scenes.length) * forceperScene }).iterations(16) )
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0));
};

const forceChronoCluster = () => {
    const center = getCenter();
    let counter = 0;
    const strength = -100;
    const forceperScene = 100;
    const xIncrease = 1000;
    return d3.forceSimulation().force('charge', d3.forceManyBody().strength(strength)) //.strength(-40))
        .force('center', d3.forceCenter(center.x, center.y))
        .force("collide",d3.forceCollide( function(d){return forceFalloff(d.scenes.length) * forceperScene }).iterations(16) )
        .force("y", d3.forceY(d => d.scenes.length > 2 ? -1000: 0))
        .force("x", d3.forceX((d,i) => {
            if (d.scenes.length > 2) {
                const oldcounter = counter;
                counter ++;
                return oldcounter * xIncrease;
            } else {
                return counter* xIncrease + i * 10;
            }
        }));
};

    const forceGraphRepresentations = {
        "Centered": forceCenter,
        "Chronologically clustered": forceChronoCluster
    };

    const changeSimulationCenter= () => {
        const width = parseInt(window.globalBucket.mainSVG.style("width").replace("px", ""));
        const height = parseInt(window.globalBucket.mainSVG.style("height").replace("px", ""));
        let center = {x: width/2, y: height/4};
        overview.simulation.force("center")
            .x(center.x)
            .y(center.y);
    };

const createLinks=  (data) => {
	return data.scenes.reduce((links, curr, i) => {
		if(i < data.scenes.length - 1){
			return [...links, {target: data.scenes[i].location, source: data.scenes[i+1].location, strength: 1}]
		} else {
			return links;
		}
	}, []);
};

const getSceneData= (data) => {
	let areas = {};
	data.scenes.forEach((currentScene, i) => {
		// if it already exists in the areas object than at the scene to that area, otherwise add the area to the areas object
        if(areas[currentScene.location]) {
            areas[currentScene.location].scenes.push(currentScene);
            // TODO duration should be a better metric than incremental
            areas[currentScene.location].duration += currentScene.endTime - currentScene.startTime;
        } else {
            areas[currentScene.location] =
				{scenes: [currentScene],
					duration: currentScene.endTime - currentScene.startTime,
					location: currentScene.location,
					firstAppearance: i,
					id: currentScene.location}
        }
	});
	return areas;
};

return {updateOverview, updateAreas, updateColors, changeSimulationCenter, zooming, forceGraphRepresentations, changeForceGraph};
})();

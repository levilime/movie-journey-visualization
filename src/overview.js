const overview = (() => {
    const connectionLineWidth = 3;

const updateOverview =  (data) => {
	const areas = getSceneData(data);
    const links = createLinks(data);
	updateAreas(areas, links);
};


const updateAreas= (areaData, links) => {
    const width = parseInt(window.globalBucket.mainSVG.style("width").replace("px", ""));
    const height = parseInt(window.globalBucket.mainSVG.style("height").replace("px", ""));
    let center = {x: width/2, y: height/4};

    const svg = window.globalBucket.mainSVGG;

	let areaDataList = Object.keys(areaData).map(location =>
		areaData[location]);

	areaDataList.sort((a,b) => a.firstAppearance - b.firstAppearance);

	const areas = svg.selectAll('.areaData')
		.data(areaDataList, (d) => d);

    const linkElements = svg.selectAll('.areaLine')
        .data(links)
        .enter().append('line')
        .classed('areaLine', true)
        .attr('stroke-width', 1)
        .attr('z-index', 0)
        .attr('stroke', 'grey');

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
		.attr('fill', () => utils.randomColor())
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

	// const totalScenes = data.scenes.length;
	const strength = -100;
	const forceperScene = 100;


    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(strength)) //.strength(-40))
        .force('center', d3.forceCenter(center.x, center.y))
    	.force("collide",d3.forceCollide( function(d){return forceFalloff(d.scenes.length) * forceperScene }).iterations(16) )
        .force("y", d3.forceY(0))
        .force("x", d3.forceX((d,i) => Math.floor(i/10) * 1000));

    overview.simulation = simulation;

    simulation.force('link', d3.forceLink()
        .id(link => link.id)
        .strength(link => link.strength));

	let nodeAreaConnector = {};
    areaDataList.forEach((area,i) => nodeAreaConnector[area.location] =  areaContainer.nodes()[i]);

    const linksWithNodes = links.map(link => { return {source: nodeAreaConnector[link.source],
		target: nodeAreaConnector[link.target], strength: link.strength}});

    simulation.force('link').links(linksWithNodes);
    simulation.nodes(areaDataList).on('tick', () => {
        areaContainer
            .attr('transform', node => "translate( " +[node.x, node.y].join(',') + ")")
        	.attr('vx', node => node.x)
        	.attr('vy', node => node.y);
        linkElements
			// TODO hardcoded center of rectangle here for testing
            .attr('x1', link => parseFloat(nodeAreaConnector[link.source].getAttribute('vx')) + 50)
            .attr('y1', link => parseFloat(nodeAreaConnector[link.source].getAttribute('vy')) + 50)
            .attr('x2', link => parseFloat(nodeAreaConnector[link.target].getAttribute('vx')) + 50)
            .attr('y2', link => parseFloat(nodeAreaConnector[link.target].getAttribute('vy')) + 50);
    });

    simulation.restart();
};

const zooming = (zoomFactor) => {
    window.globalBucket.mainSVG.selectAll('.areaText')
        .attr('font-size', 14 * (1/zoomFactor))
    };

const forceFalloff = (amount) => Math.pow(amount, 0.8);

const changeSimulationCenter= () => {
    const width = parseInt(window.globalBucket.mainSVG.style("width").replace("px", ""));
    const height = parseInt(window.globalBucket.mainSVG.style("height").replace("px", ""));
    let center = {x: width/2, y: height/4};
    console.log(center);
    overview.simulation.force("center")
        .x(center.x)
        .y(center.y);

    overview.simulation.restart();
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
            areas[currentScene.location].duration += 1;
        } else {
            areas[currentScene.location] =
				{scenes: [currentScene],
					duration: 1,
					location: currentScene.location,
					firstAppearance: i,
					id: currentScene.location}
        }
	});
	return areas;
};

return {updateOverview, updateAreas, changeSimulationCenter, zooming};
})();

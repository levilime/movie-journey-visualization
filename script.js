const mainContainer = "container";

const width = 200, height = 200;
const center = {x: 200, y: 200};
const data =  {
 	"scenes": [{
 			"id": "0",
 			"name": "The beginning ...",
 			"location": "Levi's home",
 			"characters": ["Levi"],
 			"script": [{
 				"character": "Levi",
 				"dialog": "I'm running 30mn late !"
 			}],
 			"rawscript": "---url---"
 		},
 		{
 			"id": "1",
 			"name": "First meeting",
 			"location": "DW Building",
 			"characters": ["Levi", "Haoming", "Valentin"],
 			"script": [{
 					"character": "Haoming",
 					"dialog": "I'll cluster this pdf, you guys can think about the vizualisation"
 				},
 				{
 					"character": "Levi",
 					"dialog": "Fine, Valentin take this pen"
 				},
 				{
 					"character": "Valentin",
 					"dialog": "Thanks, I think we can start like this"
 				},
 				{
 					"character": "Levi",
 					"dialog": "And we could also do like this"
 				},
 				{
 					"character": "Valentin",
 					"dialog": "Yes, I'll also write a json file so we can start"
 				}
 			],
 			"rawscript": "---url---"
 		},
        {
            "id": "2",
            "name": "Second meeting",
            "location": "DW2 Building",
            "characters": ["Levi", "Haoming", "Valentin"],
            "script": [{
                "character": "Haoming",
                "dialog": "I'll cluster this pdf, you guys can think about the vizualisation"
            },
                {
                    "character": "Levi",
                    "dialog": "Fine, Valentin take this pen"
                },
                {
                    "character": "Valentin",
                    "dialog": "Thanks, I think we can start like this"
                },
                {
                    "character": "Levi",
                    "dialog": "And we could also do like this"
                },
                {
                    "character": "Valentin",
                    "dialog": "Yes, I'll also write a json file so we can start"
                }
            ],
            "rawscript": "---url---"
        }
 	]
 };

let svg;
let context;

window.onload = () => {init();};

const init = () => {
	svg = d3.select('#' + mainContainer)
		  .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
        }))
		.append('g');
		  // .attr('width', width)
		  // .attr('height', height);

	overview();
};

/* code for the overview page
*/
const overview = () => {
	const areas = getSceneData(data);
    const links = createLinks();
	updateAreas(areas, links);

};

const updateAreas = (areaData, links) => {
	let areaDataList = Object.keys(areaData).map(location =>
		areaData[location]);

    console.log(links);
	console.log(areaDataList);

	// TODO just for testing, this currently uses the rainbowmap
	const randomColor = () => {
		const randomNumber = () => Math.floor(Math.random() * 255);
		return "rgb(" + [randomNumber(), randomNumber(), randomNumber()].join(',') + ")";
	};

	areaDataList.sort((a,b) => a.firstAppearance - b.firstAppearance);

	const areas = svg.selectAll('.areaData')
		.data(areaDataList, (d) => d);

    const linkElements = svg.selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', 5)
        .attr('z-index', 0)
        .attr('stroke', 'black');

    const areaContainer = areas.enter().append('g')
    	.classed('areaData', true);

	const drawnAreas = areaContainer.append('rect')
		.attr('width', 100)
		.attr('height', 100)
		.attr('fill', () => randomColor())
		.attr('stroke', 'black')
		.attr('stroke-width', 2)
		.attr('rx', '20')
        .attr('ry', '20')
        .attr('z-index', 1);

    areaContainer.append('text')
        .text(node => node.location)
        .attr('font-size', 14)
        .attr('x', 0)
        .attr('y', 120);

    const dragDrop = d3.drag()
        .on('start', node => {
            node.fx = node.x
            node.fy = node.y
        })
        .on('drag', node => {
            simulation.alphaTarget(0.7).restart()
            node.fx = d3.event.x
            node.fy = d3.event.y
        })
        .on('end', node => {
            if (!d3.event.active) {
                simulation.alphaTarget(0)
            }
            node.fx = null
            node.fy = null
        });

	areaContainer.call(dragDrop);

	drawnAreas
        .append('title').text((d) => {return d.location; });

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-40))
        .force('center', d3.forceCenter(center.x, center.y));

    simulation.force('link', d3.forceLink()
        .id(link => link.id)
        .strength(link => link.strength));

	let nodeAreaConnector = {};
    areaDataList.forEach((area,i) => nodeAreaConnector[area.location] =  areaContainer.nodes()[i]);

    const linksWithNodes = links.map(link => { return {source: nodeAreaConnector[link.source],
		target: nodeAreaConnector[link.target], strength: link.strength}});
    console.log(areaContainer);
    console.log(areaContainer.nodes());
//  transform="translate(20,2.5)
    simulation.nodes(areaDataList).on('tick', () => {
        areaContainer
            .attr('transform', node => { console.log(node); return "translate( " +[node.x, node.y].join(',') + ")"})
        	.attr('vx', node => node.x)
        	.attr('vy', node => node.y);
        linkElements
			// TODO hardcoded center of rectangle here for testing
            .attr('x1', link => {console.log(nodeAreaConnector[link.source]) ;return parseFloat(nodeAreaConnector[link.source].getAttribute('vx')) + 50;})
            .attr('y1', link => parseFloat(nodeAreaConnector[link.source].getAttribute('vy')) + 50)
            .attr('x2', link => parseFloat(nodeAreaConnector[link.target].getAttribute('vx')) + 50)
            .attr('y2', link => parseFloat(nodeAreaConnector[link.target].getAttribute('vy')) + 50);
    });
    console.log(drawnAreas);

    simulation
        .force("link", d3.forceLink(linksWithNodes));


};

const createLinks = () => {
	// const links = [];
	// if (!data.length) {return []}
	return data.scenes.reduce((links, curr, i) => {
		if(i < data.scenes.length - 1){
			return [...links, {target: data.scenes[i].location, source: data.scenes[i+1].location, strength: 0.7}]
		} else {
			return links;
		}
	}, []);
};

const getSceneData = (data) => {
	let areas = {};
	data.scenes.forEach((currentScene, i) => {
		// if it already exists in the areas object than at the scene to that area, otherwise add the area to the areas object
        if(areas[currentScene.location]) {
            areas[currentScene.location].scenes.push(currentScene);
            // TODO duration should be a better metric than incremental
            areas[currentScene.duration] += 1;
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




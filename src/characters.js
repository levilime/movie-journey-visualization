const characters = (() => {

    const updateCharacters = (data) => {
        initClusters();
        updateChars(data);
    };

    const updateChars = (data) => {
        const time = window.globalBucket.time;
        const svg = window.globalBucket.mainSVGG;
        //Current time of the visualization
        const pastScenes = data.scenes.filter((x) => {
            return x.endTime < time || x.startTime < time;
        });

        const charsInView = [];
        pastScenes.forEach((scene) => {
            scene.characters.forEach((char) => {
            let currentChar = charsInView.filter((seenChar) => { return seenChar.name === char; });
            const location = svg.selectAll('.areaData').filter((d) => {return d.location === scene.location; });
            if (currentChar.length > 0) {
                currentChar[0].location = scene.location;
                currentChar[0].x = parseFloat(location.attr('vx'));
                currentChar[0].y = parseFloat(location.attr('vy'));
            } else {
                charsInView.push({name: char, location: scene.location, x: parseFloat(location.attr('vx')),
                    y: parseFloat(location.attr('vy')), radius: 20, inTransition: false});
            }
            });
        });

        const charData = svg.selectAll('.charData').data(charsInView, (d) => d.name);
        charData.exit().remove();

        const charGroups = charData.enter().append('g').classed('charData', true)
                .attr('transform', (char) => {
                    const location = svg.selectAll('.areaData').filter((d) => {return d.location === char.location; });
                    return location.attr('transform');
                });

        charGroups.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 20)
            .attr('fill', () => utils.randomColor())
            .attr('z-index', 2);

        charGroups.append('text')
            .text((d) => d.name)
            .attr('font-size', 14)
            .attr('x', 0)
            .attr('y', 10);


        // if (!charData.empty())
        //     play.playStatus = false;
        charData.transition().attr('transform', (char) => {
            const location = svg.selectAll('.areaData').filter((d) => {return d.location === char.location; });
            return location.attr('transform');
        }).each((d) => d.inTransition = true)
        .on('end', () => {
            // window.globalBucket.main.recursivePlay();
            charData.each((d) => d.inTransition = false);
            updateClusters();
            // play.playStatus = true;
            // window.globalBucket.main.recursivePlay();
        });
    };

    const clusters = [];
    const getClusterCenters = () => {
        window.globalBucket.mainSVGG.selectAll('.areaData').each((d, i, nodes) => {
            const currentNode = d3.select(nodes[i]);
            const area = currentNode.select('rect');
            const halfwidth = parseFloat(area.attr('width')) / 2;
            const halfheight = parseFloat(area.attr('height')) / 2;
            const xPos = parseFloat(currentNode.attr('vx')) + halfwidth;
            const yPos = parseFloat(currentNode.attr('vy')) + halfheight;
            clusters[i] = {cluster: i, name: d.location, x: xPos, y: yPos, width: halfwidth, height: halfheight};
        });
    };

    const updateClusters = () => {
        if (!characters.simulation) {
            return;
        }
        const svg = window.globalBucket.mainSVGG;
        //clusters
        getClusterCenters();
        characters.simulation.force('cluster', d3.forceCluster().centers((item) => {
                return clusters.find((cluster) => cluster.name === item.location);}).strength(1.0))
            .nodes(svg.selectAll('.charData').data()).alpha(0.5)
            .on('tick', tickClusters).restart();
    };

    const initClusters = () => {
        getClusterCenters();
        //nodes
        const svg = window.globalBucket.mainSVGG;
        const simulation = d3.forceSimulation()
            .force('cluster', d3.forceCluster().centers((item) => {
                    return clusters.find((cluster) => cluster.name === item.location);}).strength(1.0))
            .force('collide', d3.forceCollide((d) => { return 20; }))
            .on('tick', tickClusters).nodes(svg.selectAll('.charData').data());
        characters.simulation = simulation;
    };

    const tickClusters = () => {
        const svg = window.globalBucket.mainSVGG;
        const charData = svg.selectAll('.charData').filter((x) => !x.inTransition);
        charData.attr('transform', (d) => {
            const currentCluster = clusters.find((cluster) => cluster.name === d.location);
            d.x = Math.max(currentCluster.x - currentCluster.width, Math.min(currentCluster.x + currentCluster.width, d.x));
            d.y = Math.max(currentCluster.y - currentCluster.height, Math.min(currentCluster.y + currentCluster.height, d.y));
            return "translate( " +[d.x, d.y].join(',') + ")"
        }).attr('vx', (d) => d.x)
        .attr('vy', (d) => d.y);
    };

return { updateCharacters, initClusters, updateClusters};
})();


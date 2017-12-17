const characters = (() => {

    const updateCharacters = (data) => {
        updateChars(data);
        updateClusters();
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
                    y: parseFloat(location.attr('vy')), radius: 0});
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
    };

    const clusters = [];

    const getUpdatedClusterCenters = () => {
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

    const updateClusterCenters = () => {
        if (!characters.simulation) {
            return;
        }
        //clusters
        getUpdatedClusterCenters();
        characters.simulation.force('cluster', d3.forceCluster().centers((item) => {
                return clusters.find((cluster) => cluster.name === item.location);}).strength(0.5)).alpha(1.0);
    };

    const updateClusters = () => {
        getUpdatedClusterCenters();
        //nodes
        const svg = window.globalBucket.mainSVGG;
        const charData = svg.selectAll('.charData');
        var simulation = d3.forceSimulation()
            .force('cluster', d3.forceCluster().centers((item) => {
                    return clusters.find((cluster) => cluster.name === item.location);}).strength(0.5))
            .force('collide', d3.forceCollide((d) => { return 10; }))
            .on('tick', () => {
                charData.attr('transform', (d) => {
                    const currentCluster = clusters.find((cluster) => cluster.name === d.location);
                    d.x = Math.max(currentCluster.x - currentCluster.width, Math.min(currentCluster.x + currentCluster.width, d.x));
                    d.y = Math.max(currentCluster.y - currentCluster.height, Math.min(currentCluster.y + currentCluster.height, d.y));
                    return "translate( " +[d.x, d.y].join(',') + ")"}).attr('vx', (d) => d.x).attr('vy', (d) => d.y);
            }).nodes(charData.data());
        characters.simulation = simulation;
    };

return { updateCharacters, updateChars, updateClusterCenters, updateClusters};
})();


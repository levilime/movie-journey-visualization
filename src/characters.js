const characters = (() => {

    const initCharacters = (data) => {
        // redraw the character g bucket to make it look on top
        window.globalBucket.mainSVGG.selectAll('.charData').remove();
        initClusters();
        updateChars(data);
        stopFollowingChar();
    };

    const updateCharacters = (data) => {
        updateChars(data);
    };

    let followingCharInterval = null;

    // Update the character groups according to the data
    const updateChars = (data) => {
        const time = window.globalBucket.time;
        const svg = window.globalBucket.mainSVGG;
        //The scenes that have been passed and the current scene
        const pastScenes = data.scenes.filter((x) => {
            return x.endTime < time || x.startTime <= time;
        });

        // Get the latest position of the seen characters
        const charsInView = [];
        pastScenes.forEach((scene) => {
            scene.characters.forEach((char) => {
            let currentChar = charsInView.filter((seenChar) => { return seenChar.name === char; });
            const location = svg.selectAll('.areaData').filter((d) => {return d.location === scene.location; });
            const transform = location.attr('transform').replace('translate(', '').replace(')', '').split(',');
            if (currentChar.length > 0) {
                currentChar[0].location = scene.location;
                currentChar[0].x = parseFloat(transform[0]);
                currentChar[0].y = parseFloat(transform[1]);
            } else {
                charsInView.push({name: char, location: scene.location, x: parseFloat(transform[0]),
                    y: parseFloat(transform[1]), radius: 20, inTransition: false});
            }
            });
        });

        // Update, enter and exit the character groups based on the collected data
        const charData = svg.selectAll('.charData').data(charsInView, (d) => d.name);
        charData.exit().remove();

        const charGroups = charData.enter().append('g').classed('charData', true)
                .on('click', (d, i, nodes) => {
                    const followInterval = 25;
                    const selectedNode = d3.select(nodes[i]);
                    if (followingCharInterval) {
                        clearInterval(followingCharInterval);
                    }
                    followingCharInterval = setInterval(() => {
                        const parent = svg.node().parentElement;
                        const scale = 1.0;
                        const translate = [parent.clientWidth / 2 - scale * parseFloat(selectedNode.attr('vx')), parent.clientHeight / 2 - scale * parseFloat(selectedNode.attr('vy'))];
                        svg.transition().duration(followInterval).attr('transform', 'translate('  + translate.join(',') + ') scale(' + scale + ')') ;
                    }, followInterval);
                    d3.event.stopPropagation();
                });

        charGroups.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 20)
            .attr('fill', () => utils.randomColor())
            .attr('z-index', 2);

        charGroups.append('text')
            .text((d) => d.name)
            .classed('characterName', true)
            .attr('font-size', 14)
            .attr('x', 0)
            .attr('y', 10);

        // For transitioning characters from location to location if they changed location
        const transitionElements = charData.filter((char, i, nodes) => {
            const node = d3.select(nodes[i]);
            return node.attr('data-currentVal') && node.attr('data-currentVal') !== char.location;
        });
        const transitionDuration = 2000;
        transitionElements.transition().duration(transitionDuration).attr('transform', (char) => {
            const currentCluster = clusters.find((cluster) => cluster.name === char.location);
            return 'translate( ' + currentCluster.x + ',' + currentCluster.y + ')';
        }).attr('vx', (d) => d.x)
        .attr('vy', (d) => d.y)
        .each((d) => d.inTransition = true)
        .on('end', (d) => d.inTransition = false);

        svg.selectAll('.charData').attr('data-currentVal', (d) => d.location);

        playTransitionDelay(transitionElements, transitionDuration);

    };

    // On Click function to stop following the character
    const stopFollowingChar = () => {
        const mainsvg = window.globalBucket.mainSVG;
        mainsvg.on('click', () => {
            if (followingCharInterval) {
                clearInterval(followingCharInterval);
                followingCharInterval = null;
            }
        });
    };

    // Function to delay the time for showing the transitions
    const playTransitionDelay = (transitionElements, transitionDuration) => {
        if (!transitionElements.empty()) {
            play.transitionStatus = true;
            characters.timeout = setTimeout(() => {
                play.transitionStatus = false;
            window.globalBucket.main.recursivePlay();
            }, transitionDuration);
        }
    };

    const clusters = [];
    // Function to get the new area centers for clustering
    const getClusterCenters = () => {
        window.globalBucket.mainSVGG.selectAll('.areaData').each((d, i, nodes) => {
            const currentNode = d3.select(nodes[i]);
            const area = currentNode.select('rect');
            const halfwidth = parseFloat(area.attr('width')) / 2;
            const halfheight = parseFloat(area.attr('height')) / 2;
            const transform = currentNode.attr('transform').replace('translate(', '').replace(')', '').split(',');
            const xPos = parseFloat(transform[0]) + halfwidth;
            const yPos = parseFloat(transform[1]) + halfheight;
            clusters[i] = {cluster: i, name: d.location, x: xPos, y: yPos, width: halfwidth, height: halfheight};
        });
    };

    // Update the Cluster simulation with updated centroids and character positions
    const updateClusters = () => {
        if (!characters.simulation) {
            return;
        }
        const svg = window.globalBucket.mainSVGG;
        //clusters
        getClusterCenters();

        characters.simulation.force('cluster', d3.forceCluster().centers((item) => {
                return clusters.find((cluster) => cluster.name === item.location);}).strength(0.5))
            .nodes(svg.selectAll('.charData').data()).alpha(0.5)
            .on('tick', tickClusters).restart();
    };

    // Initialize the Cluster simulation
    const initClusters = () => {
        getClusterCenters();
        //nodes
        const svg = window.globalBucket.mainSVGG;
        const simulation = d3.forceSimulation()
            .force('cluster', d3.forceCluster().centers((item) => {
                    return clusters.find((cluster) => cluster.name === item.location);}).strength(0.5))
            .force('collide', d3.forceCollide((d) => { return 15; }))
            .on('tick', tickClusters).nodes(svg.selectAll('.charData').data());
        characters.simulation = simulation;
    };

    // Ticking function for the Cluster simulation (Bounding Rect for characters)
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

    const zooming = (zoomFactor) => {
        if(zoomFactor < 0.5) {
            window.globalBucket.mainSVG.selectAll('.characterName').attr('opacity', 0);
        } else {
            window.globalBucket.mainSVG.selectAll('.characterName').attr('opacity', 1);
        }
        window.globalBucket.mainSVG.selectAll('.characterName')
            .attr('font-size', 14 * (1/zoomFactor))
            .attr('y', 10 + 10 * (1/zoomFactor));
    };

return { initCharacters, updateCharacters, initClusters, updateClusters, zooming};
})();


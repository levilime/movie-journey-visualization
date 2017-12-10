const timeline = {
    updateTimeline: (data) => {
        const width = parseInt(window.globalBucket.timelineSVG.style("width").replace("px", ""));
        const timeline = window.globalBucket.timelineSVGG;

        const timeLineScenes = timeline.selectAll('.timelinescenes')
            .data(data.scenes, (d) => d);

        const amountOfPages = data.scenes[data.scenes.length - 1].endPage - data.scenes[0].startPage;

        const scenePercentages = data.scenes.map(scene => (scene.endPage - scene.startPage)/amountOfPages);

        let lastKnownPosition = 0;
        const sceneContainer = timeLineScenes.enter().append('g')
            .classed('timelinescenes', true)
            .attr('transform', (node, i) =>
            {
                const previousLastKnownPosition = lastKnownPosition;
                lastKnownPosition = lastKnownPosition + width * scenePercentages[i];
                return "translate( " +[previousLastKnownPosition, 0].join(',') + ")"});

        const drawnTimelineScenes = sceneContainer.append('rect')
            .attr('width', (node, i ) =>  scenePercentages[i] * width)
            .attr('height', 50)
            .attr('stroke', 'black')
            .attr('fill', () => utils.randomColor())
            .attr('stroke-width', 2)
            .attr('z-index', 1);

        sceneContainer.append('text')
            .text(node => node.name)
            .attr('font-size', 14)
            .attr('x', 0)
            .attr('y', 70);

        drawnTimelineScenes
            .append('title').text((d) => {return d.name; });
    }
};

// TODO create event listener on screen size change so the timeline can be rerendered to new dimensions!
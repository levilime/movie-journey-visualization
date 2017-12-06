const updateTimeline = (data) => {
    const width = parseInt(window.globalBucket.timelineSVG.style("width").replace("px", ""));
    const timeline = window.globalBucket.timelineSVG.append('g');

    console.log(data);

    const timeLineScenes = timeline.selectAll('.timelinescenes')
        .data(data.scenes, (d) => d);

    const sceneContainer = timeLineScenes.enter().append('g')
        .classed('timelinescenes', true)
        .attr('transform', (node, i) => "translate( " +[i*100, 0].join(',') + ")")

    const drawnTimelineScenes = sceneContainer.append('rect')
        .attr('width', 100)
        .attr('height', 100)
        .attr('fill', () => randomColor())
        .attr('stroke', 'black')
        .attr('fill', () => window.globalBucket.utils.randomColor())
        .attr('stroke-width', 2)
        .attr('z-index', 1);

    sceneContainer.append('text')
        .text(node => node.name)
        .attr('font-size', 14)
        .attr('x', 0)
        .attr('y', 120);

    drawnTimelineScenes
        .append('title').text((d) => {return d.name; });

};

// TODO create event listener on screen size change so the timeline can be rerendered to new dimensions!

// create exported functions here
window.globalBucket.timeline = {updateTimeline};
// put here the logic that should happen when the scene changes
window.globalBucket.activeSceneChange = (scene) => {

};

// put here the logic when new script data is loaded in
window.globalBucket.newData = (data) => {
    window.globalBucket.overview(data);
};

window.onload = () => {init();};

// initialization of all main draw elements
const init = () => {
    // overview SVG
    window.globalBucket.mainSVG = d3.select('#container')
        .append('svg')
        .classed('overviewSVG', true)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .call(d3.zoom().on("zoom", function () {
            window.globalBucket.mainSVG.attr("transform", d3.event.transform)
        }))
        .append('g');

    // draw the overview
    window.globalBucket.overview.updateOverview(window.globalBucket.data);

    // timeline
    window.globalBucket.timelineSVG = d3.select('#timeline')
        .append('svg')
        .classed('timelineSVG', true);


    // draw the timeline
    window.globalBucket.timeline.updateTimeline(window.globalBucket.data);
};
const timeline = (() => {
   var metadata = "";
   //Update the timeline according to the data
   const updateTimeline =  (data) => {
        const width = timelineUtilcalculateTimelineWidth();
        const timeline = window.globalBucket.timelineSVGG;

        timeline.selectAll(".timelinescenes").remove();

        const timeLineScenes = timeline.selectAll('.timelinescenes')
            .data(data.scenes, (d) => d);

        const amountOfPages = data.scenes[data.scenes.length - 1].endTime - data.scenes[0].startTime;

        const scenePercentages = data.scenes.map(scene => (scene.endTime - scene.startTime) / amountOfPages);

        let lastKnownPosition = 0;
        const sceneContainer = timeLineScenes.enter().append('g')
            .classed('timelinescenes', true)
            .attr('transform', (node, i) => {
                const previousLastKnownPosition = lastKnownPosition;
                lastKnownPosition = lastKnownPosition + width * scenePercentages[i];
                return "translate( " + [previousLastKnownPosition, 0].join(',') + ")";
            });

        const drawnTimelineScenes = sceneContainer.append('rect')
            .attr('width', (node, i) => scenePercentages[i] * width)
            .attr('height', 50)
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .attr('z-index', 1);
        updateTimelineColors();

        drawnTimelineScenes
            .append('title').text((d) => {
            return d.name;
        });
    };
   //Update the colors of the timeline according to the time
    updateTimelineColors = () => {
        const svg = window.globalBucket.mainSVGG;
        const areas = svg.selectAll('.areaData').data();

        const timeline = window.globalBucket.timelineSVGG;
        timeline.selectAll('.timelinescenes').selectAll('rect')
            .transition().duration(window.globalBucket.transitionDuration)
            .attr('fill', (d) => {
                const area = areas.find((a) => a.location === d.location);
                return area.color;
        });
    }

    //Click event on the timeline
    clickTimeline= () => {
        const svgtimeline = window.globalBucket.timelineSVG._groups[0][0];
        svgtimeline.addEventListener("click", (e) => {
            const svgxpos = svgtimeline.getBoundingClientRect().x;
            const clickontimeline = e.clientX - svgxpos;
            const progress = clickontimeline / timelineUtilcalculateTimelineWidth();
            window.globalBucket.time =  Math.max(progress * window.globalBucket.amountofPages, 0);
            if (!play.playStatus) recursivePlay()
        })
    };
    //Show current scene information
    const metaData = (resize) => {
        const timeline = window.globalBucket.timelineSVGG;
        timeline.selectAll('metaData').attr('x', timelineUtilcalculateTimelineWidth()/4);
        const newMetaData = ["At page: " + Math.floor(window.globalBucket.time) +"/"+ window.globalBucket.amountofPages
        +", " + "Scene: "+ window.globalBucket.currentSceneIndex + "/" + window.globalBucket.data.scenes.length
        +", " + "Locations: " + window.globalBucket.areaAmount
        +", " + "Location: " + window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex].name];


        if (newMetaData[0] !== metadata || resize) {
            metadata = newMetaData[0];
            timeline.selectAll('.metatext').remove();
            const metaText = timeline.selectAll('metaData').data(newMetaData).enter().append('text')
                .classed('metatext', true)
                .attr('font-size', 14)
                .attr('x', timelineUtilcalculateTimelineWidth()/4)
                .attr('y', 70);

            metaText.text(d => {
                return d;
            });
        }
    };

    //Update the timer of the timeline
    const updateTimelineProgress =  (progress) => {
        const data = [{progress}];
        const timeline = window.globalBucket.timelineSVGG;

        metaData();
        timeline.selectAll(".progress").remove();
        const progressInit = timeline.selectAll('.progress')
            .data(data, d => d)
            .attr('transform', (data) => {
                return "translate( " + [timelineUtilcalculateTimelineWidth()
                    * data.progress, 0].join(',') + ")"
            });


        const progressContainer = progressInit.enter().append('g')
            .classed('progress', true)
            .attr('transform', (data) => {
                return "translate( " + [timelineUtilcalculateTimelineWidth()
                    * data.progress, 0].join(',') + ")"
            });
        progressContainer.append('line')
            .attr('stroke-width', 3)
            .attr('stroke', 'red')
            .attr('x1', link => 0)
            .attr('y1', link => 0)
            .attr('x2', link => 0)
            .attr('y2', link => 70);


    };
    const timelineUtilcalculateTimelineWidth = () => parseInt(window.globalBucket.timelineSVG.style("width").replace("px", ""));
    return {updateTimeline, updateTimelineProgress, updateTimelineColors, clickTimeline, metaData};
})();


const timeline = {
    updateTimeline: (data) => {
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
                return "translate( " + [previousLastKnownPosition, 0].join(',') + ")"
            });

        const drawnTimelineScenes = sceneContainer.append('rect')
            .attr('width', (node, i) => scenePercentages[i] * width)
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
            .append('title').text((d) => {
            return d.name;
        });
    },
    clickTimeline: () => {
        const svgtimeline = window.globalBucket.timelineSVG._groups[0][0];
        svgtimeline.addEventListener("click", (e) => {
            const svgxpos = svgtimeline.getBoundingClientRect().x;
            const clickontimeline = e.clientX - svgxpos;
            const progress = clickontimeline / timelineUtilcalculateTimelineWidth();
            window.globalBucket.time =  progress * window.globalBucket.amountofPages;
            if (!play.playStatus) recursivePlay()
        })
    },
    calculateTimelineWidth: () => parseInt(window.globalBucket.timelineSVG.style("width").replace("px", "")),
    updateTimelineProgress: (progress) => {
        const data = [{progress}];
        const timeline = window.globalBucket.timelineSVGG;
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
    }
};

const timelineUtilcalculateTimelineWidth = () => parseInt(window.globalBucket.timelineSVG.style("width").replace("px", ""));
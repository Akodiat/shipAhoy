
/*global vegaEmbed */

class PlotView {
    constructor(elementId) {
        this.elementId = elementId;
        const avscWorkerPath = "src/avscWorker.js";
        const heatmapDataPath = "../resources/timeSeries.avro";
        const avscWorker = new Worker(avscWorkerPath, {type: "module"});
        avscWorker.addEventListener("message", e => {
            avscWorker.terminate();

            this.data = e.data.data.map(v=>{
                return {
                    ...v,
                    // Convert string to Date
                    date: new Date(v.date)
                };
            });
        });
        avscWorker.postMessage(heatmapDataPath);
    }

    plot(annotation) {
        const spec = annotation.spec.plotSpec;
        const element = document.getElementById(this.elementId);
        if (spec === undefined) {
            // Hide plot element if no plot is specified
            element.style.display = "none";
            return;
        }
        element.style.display = "block";
        if (spec.data === undefined) {
            // Append data to specification
            spec.data = {values: this.data};
        }
        // Embed the visualization in the container with id `vis`
        vegaEmbed("#"+this.elementId, spec).then(res => {
            this.view = res.view;
            res.view.run();
        });
    }
}

export {PlotView};
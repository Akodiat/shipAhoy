
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
        const spec = {
            ...annotation.spec.plotSpec,
            // Append data to specification
            data: {values: this.data}
        };
        // Embed the visualization in the container with id `vis`
        vegaEmbed("#"+this.elementId, spec).then(res => {
            this.view = res.view;
            res.view.run();
        });
    }
}

export {PlotView};
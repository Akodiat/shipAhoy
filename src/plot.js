
/*global vegaEmbed */

class PlotView {
    constructor(elementId) {
        this.elementId = elementId;
        this.requestId = 0;
        const avscWorkerPath = "src/avscWorker.js";
        const heatmapDataPath = "../resources/timeSeries.avro";
        const avscWorker = new Worker(avscWorkerPath, {type: "module"});
        this.dataReady = new Promise(resolve => {
            avscWorker.addEventListener("message", e => {
                avscWorker.terminate();
                this.data = e.data.data.map(v => ({
                    ...v,
                    date: new Date(v.date)
                }));
                resolve();
            });
        });
        avscWorker.postMessage(heatmapDataPath);
    }

    async plot(annotation) {
        const requestId = ++this.requestId;
        const spec = annotation.spec.plotSpec;
        const element = document.getElementById(this.elementId);
        if (spec === undefined) {
            // Hide plot element if no plot is specified
            element.style.display = "none";
            return;
        }
        element.style.display = "block";
        if (spec.data === undefined) {
            await this.dataReady;
            if (requestId !== this.requestId) return;
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

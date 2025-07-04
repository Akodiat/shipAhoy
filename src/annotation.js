class Annotation {
    /**
     *
     * @param {Vector3} labelPosition
     * @param {number | string} id
     * @param {string} heading
     * @param {string} content
     * @param {string} dataKey
     */
    constructor(spec) {
        this.spec = spec;

        this.content = "";

        if (spec.description) {
            this.content += spec.description;
        }

        if (spec.sdgIcons) {
            this.content += "<h3>SDGs at risk</h3>";
            this.content += "<div>";
            for (const idx of spec.sdgIcons) {
                this.content += `
                    <img
                        width=100
                        src="resources/sdg_icons/E_SDG_PRINT-${idx.toString().padStart(2, "0")}.jpg"
                        title="${sdgText[idx-1]}"
                    >
                `;
            }
            this.content += "</div>";
        }

        if (spec.environmentalImpact) {
            this.content += `<h3>Environmental impact</h3>${spec.environmentalImpact}`;
        }

        if (spec.humanImpact) {
            this.content += `<h3>Human impact</h3>${spec.humanImpact}`;
        }

        if (spec.images) {
            this.content += "<h3>Images</h3>";
            for (const i of spec.images) {
                const imageDom = `
                <article>
                    <img
                        src="${i.path}"
                        title="${i.description}"
                        onclick="populateImageModal('${i.header}','${i.path}','${i.description}','${i.attribution}'); document.getElementById('imageModal').open = true"
                        style="cursor: pointer"
                    >
                    <footer>${i.header}</footer>
                </article>
                `;
                this.content += imageDom;
            }
        }

        this.onSelect = ()=>{};
    }
}

const sdgText = [
    "SDG 1: No poverty",
    "SDG 2: Zero hunger",
    "SDG 3: Good health and well-being",
    "SDG 4: Quality education",
    "SDG 5: Gender equality",
    "SDG 6: Clean water and sanitation",
    "SDG 7: Affordable and clean energy",
    "SDG 8: Decent work and economic growth",
    "SDG 9: Industry, innovation and infrastructure",
    "SDG 10: Reduced inequalities",
    "SDG 11: Sustainable cities and communities",
    "SDG 12: Responsible consumption and production",
    "SDG 13: Climate action",
    "SDG 14: Life below water",
    "SDG 15: Life on land",
    "SDG 16: Peace, justice and strong institutions",
    "SDG 17: Partnerships for the goals"
];

function mdToHTMLLink(markdown) {
    const re = /\[(.+)\]\((.*)\)/;
    return markdown.replace(re, `<a target="_blank" href="$2">$1</a>`)
}

window.populateImageModal = (header, path, description, attribution) => {
    document.getElementById("imageModalHeader").innerHTML = header;
    document.getElementById("imageModalImage").src = path;
    document.getElementById("imageModalDescription").innerHTML = mdToHTMLLink(description);
    document.getElementById("imageModalAttribution").innerHTML = mdToHTMLLink(attribution);
};

export {Annotation}
import { t, localizeAnnotation } from "./i18n.js";
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
        this.originalSpec = spec;
        this.onSelect = () => {};
    }

    get spec() {
        return localizeAnnotation(this.originalSpec);
    }

    get content() {
        const spec = this.spec;

        let content = "";

        if (spec.description) {
            content += spec.description;
        }

        if (spec.sdgIcons) {
            content += `<h3>${t("annotationSections.sdgsAtRisk")}</h3>`;
            content += "<div>";
            for (const idx of spec.sdgIcons) {
                content += `
                    <img
                        width=100
                        src="resources/sdg_icons/E_SDG_PRINT-${idx.toString().padStart(2, "0")}.jpg"
                        title="SDG ${idx}: ${t(`sdg.goal${idx}`)}"
                    >
                `;
            }
            content += "</div>";
        }

        if (spec.environmentalImpact) {
            content += `<h3>${t("annotationSections.environmentalImpact")}</h3>${spec.environmentalImpact}`;
        }

        if (spec.humanImpact) {
            content += `<h3>${t("annotationSections.humanImpact")}</h3>${spec.humanImpact}`;
        }

        if (spec.images) {
            content += `<h3>${t("annotationSections.images")}</h3>`;
            for (const [index, i] of spec.images.entries()) {
                const imageDom = `
                <article>
                    <img
                        src="${i.path}"
                        data-image-index="${index}"
                        style="cursor: pointer"
                    >
                    <footer>${i.header}</footer>
                </article>
                `;
                content += imageDom;
            }
        }

        if (spec.references) {
            content += `<h3>${t("annotationSections.references")}</h3>${spec.references}`;
        }

        return content;
    }
}

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

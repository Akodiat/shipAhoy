import {Vector3} from "three";
import {Annotation} from "./annotation.js"


/**
 * Edit this to update the impact data
 */
const annotations = [
    {name: "Scrubber water",
        description: `
        <p>
            Scrubbers are installed on ships to enable the vessel to continue to run on conventional high sulfur fuels while still being compliant to stricter regulations limiting the sulfur oxide content in ships exhaust. In a scrubber, water is sprayed over the exhaust, reducing the concentration of SOx in the exhaust to compliant levels. The scrubber water is not only taking upp SOx, forming sulfuric acid and becoming highly acidic, but also scavenges other contaminants (e.g. metals and organic substances) that are instead discharged directly to the marine environment.
        </p>
        <p>
            The use of scrubbers introduces a new contamination source to the marine environment with substantial adverse effects on marine organisms at very low concentrations. The use of a scrubber also implies a fuel penalty with 2-3%, with higher climate footprint compared to a ship without a scrubber.
        </p>
        `,
        environmentalImpact: "The discharge of scrubber water result in increased contaminant load of metals, polycyclic aromatic hydrocarbons (PAHs) and alkylated PAHs to the marine environment. The addition of a strong acid (sulfuric acid) may contribute to reduced buffer capacity (i.e. alkalinity) of the seas that can affect the carbon cycle. Increased emissions of green house gases will contribute to global warming.",
        humanImpact: "Reducing SOx and particles in the exhaust can be positive with respect to human health. However, recent findings suggest that the scrubber produces higher numbers of the smaller particles with the largest damaging effects on the respiratory system.",
        hazardIcons: [
            "Health hazard",
            "Harmful",
            "Harmful to the environment",
            "Corrosive"
        ],
        images: [
            {
                header: "Open vs closed loop scrubber system",
                path: "resources/images/scrubber_system.svg",
                description: "Illustration of two different scrubber system, open and closed loop, where the open loop (A) continuously pump in and discharge seawater while the closed loop (B) recirculates most water with addition of an alkaline solution. Hybrid systems can run in open and closed loop mode., EMERGE-project",
                attribution: "Illustration: Anna Lunde Hermansson"
            },
            {
                header: "Sea urchin exposure",
                path: "resources/images/scrubber_seaurchin_exposed.jpg",
                description: "Some abnormalities observed in Psammechinus miliaris (sea urchin) larvae at 72 h exposure to scrubber water. The adverse effects on fertilization success and larvae development were observed even at the lowest dilutions of scrubber water, confirming that scrubber water could present adverse effects on the whole life cycle of the marine organisms.",
                attribution: "Zapata-Restrepo,L., Williams,I., (2025) [Mytilus edulis and Psammechinus miliaris as bioindicators of ecotoxicological risk by maritime exhaust gas scrubber water](https://doi.org/10.1016/j.marenvres.2025.107157), Marine Environmental Research."
            },
            {
                header: "Mussel exposure",
                path: "resources/images/scrubber_mussel_exposure.jpg",
                description: "Some abnormalities observed in Mytilus edulis (mussel) larvae at 72 h exposure to scrubber water. Arrows: hypertrophy of the mantle. Arrowhead: hinge abnormality. The adverse effects on fertilization success and larvae development were observed even at the lowest dilutions of scrubber water, confirming that scrubber water could present adverse effects on the whole life cycle of the marine organisms.",
                attribution: "Zapata-Restrepo,L., Williams,I., (2025) [Mytilus edulis and Psammechinus miliaris as bioindicators of ecotoxicological risk by maritime exhaust gas scrubber water](https://doi.org/10.1016/j.marenvres.2025.107157), Marine Environmental Research."
            },
            {
                header: "Estimated vanadium input 2018",
                path: "resources/images/ytreberg_2022_Vanadin.png",
                description: "Estimated input of vanadium to the Swedish Exclusive Economic Zone in 2018, open loop scrubber water discharge is a significant source. In 2018, only 178 vessels had scrubbers in the Baltic Sea",
                attribution: " Ytreberg, E., Hansson, K., Lunde Hermansson, A., Parsmo, R., Lagerström, M., Jalkanen, J.P., Hassellöv, I.M., 2022. [Metal and PAH loads from ships and boats, relative other sources, in the Baltic Sea](https://doi.org/10.1016/j.marpolbul.2022.113904). Mar. Pollut. Bull. 182, 113904."
            }
        ],
        mapLayer: "SCRUB_W_CLOSED",
        plotCaption: `Plot showing number of ships that have installed (or opted to install) scrubbers from 2007-2028. Data is collected from <a target="_blank" href="https://afi.dnvgl.com/Statistics">Alternative Fuels Insights - DNV</a> (Accessed May 20259.`,
        plotSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            description: "Scrubber installed DNV AFI",
            data: {
                values: [
                    { year: new Date("2007"), nShips: 2 },
                    { year: new Date("2008"), nShips: 0 },
                    { year: new Date("2009"), nShips: 5 },
                    { year: new Date("2011"), nShips: 11 },
                    { year: new Date("2012"), nShips: 24 },
                    { year: new Date("2013"), nShips: 46 },
                    { year: new Date("2014"), nShips: 122 },
                    { year: new Date("2015"), nShips: 250 },
                    { year: new Date("2016"), nShips: 321 },
                    { year: new Date("2017"), nShips: 388 },
                    { year: new Date("2018"), nShips: 693 },
                    { year: new Date("2019"), nShips: 3139 },
                    { year: new Date("2020"), nShips: 4337 },
                    { year: new Date("2021"), nShips: 4564 },
                    { year: new Date("2022"), nShips: 4859 },
                    { year: new Date("2023"), nShips: 5353 },
                    { year: new Date("2024"), nShips: 5998 },
                    { year: new Date("2025"), nShips: 6456 },
                    { year: new Date("2026"), nShips: 6585 },
                    { year: new Date("2027"), nShips: 6633 },
                    { year: new Date("2028"), nShips: 6634 },
                ]
            },
            height: 200,
            width: "container",
            mark: "bar",
            encoding: {
                x: { field: "year", type: "temporal", title: "Year", timeUnit: "year" },
                y: { field: "nShips", type: "quantitative", title: "Nr of ships (Data collected May 2025)" },
                tooltip: [
                    { field: "nShips", type: "quantitative", title: "Number of ships" },
                    { field: "year", type: "temporal", title: "Year", timeUnit: "year" }
                ]
            }
        },
        // Smokestack (end engine)
        shipTypes: {
            cruise: {
                labelPos: new Vector3(0.5, 45, -85),
                cameraPos: new Vector3(45, 45, -85)
            },
        },
        sdgIcons: [3, 7, 9, 11, 12, 13, 14]
    },
    {name: "Exhaust gas",
        sdgIcons: [13, 14, 15],
        description: `
        <p>
            The majority of today's commercial fleet are still running on conventional fossil bunker fuels where heavy fuel oil (HFO), marine gas oil (MGO) and hybrid fuels (very low sulpfur fuel oils (VLSFO) and ultra-low sulfur fuel oils (ULSFO) holds >99% of the fuel market share of the operating fleet (see bar chart below, noting the non-linear scale).
        </p>
        <p>
            The exhaust gas from conventional combustion constitutes of greenhouse gases (e.g. carboon dioxide, nitrous oxide and water), nitrogen oxides (NOx), sulfur oxides (SOx), volatile organic compounds (VOCs) and particles (PM) consisting of soot/black carbon (including non-volatile organic substances) and ash (containing metals).
        </p>
        <p>
            In addition of emitting greenhouse gases, where the commercial shipping fleet are estimated to account for almost 3% of the global CO2 emissions, the combustion products can contribute to acidification (CO2 and SOx), premature deaths from respiratory diseases (e.g. PM) and long- and short-range spreading of hazardous substances (e.g. metals and organic substances).
        </p>
        <p>
            Some measures have been taken to reduce the negative impact of exhaust gases on air quality and human health, including the introduction of alternative fuels (e.g. methanol and LNG), selective catalytic reduction to reduce NOx and scrubbers to reduce SOx. However, the use of scrubbers has resulted in increased pressure on the marine environment and higher climate footprint (see <a onclick="selectAnnotationByName('Scrubber water')">Scrubber water</a>).
        </p>
        `,
        // Exhaust
        shipTypes: {
            cruise: {
                labelPos: new Vector3(0.5, 65, -85),
                cameraPos: new Vector3(45, 65, -85)
            },
        },
        plotSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            data: {values: [
                {fuel: "Conventional fuel", percentage: 99.12},
                {fuel: "LNG", percentage: 0.67},
                {fuel: "LPG", percentage: 0.14},
                {fuel: "Methanol", percentage: 0.06},
                {fuel: "Hydrogen", percentage: 0.01},
                {fuel: "Ammonia", percentage: 0}
            ]},
            height: 200,
            width: "container",
            encoding: {
                x: {field: "percentage", type: "quantitative", title: "Fuel market share (%)", scale: {type: "symlog"}},
                y: {field: "fuel", type: "ordinal", title: "Fuel type", sort: {field: "percentage", order: "descending"}},
                tooltip: [
                    {field: "fuel", type: "ordinal", title: "Fuel type"},
                    {field: "percentage", title: "Fuel market share (%)"}
                ]
            },
            layer: [
                {
                    mark: "bar"
                },
                {
                    mark: {
                        type: "text",
                        align: {expr: "datum.percentage < 10 ? 'left' : 'right'"},
                        dx: {expr: "datum.percentage < 10 ? 4 : -4"}
                    },
                    encoding: {
                        text: {field: "percentage", type: "quantitative"}
                    }
                }
            ]
        },
        plotCaption: `Bar chart showing the percent of fleet using conventional vs alternative fuels (LNG, LPG, methanol, hydrogen and ammonia). Data is collected from <a target="_blank" href="https://afi.dnvgl.com/Statistics">Alternative Fuels Insights - DNV</a> (Accessed May 2025).`
    },
    {name: "Underwater radiated noise",
        description: `
        <p>
            Underwater noise is considered a type of energy pollution. An overview of ship generated underwater noise, and the resulting environmental impacts was published by EMSA in 2022 <a target="_blank" href="https://www.emsa.europa.eu/protecting-the-marine-environment/underwater-noise/download/6881/4503/23.html">[1]</a>.
        </p>
        <p>
            “In 2014, the International Maritime Organization approved voluntary guidelines for reducing underwater noise from commercial ships <a target="_blank" href="www.imo.org/en/MediaCentre/HotTopics/Pages/Noise.aspx">[2]</a>. These guidelines focused on design features that could reduce the primary sources of underwater noise, namely the propellers, hull form, and on-board machinery. Following these guidelines, in 2015, Maersk underwent a retrofit of five large container ships and found that reducing propeller cavitation decreased low-frequency sound pressure levels by 6 to 8 dB while improving fuel efficiency.” <a target="_blank" href="https://www.science.org/doi/10.1126/science.aba4658">[3]</a>
        </p>
        <p>
            EU has taken the initiative to regulate underwater noise <a target="_blank" href="https://environment.ec.europa.eu/news/zero-pollution-and-biodiversity-first-ever-eu-wide-limits-underwater-noise-2022-11-29_en">[4]</a>. This is great but still challenging to monitor.
        </p>
        `,
        // Propeller
        shipTypes: {
            cruise: {
                labelPos: new Vector3(5.5, -5.5, -130),
                cameraPos: new Vector3(10, -5, -140),
            },
        },
        sdgIcons: [14]
    },
].map((spec) => new Annotation(spec));

export {annotations};

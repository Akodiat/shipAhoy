import {Vector3} from "three";

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

window.populateImageModal = (header, path, description, attribution) => {
    document.getElementById("imageModalHeader").innerHTML = header;
    document.getElementById("imageModalImage").src = path;
    document.getElementById("imageModalDescription").innerHTML = description;
    document.getElementById("imageModalAttribution").innerHTML = attribution;
};

const annotations = [
    {
        name: "Anchorage",
        environmentalImpact: "Underwater noise, destruction of seabed habitat",
        humanImpact: "Damage to underwater infrastructure (e.g. cables)",
        // At anchor:
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(12, 19, 110),
                cameraPos: new Vector3(20, 20, 110)
            }
        }
    },
    {
        name: "Propoulsion momentum",
        environmentalImpact: "Ship strikes of marine mammals, groundings",
        // At the (bulbous) bow:
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(0, 5, 119),
                cameraPos: new Vector3(10, 7, 140)
            }
        }
    },
    {
        name: "Antifouling",
        description: `
        <p>
            Antifouling coatings are applied to the ship hull to avoid attachment and growth of sessile species (see Biofouling) and reduce the fuel penalty, of increased surface roughness, to secure manoeuvring capabilities and also to prevent spreading of invasive species. Antifouling coatings are often biocide based, releasing toxic compounds (often copper) to the marine environment. Today, biocide free alternatives are also available on the market.
        </p>
        <p>
            Inefficient antifouling performance, where the ship hull gets covered by a thin layer of slime, can increase the fuel consumption by 30% and contribute to the spreading of invasive species. However, anti-fouling coatings that leak biocides will contribute to an increased contaminant load of copper and other biocides with potential toxic effects in the marine environment.
        </p>`,
        environmentalImpact: "Chemicals and paint particals, inluding (micro)plastic from antifouling coatings: ecotoxicology, health of marine life, Hullcleaning: plus realease of fouling organisms,  plus monetary cost of envionmental impact",
        humanImpact: "antifouling paints: trophic transfere of chemicals, risk for workers (chemical exposure (solvant), risk of accidents) Hullcleaning (without capture) trophic transfere of chemicals, risk for workers (risk of accidents), plus monetary cost of human health impact",
        hazardIcons: [
            "Health hazard",
            "Harmful",
            "Harmful to the environment"
        ],
        images: [
            {
                header: "Inert coating",
                path: "resources/images/antifouling_1_inertcoating.jpg",
                description: "Fouling on static idle panels. Panel painted with inert coating. Submerged 250 days in Tjärnö, Skagerrak on the Swedish Westcoast. Salinity 26 psu.",
                attribution: `D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, A novel tool for cost and emission reduction related to ship underwater hull maintenance, J. Clean. Prod. 356 (2022), 131882. http://dx.doi.org/10.1016/j.jclepro.2022.131882`
            },
            {
                header: "Biocidal copper coating",
                path: "resources/images/antifouling_2_biocidal_copper_coating.jpg",
                description: "Fouling on static idle panels. Panel painted with biocidal copper coating. Submerged 250 days in Tjärnö, Skagerrak on the Swedish Westcoast. Salinity 26 psu.",
                attribution: `D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, A novel tool for cost and emission reduction related to ship underwater hull maintenance, J. Clean. Prod. 356 (2022), 131882. http://dx.doi.org/10.1016/j.jclepro.2022.131882`
            },
            {
                header: "Biocidefree silicon coating",
                path: "resources/images/antifouling_3_foulrelease_biocidefree_silicon_coating.jpg",
                description: "Illustration showing the HullMASTER tool, D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, A novel tool for cost and emission reduction related to ship underwater hull maintenance, J. Clean. Prod. 356 (2022), 131882.",
                attribution: `D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, A novel tool for cost and emission reduction related to ship underwater hull maintenance, J. Clean. Prod. 356 (2022), 131882. http://dx.doi.org/10.1016/j.jclepro.2022.131882`
            },
            {
                header: "HullMASTER",
                path: "resources/images/antifouling_hullmaster.png",
                description: "Fouling on static idle panels. Panel painted with foul-release biocide-free silicone coating. Submerged 250 days in Tjärnö, Skagerrak on the Swedish Westcoast. Salinity 26 psu.",
                attribution: `D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, A novel tool for cost and emission reduction related to ship underwater hull maintenance, J. Clean. Prod. 356 (2022), 131882. http://dx.doi.org/10.1016/j.jclepro.2022.131882`
            }
        ],
        // Somewhere on the immersed part of the hull
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(12, 3, 20),
                cameraPos: new Vector3(40, 15, 40)
            }
        },
        mapLayer: "AFP_CuO",
        plotSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            description: "Antifouling paint emission over time",
            height: 200,
            width: "container",
            mark: "line",
            transform: [{fold: [
                "AFP_CuO", "AFP_CuPyr", "AFP_DCOIT", "AFP_Zineb", "AFP_ZnO", "AFP_ZnPyr"
            ]}],
            encoding: {
                x: {field: "date", type: "temporal",  title: ""},
                y: {field: "value", type: "quantitative", scale: {type: "log"}},
                color: {field: "key", type: "nominal", title: "Paint type"}
            }
        }
    },
    {
        name: "Biofouling",
        description: `
        <p>
            All structures in the marine environment are exposed to fouling pressure, where the ship hull, piping, and sea chests are subject to biological growth. The usual ecological succession order starts with microbial films, followed by algal mats and subsequent growth of barnacles, worms, and mussels that in turn can act as shelters for other species.
        <p>
            Biofouling results in the spread of invasive species and also a higher climate footprint due to the fuel penalty from increased roughness of the hull.
        </p>
        <p>
            Measures against biofouling involves antifouling paints (see Antifouling), ballast water treatment systems (see Ballast water), and antifouling agents in sea chests (see Cooling water).
        </p>
        `,
        environmentalImpact: "Spread of invasive species, increased emissions to air (and impact on human health, climate change, and euthropication (from NOX) can be monitized), because of higher fuel consumption, drag, friction, and limited manouverability",
        humanImpact: "Increased air emissions",

        images: [
            {
                header: "Biofouling 1 - Australian tubeworm",
                path: "resources/images/biofouling_1.jpg",
                description: "Australian tubeworm (Ficopomatus enigmaticus) is a well-known alien species that is mainly spread via ship hulls. The Australian tubeworm is widespread on the South English coast, Californa and South America and the photo shows the first specimen that was detected in Sweden (in 2013) in Malmö., CHANGE-project.",
                attribution: "Photo: Magnus Dahlström"
            },
            {
                header: "Biofouling 2 - Australian tubeworm",
                path: "resources/images/biofouling_2.jpg",
                description: "Australian tubeworm (Ficopomatus enigmaticus) is a well-known alien species that is mainly spread via ship hulls. The Australian tubeworm is widespread on the South English coast, Californa and South America and the photo shows the first specimen that was detected in Sweden (in 2013) in Malmö., CHANGE-project.",
                attribution: "Photo: Magnus Dahlström"
            },
            {
                header: "Biofouling 3 - Australian tubeworm",
                path: "resources/images/biofouling_3.jpg",
                description: "Australian tubeworm (Ficopomatus enigmaticus) is a well-known alien species that is mainly spread via ship hulls. The Australian tubeworm is widespread on the South English coast, Californa and South America and the photo shows the first specimen that was detected in Sweden (in 2013) in Malmö., CHANGE-project.",
                attribution: "Photo: Magnus Dahlström"
            }
        ],
        // Somewhere on the immersed part of the hull
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(12, 3, -20),
                cameraPos: new Vector3(40, 15, -20)
            }
        }
    },
    {
        name: "Echo"
    },
    {
        name: "Ballast water",
        description: `
        <p>
            Ballast water is used to ensure vessels stability and optimal vessel trim. Ballast water is pumped into ballast tanks when a ship has delivered cargo to a port and is departing with less cargo or no cargo. Ballast water is then transported and released at the next port-of-call where the ship picks up more cargo. When a ship is receiving or delivering cargo to a number of ports, it may release or take on a portion of ballast water at each port and the ship’s ballast water can contain a mix of waters from multiple ports.
        </p>
        <p>
            Ballast water discharge has been identified as a main vector in spreading of invasive species.
        </p>
        <p>
            The recent global requirements to treat the water at ballasting and/or de-ballasting can contribute to contaminant load of (often halogenated) disinfection by-products.
        </p>
        `,
        images: [
            {
                header: "Ballast water discharge hotspots in the EU 2018",
                path: "resources/images/BalW_discharge_hotspot_EU_2018.png",
                description: "Ballast water discharge in European seas in 2018. Bar height indicate the magnitude of discharge. Bars are calculated for 0.5×0.5 deg grid cells. Dataset metadata is available at: https://metadata.helcom.fi/geonetwork/srv/eng/catalog.search#/metadata/df0b81ff-824a-4550-8948-fb71221baacd.",
                attribution: ""
            }
        ],
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(13, 14, 92),
                cameraPos: new Vector3(20, 14, 92)
            }
        }
    },
    {
        name: "Sewage (black water)"
    },
    {
        name: "Grey water"
    },
    {
        name: "Tank cleaning",
        environmentalImpact: "Media coverage: tall oil discharge in Botthnian Sea.",
        // Discharge point/tank
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            }
        }
    },
    {
        name: "Cooling water",
        description: `
        <p>
            Most vessels are dependent on water for cooling when the propulsion of ship generates excess heat in for example the engines, generators and compressors that must be diverted. Seawater is mostly used as cooling agent, being relatively low-tempered and constantly available.
        </p>
        <p>
            To prevent biological growth in sea chest and piping, most cooling systems are connected to a marine growth protection system, where the most common systems release copper ions as a result of electrolysis.
        </p>
        <p>
            There is limited data on how much copper that is being consumed and discharged to the marine environment but preliminary findings suggest…
        </p>
        `,
        // Seachest inlet
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(13.3245, 4.58666, -26.1653),
                cameraPos: new Vector3(15, 7, -26.1653)
            }
        }
    },
    {
        name: "Scrubber water",
        description: `
        <p>
            Scrubbers are installed on ships to enable the vessel to continue to run on conventional high sulfur fuels while still being compliant to stricter regulations limiting the sulfur oxide content in shipss exhaust. In a scrubber, water is sprayed over the exhaust, reducing the concentration of SOx in the exhaust to compliant levels. The scrubber water is not only taking upp SOx, forming sulfuric acid and becoming highly acidic, but also scavenges other contaminants (e.g. metals and organic substances) that are instead discharged directly to the marine environment.
        </p>
        <p>
            The use of scrubbers introduces a new contamination source to the marine environment with substantial adverse effects on marine organisms at very low concentrations (Figur D.2.3?). The use of a scrubber also implies a fuel penalty with 2-3%, with higher climate footprint compared to a ship without a scrubber.
        </p>
        `,
        environmentalImpact: "Marine pollution, air pollution, climate change. Media coverage: Marco Polo.",
        humanImpact: "Respiratory health issues",
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
            }
        ],
        mapLayer: "SCRUB_W_CLOSED",
        plotCaption: "Plot showing number of ships that have installed (or opted to install) scrubbers from 2007-2028. Data is collected from Alternative Fuels Insights - DNV (Accessed May 20259. https://afi.dnvgl.com/Statistics.",
        plotSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            description: "Scrubber installed DNV AFI",
            data: {values: [
                {year: new Date("2007"), nShips: 2},
                {year: new Date("2008"), nShips: 0},
                {year: new Date("2009"), nShips: 5},
                {year: new Date("2011"), nShips: 11},
                {year: new Date("2012"), nShips: 24},
                {year: new Date("2013"), nShips: 46},
                {year: new Date("2014"), nShips: 122},
                {year: new Date("2015"), nShips: 250},
                {year: new Date("2016"), nShips: 321},
                {year: new Date("2017"), nShips: 388},
                {year: new Date("2018"), nShips: 693},
                {year: new Date("2019"), nShips: 3139},
                {year: new Date("2020"), nShips: 4337},
                {year: new Date("2021"), nShips: 4564},
                {year: new Date("2022"), nShips: 4859},
                {year: new Date("2023"), nShips: 5353},
                {year: new Date("2024"), nShips: 5998},
                {year: new Date("2025"), nShips: 6456},
                {year: new Date("2026"), nShips: 6585},
                {year: new Date("2027"), nShips: 6633},
                {year: new Date("2028"), nShips: 6634},
            ]},
            height: 200,
            width: "container",
            mark: "bar",
            encoding: {
                x: {field: "year", type: "temporal", title: "Year", timeUnit: "year"},
                y: {field: "nShips", type: "quantitative", title: "Nr of ships (Data collected May 2025)"},
                tooltip: [
                    {field: "nShips", type: "quantitative", title: "Number of ships"},
                    {field: "year", type: "temporal", title: "Year", timeUnit: "year"}
                ]
            }
        },
        // Smokestack (end engine)
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(0.5, 30, -57),
                cameraPos: new Vector3(25, 30, -57)
            }
        }
    },
    {
        name: "Bilge water",
        description: `
        <p>
            Bilge water is a mixture of water, oily fluids, lubricants and grease, cleaning fluids and other waste that accumulate in the lowest part of the vessel. The different onboard sources include engines, piping and other constructions throughout the machinery space. The discharge of bilge water is generally allowed as long as the oily content has been reduced to compliant levels in accordance with MARPOL Annex I.
        </p>
        `,
        // discharge point/aft
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: undefined,
                cameraPos: undefined
            }
        }
    },
    {
        name: "Propeller shaft lubricants",
        description: `
        <p>
            The propeller shaft connects the main engine and the propeller through the stern tube. The stern tube goes through the ship hull and contains bearings, sealing and a lubrication system that may leak due to imperfect sealing and/or damage.
        </p>
        `,
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(0, 2, -58),
                cameraPos: new Vector3(10, 2, -65),
            }
        },
        mapLayer: "STERN_TUBE",
        plotSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            description: "Stern tube oil emission over time",
            height: 200,
            width: "container",
            mark: "area",
            encoding: {
                x: {field: "date", type: "temporal", title: ""},
                y: {field: "STERN_TUBE", type: "quantitative", title: "Daily stern tube oil leakage (L)"}
            }
        }
    },
    {
        name: "Solid waste (food waste)"
    },
    {
        name: "Exhaust gas",
        description: `
        <p>
            The majority of today's commercial fleet are still running on conventional fossil bunker fuels where heavy fuel oil (HFO), marine gas oil (MGO) and hybrid fuels (very low sulpfur fuel oils (VLSFO) and ultra-low sulfur fuel oils (ULSFO) holds ##% of the bunker fuel market share.
        </p>
        <p>
            The exhaust gas from conventional combustion constitutes of greenhouse gases (e.g. carboon dioxide, nitrous oxide and water), nitrogen oxides (NOx), sulfur oxides (SOx), volatile organic compounds (VOCs) and particles (PM) consisting of soot/black carbon (including non-volatile organic substances) and ash (containing metals).
        </p>
        <p>
            In addition of emitting greenhouse gases, where the commercial shipping fleet are estimated to account for ## % of the global CO2 emissions, the combustion products can contribute to acidification (CO2 and SOx), premature deaths from respiratory diseases (e.g. PM) and long- and short-range spreading of hazardous substances (e.g. metals and organic substances).
        </p>
        <p>
            Some measures have been taken to reduce the negative impact of exhaust gases on air quality and human health, including the introduction of alternative fuels (e.g. methanol and LNG), selective catalytic reduction to reduce NOx and scrubbers to reduce SOx. However, the use of scrubbers has resulted in increased pressure on the marine environment and higher climate footprint (see Scrubber water).
        </p>
        `,
        environmentalImpact: "Atmospheric deposition",
        // Exhaust
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(0.5, 40, -58),
                cameraPos: new Vector3(25, 40, -58)
            }
        }
    },
    {
        name: "Illumination"
    },
    {
        name: "Waves and turbulence"
    },
    {
        name: "Powertrain",
        description: "Burning fuel in engines produce mechnical power but have higher emissions. Fuel cell have lesser emissions and produce electricity through electrochemical reaction of different fuels. Battery-electric uses stored electricity and have zero emission but have limited energy capacity.",
        // Engine
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: undefined,
                cameraPos: undefined
            }
        }
    },
    {
        name: "Fueltank",
        // Fuel tank
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: undefined,
                cameraPos: undefined
            }
        }
    },
    {
        name: "Underwater radiated noise",
        // Propeller
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: undefined,
                cameraPos: undefined
            },
            container: {
                labelPos: new Vector3(0, 3, -62),
                cameraPos: new Vector3(10, 2, -65),
            }
        }
    },
    {
        name: "Container loss",
        // One of the containers
        shipTypes: {
            container: {
                labelPos: undefined,
                cameraPos: undefined
            }
        }
    },
].map((spec) => new Annotation(spec));


export {annotations, Annotation};
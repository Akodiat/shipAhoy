import {Vector3} from "three";
import {Annotation} from "./annotation.js"


/**
 * Edit this to update the impact data
 */
const annotations = [
    {name: "Anchorage",
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
        },
        sdgIcons: [12]
    },
    {name: "Propulsion momentum",
        description: "In 2023, the north-western Mediterranean Sea was designated a Particularly Sensitive Sea Area by the International Maritime Organization (IMO) with associated protective measures to reduce the number of ship strikes of whales (MEPC 380(80)).",
        environmentalImpact: `Ship strikes of marine mammals, groundings. For more information about ship strikes, see the <a target="_blank" href="https://iwc.int/management-and-conservation/ship-strikes">International Whaling Commision</a>`,
        images: [
            {
                header: "A near-miss between a whale and a container vessel. Picture: CINMS/NOAA",
                path: "resources/images/ship_strike_2.jpeg",
                description: "A near-miss between a whale and a container vessel.",
                attribution: `CINMS/NOAA, [International Whaling Commision](https://iwc.int/management-and-conservation/ship-strikes)`
            },
            {
                header: "A struck whale can be carried unnoticed, far from the site of the collision. ",
                path: "resources/images/ship_strikes_bow_-_kalli_de_meyer.jpeg",
                description: "A struck whale can be carried unnoticed, far from the site of the collision.",
                attribution: `CINMS/NOAA, [International Whaling Commision](https://iwc.int/management-and-conservation/ship-strikes)`
            },
            {
                header: "A ship struck humpback. Picture: NOAA ",
                path: "resources/images/ship_struck_humpback,_Hawaiit._Picture_from_NOAA.jpeg",
                description: "A ship struck humpback",
                attribution: `CINMS/NOAA, [International Whaling Commision](https://iwc.int/management-and-conservation/ship-strikes)`
            },
            {
                header: "Any type of vessel and species of cetacean can be involved. Picture: Fabian Ritter, MEER e.V.",
                path: "resources/images/ship_strike_yacht_-_fabian_meer.jpeg",
                description: "Any type of vessel and species of cetacean can be involved",
                attribution: `CINMS/NOAA, [International Whaling Commision](https://iwc.int/management-and-conservation/ship-strikes)`
            }
        ],
        // At the (bulbous) bow:
        shipTypes: {
            tanker: {
                labelPos: new Vector3(0, 5, 100),
                cameraPos: new Vector3(5.94, 6.95, 122.69)
            },
            cruise: {
                labelPos: new Vector3(0, -2, 140),
                cameraPos: new Vector3(10, 2, 160)
            },
            container: {
                labelPos: new Vector3(0, 5, 119),
                cameraPos: new Vector3(10, 7, 140)
            }
        }
    },
    {name: "Biofouling",
        description: `
        <p>
            All structures in the marine environment are exposed to fouling pressure, where the ship hull, piping, and sea chests are subject to biological growth. The usual ecological succession order starts with microbial films, followed by algal mats and subsequent growth of barnacles, worms, and mussels that in turn can act as shelters for other species.
        <p>
            Biofouling results in the spread of invasive species and also a higher climate footprint due to the fuel penalty from increased roughness of the hull.
        </p>
        <p>
            Measures against biofouling involves antifouling paints (see <a onclick="selectAnnotationByName('Antifouling')">Antifouling</a>), ballast water treatment systems (see <a onclick="selectAnnotationByName('Ballast water')">Ballast water</a>), and antifouling agents in sea chests (see <a onclick="selectAnnotationByName('Cooling water')">Cooling water</a>).
        </p>
        `,
        environmentalImpact: "Spreading of invasive species and increased emissions of e.g. green house gases, particles and NOx due to higher fuel consumption resulting from increased drag, friction and manouverability. Increased air emissions impact air quality and global warming.",
        humanImpact: "Higher emissions can reduce air quality and increase the risk of respiratory complications and adverse health effects.",

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
                labelPos: new Vector3(16, 5, -60),
                cameraPos: new Vector3(47.05, 6.32, -58.12)
            },
            cruise: {
                labelPos: new Vector3(15, 0, 80),
                cameraPos: new Vector3(50, 5, 70)
            },
            container: {
                labelPos: new Vector3(12, 3, -20),
                cameraPos: new Vector3(40, 15, -20)
            }
        }
    },
    {name: "Antifouling",
        description: `
        <p>
            Antifouling coatings are applied to the ship hull to avoid attachment and growth of sessile species (see <a onclick="selectAnnotationByName('Biofouling')">Biofouling</a>) and reduce the fuel penalty, of increased surface roughness, to secure manoeuvring capabilities and also to prevent spreading of invasive species. Antifouling coatings are often biocide based, releasing toxic compounds (often copper) to the marine environment. Today, biocide free alternatives are also available on the market.
        </p>
        <p>
            Inefficient antifouling performance, where the ship hull gets covered by a thin layer of slime, can increase the fuel consumption by 30% and contribute to the spreading of invasive species. However, anti-fouling coatings that leak biocides will contribute to an increased contaminant load of copper and other biocides with potential toxic effects in the marine environment.
        </p>`,
        environmentalImpact: `Release of chemicals and paint particles (including (micro)plastics) from antifouling coating may adversely impact marine life. In-water hull cleaning can also result in release of fouling organisms (see <a onclick="selectAnnotationByName('Biofouling')">Biofouling</a>) and contribute to the spreading of invasive species.`,
        humanImpact: "Trophic transfer by the bioaccumulation of chemicals risk to adversely affect human health. The application and maintenance of antifouling coatings involves a potential risk of chemical exposure to workers.",
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
                attribution: `D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, [A novel tool for cost and emission reduction related to ship underwater hull maintenance](http://dx.doi.org/10.1016/j.jclepro.2022.131882), J. Clean. Prod. 356 (2022), 131882.`
            },
            {
                header: "Biocidal copper coating",
                path: "resources/images/antifouling_2_biocidal_copper_coating.jpg",
                description: "Fouling on static idle panels. Panel painted with biocidal copper coating. Submerged 250 days in Tjärnö, Skagerrak on the Swedish Westcoast. Salinity 26 psu.",
                attribution: `D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, [A novel tool for cost and emission reduction related to ship underwater hull maintenance](http://dx.doi.org/10.1016/j.jclepro.2022.131882), J. Clean. Prod. 356 (2022), 131882.`
            },
            {
                header: "Biocidefree silicon coating",
                path: "resources/images/antifouling_3_foulrelease_biocidefree_silicon_coating.jpg",
                description: "Fouling on static idle panels. Panel painted with foul-release biocide-free silicone coating. Submerged 250 days in Tjärnö, Skagerrak on the Swedish Westcoast. Salinity 26 psu.",
                attribution: `D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, [A novel tool for cost and emission reduction related to ship underwater hull maintenance](http://dx.doi.org/10.1016/j.jclepro.2022.131882), J. Clean. Prod. 356 (2022), 131882.`
            },
            {
                header: "HullMASTER",
                path: "resources/images/antifouling_hullmaster.png",
                description: "Illustration showing the HullMASTER tool.",
                attribution: `D.R. Oliveira, M. Lagerström, L. Granhag, S. Werner, A.I. Larsson, E. Ytreberg, [A novel tool for cost and emission reduction related to ship underwater hull maintenance](http://dx.doi.org/10.1016/j.jclepro.2022.131882), J. Clean. Prod. 356 (2022), 131882.`
            }
        ],
        // Somewhere on the immersed part of the hull
        shipTypes: {
            tanker: {
                labelPos: new Vector3(16, 5, 20),
                cameraPos: new Vector3(55.07, 7.27, 18.50)
            },
            cruise: {
                labelPos: new Vector3(12, 0, 90),
                cameraPos: new Vector3(50, 5, 120)
            },
            container: {
                labelPos: new Vector3(12, 3, 20),
                cameraPos: new Vector3(40, 15, 40)
            }
        },
        mapLayer: "AFP_CuO",
        sdgIcons: [3,6,9,14]
    },
    {name: "Echo"
    },
    {name: "Ballast water",
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
                description: "Ballast water discharge in European seas in 2018. Bar height indicate the magnitude of discharge. Bars are calculated for 0.5×0.5 deg grid cells. [Dataset metadata](https://metadata.helcom.fi/geonetwork/srv/eng/catalog.search#/metadata/df0b81ff-824a-4550-8948-fb71221baacd).",
                attribution: ""
            }
        ],
        shipTypes: {
            tanker: {
                labelPos: new Vector3(16, 11, -86),
                cameraPos: new Vector3(33.56, 12.07, -86.14),
                outletPos: new Vector3(16, 10.65, -86)
            },
            cruise: {
                outletPos: new Vector3(21.7601, 3.64208, -85.8984),
                labelPos: new Vector3(21.7601, 3.64208, -85.8984),
                cameraPos: new Vector3(30, 4, -86)
            },
            container: {
                outletPos: new Vector3(13.479, 14.411, 91.698),
                labelPos: new Vector3(13, 14, 92),
                cameraPos: new Vector3(20, 14, 92)
            }
        }
    },
    {name: "Sewage (black water)"
    },
    {name: "Grey water"
    },
    {name: "Tank cleaning",
        environmentalImpact: "Media coverage: tall oil discharge in Botthnian Sea.",
        // Discharge point/tank
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            }
        }
    },
    {name: "Cooling water",
        description: `
        <p>
            Most vessels are dependent on water for cooling when the propulsion of ship generates excess heat in for example the engines, generators and compressors that must be diverted. Seawater is mostly used as cooling agent, being relatively low-tempered and constantly available.
        </p>
        <p>
            To prevent biological growth in sea chest and piping, most cooling systems are connected to a marine growth protection system, where the most common systems release copper ions as a result of electrolysis.
        </p>
        <p>
            There is limited data on how much copper that is being consumed and discharged to the marine environment, but recent findings suggest that effective dosages need to be 2-3 orders of magnitude higher than manufacturer recommendations. Effective dosages have been reported to be in the range 156-1740 μg L-1, compared to the 2gL-1 recommended by the manufacturers” <a target="_blank" href="https://www.sciencedirect.com/science/article/abs/pii/S0025326X25002462">[1]</a>.
        </p>
        `,
        // Seachest inlet
        shipTypes: {
            tanker: {
                outletPos: new Vector3(16, 4.5, -43.6),
                labelPos: new Vector3(16, 4, -44),
                cameraPos: new Vector3(33.91, 5.82, -41.95)
            },
            cruise: {
                outletPos: new Vector3(21.6058, -1.9977, 31.9649),
                labelPos: new Vector3(22.3, -1.9977, 31.9649),
                cameraPos: new Vector3(30, 2, 32)
            },
            container: {
                outletPos: new Vector3(13.3245, 4.58666, -26.1653),
                labelPos: new Vector3(13.3245, 4.58666, -26.1653),
                cameraPos: new Vector3(15, 7, -26.1653)
            }
        }
    },
    {name: "Scrubber water",
        description: `
        <p>
            Scrubbers are installed on ships to enable the vessel to continue to run on conventional high sulfur fuels while still being compliant to stricter regulations limiting the sulfur oxide content in shipss exhaust. In a scrubber, water is sprayed over the exhaust, reducing the concentration of SOx in the exhaust to compliant levels. The scrubber water is not only taking upp SOx, forming sulfuric acid and becoming highly acidic, but also scavenges other contaminants (e.g. metals and organic substances) that are instead discharged directly to the marine environment.
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
                labelPos: new Vector3(0, 35, -105),
                cameraPos: new Vector3(8.92, 46.55, -129.72)
            },
            cruise: {
                labelPos: new Vector3(0.5, 45, -85),
                cameraPos: new Vector3(45, 45, -85)
            },
            container: {
                labelPos: new Vector3(0.5, 30, -57),
                cameraPos: new Vector3(25, 30, -57)
            }
        },
        sdgIcons: [3,7,9,11,12,13,14]
    },
    {name: "Bilge water",
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
    {name: "Propeller shaft lubricants",
        description: `
        <p>
            The propeller shaft connects the main engine and the propeller through the stern tube. The stern tube goes through the ship hull and contains bearings, sealing and a lubrication system that may leak due to imperfect sealing and/or damage.
        </p>
        `,
        shipTypes: {
            tanker: {
                labelPos: new Vector3(0, 0, -115),
                cameraPos: new Vector3(16.35, 4.74, -144.10),
            },
            cruise: {
                labelPos: new Vector3(5.5, -5.5, -125),
                cameraPos: new Vector3(10, -5, -125),
            },
            container: {
                labelPos: new Vector3(0, 2, -58),
                cameraPos: new Vector3(10, 2, -65),
            }
        },
        mapLayer: "STERN_TUBE"
    },
    {name: "Solid waste (food waste)",
        model: "resources/burger.glb",
        shipTypes: {
            tanker: {
                labelPos: undefined,
                cameraPos: undefined
            },
            cruise: {
                labelPos: new Vector3(20.93, 26.95, -130.49),
                cameraPos: new Vector3(29, 34, -140),
            },
            container: {
                labelPos: undefined,
                cameraPos: undefined
            }
        },
    },
    {name: "Exhaust gas",
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
            tanker: {
                labelPos: new Vector3(0.5, 45, -105),
                cameraPos: new Vector3(35, 45, -105)
            },
            cruise: {
                labelPos: new Vector3(0.5, 65, -85),
                cameraPos: new Vector3(45, 65, -85)
            },
            container: {
                labelPos: new Vector3(0.5, 40, -58),
                cameraPos: new Vector3(25, 40, -58)
            }
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
    {name: "Illumination"
    },
    {name: "Waves and turbulence"
    },
    {name: "Powertrain",
        description: "Burning fuel in engines produce mechnical power but have higher emissions. Fuel cell have lesser emissions and produce electricity through electrochemical reaction of different fuels. Battery-electric uses stored electricity and have zero emission but have limited energy capacity.",
        hideWater: true,
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
                labelPos: new Vector3(0, 5, -27),
                cameraPos: new Vector3(4.5, 9, -30),
            }
        },
        sdgIcons: [7,9,11,13,14,15]
    },
    {name: "Fueltank",
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
        },
        sdgIcons: [7,9,11,13,14,15]
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
            tanker: {
                labelPos: new Vector3(0, 0, -120),
                cameraPos: new Vector3(-13.68, 3.06, -141.22),
            },
            cruise: {
                labelPos: new Vector3(5.5, -5.5, -130),
                cameraPos: new Vector3(10, -5, -140),
            },
            container: {
                labelPos: new Vector3(0, 3, -62),
                cameraPos: new Vector3(10, 2, -65),
            }
        },
        sdgIcons: [14]
    },
    {name: "Container loss",
        model: "resources/lost_container.glb",
        // One of the containers
        shipTypes: {
            container: {
                labelPos: new Vector3(12, 30, 20),
                cameraPos: new Vector3(43, 46, 67),
            }
        }
    },
].map((spec) => new Annotation(spec));


export {annotations};
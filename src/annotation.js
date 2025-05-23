import {Vector3, Raycaster} from "three";

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
        this.DOM = document.createElement("div");
        this.DOM.classList.add("annotation");
        this.DOM.innerHTML = `<p>${spec.name}</p>`;
        document.getElementById("main").appendChild(this.DOM);

        this.DOM.style.setProperty("--content", "\"!\"");

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

        this.onSelect = ()=>{};
    }
    update(canvas, camera, shipModel) {
        if (this.spec.shipTypes === undefined) {
            this.DOM.style.display = "none";
            return;
        }
        const modelSpecs = this.spec.shipTypes[shipModel.name];
        if (modelSpecs === undefined || modelSpecs.labelPos === undefined) {
            this.DOM.style.display = "none";
            return;
        }
        this.DOM.style.display = "block";
        const p = modelSpecs.labelPos.clone().project(camera);

        p.x = Math.round((0.5 + p.x / 2) * (canvas.width / window.devicePixelRatio));
        p.y = Math.round((0.5 - p.y / 2) * (canvas.height / window.devicePixelRatio));

        this.DOM.style.top = `${p.y}px`;
        this.DOM.style.left = `${p.x}px`;

        const raycaster = new Raycaster(
            camera.position,
            modelSpecs.labelPos.clone().sub(camera.position).normalize()
        );

        const closestIntersect = raycaster.intersectObject(shipModel);

        if (closestIntersect.length > 0) {
            const boxDist = closestIntersect[0].point.distanceTo(camera.position);
            const labelDist =  modelSpecs.labelPos.distanceTo(camera.position);
            const spriteBehindObject = labelDist - boxDist > 5;
            this.DOM.style.opacity = spriteBehindObject ? 0.125 : 1;
        }
    }
}

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
                labelPos: new Vector3(12, 19, 90),
                cameraPos: new Vector3(20, 20, 90)
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
                labelPos: new Vector3(0, 5, 99),
                cameraPos: new Vector3(10, 7, 120)
            }
        }
    },
    {
        name: "Antifouling",
        environmentalImpact: "Chemicals and paint particals, inluding (micro)plastic from antifouling coatings: ecotoxicology, health of marine life, Hullcleaning: plus realease of fouling organisms,  plus monetary cost of envionmental impact",
        humanImpact: "antifouling paints: trophic transfere of chemicals, risk for workers (chemical exposure (solvant), risk of accidents) Hullcleaning (without capture) trophic transfere of chemicals, risk for workers (risk of accidents), plus monetary cost of human health impact",
        hazardIcons: [
            "Health hazard",
            "Harmful",
            "Harmful to the environment"
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
        environmentalImpact: "Spread of invasive species, increased emissions to air (and impact on human health, climate change, and euthropication (from NOX) can be monitized), because of higher fuel consumption, drag, friction, and limited manouverability",
        humanImpact: "Increased air emissions",
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
        name: "Ballast water", shipTypes: {
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
                labelPos: undefined,
                cameraPos: undefined
            }
        }
    },
    {
        name: "Scrubber water",
        environmentalImpact: "Marine pollution, air pollution, climate change. Media coverage: Marco Polo.",
        humanImpact: "Respiratory health issues",
        hazardIcons: [
            "Health hazard",
            "Harmful",
            "Harmful to the environment",
            "Corrosive"
        ],
        mapLayer: "SCRUB_W_CLOSED",
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
        name: "Propeller shaft lubricants", shipTypes: {
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
                labelPos: undefined,
                cameraPos: undefined
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
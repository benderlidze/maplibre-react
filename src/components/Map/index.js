import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import CheckBox from '../../components/CheckBox'
import SearchBar from '../../components/SearchBar'
import bbox from "@turf/bbox"
import bboxPolygon from '@turf/bbox-polygon'

import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export default function Maplibre() {

    const [map, setMap] = useState(null);
    const [popup, setPopup] = useState(null);
    const [searchData, setSearchData] = useState(null);
    const mapContainerRef = useRef(null);

    const layers = [
        { name: "ESRI", tiles: "https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=AAPK20bd66aee9bf4140863affb844e89374VE-vBg4JAGSqo9cSQaMaq8GN-DsGjuuO0LLqZ6OfNEWP18Of7XAMGrQT0vHx4U-1" },
        { name: "OSM", tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png" },
        { name: "GOOGLE", tiles: "http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" },
        { name: "None", tiles: "" },
    ]

    const overlayers = [
        { name: "Neighborhood boundaries", id: "menlopark" },
        { name: "Pricing zones", id: "zones" }
    ]

    const zoneColors = [
        "#f04c16",
        "#ffc21a",
        "#87f016",
        "#16f0c8",
        "#1049e6",
        "#8210e6",
        "#67fe71",
        "#e61030",
        "#87f016",
        "#8210e6",
        "#f04c16",
        "#f04c16"
    ]

    useEffect(() => {

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: `https://api.maptiler.com/maps/4967fec1-6b82-4b5c-b7e4-f6442d3ee2ac/style.json?key=GnLd8LrA266SJGFNIxgZ`,
            center: { lng: -122.19960247133037, lat: 37.453611798180944 },
            zoom: 13,
            preserveDrawingBuffer: true
        });
        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.on('load', function () {

            layers.forEach(layer => {

                const { name, tiles } = layer;
                map.addSource(name, {
                    'type': 'raster',
                    'tiles': [tiles],
                    tileSize: 256,
                });
                map.addLayer({
                    'id': name,
                    'type': 'raster',
                    'source': name,
                    'minzoom': 0,
                    'maxzoom': 22,
                    'visibility': 'none'
                });
                map.setLayoutProperty(name, 'visibility', 'none');

            })

            map.addSource('maine', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': []
                    }
                }
            });

            // Add a new layer to visualize the polygon.
            map.addLayer({
                'id': 'maine',
                'type': 'fill',
                'source': 'maine', // reference the data source
                'layout': {},
                'paint': {
                    'fill-color': '#000',
                    'fill-opacity': 0.2
                }
            });

            // Add a black outline around the polygon.
            map.addLayer({
                'id': 'outline',
                'type': 'line',
                'source': 'maine',
                'layout': {},
                'paint': {
                    'line-color': 'gray',
                    'line-width': 1
                }
            });

            map.addSource('menlopark', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                        ]
                    }
                }
            });

            // Add a new layer to visualize the polygon.
            map.addLayer({
                'id': 'menlopark',
                'type': 'fill',
                'source': 'menlopark', // reference the data source
                'layout': {},
                'paint': {
                    'fill-color': '#0080ff',
                    'fill-opacity': 0.2
                }
            });

            // Add a black outline around the polygon.
            map.addLayer({
                'id': 'outlinemenlopark',
                'type': 'line',
                'source': 'menlopark',
                'layout': {},
                'paint': {
                    'line-color': '#000',
                    'line-width': 1
                }
            });

            map.addLayer({
                'id': 'highlighted',
                'type': 'fill',
                'source': 'maine',
                'paint': {
                    'fill-outline-color': '#000',
                    'fill-color': '#000',
                    'fill-opacity': 0.6
                },
                // Display none by adding a filter with an empty string.
                'filter': ['in', 'id', '']
            });

            fetch("/data/atherton.json")
                .then(data => data.json())
                .then(json => {
                    const one = json
                    setSearchData(json)
                    one.features.forEach((j, key) => j.properties.id = key);
                    const FeatureCollection = { type: 'FeatureCollection', features: one }
                    map.getSource("maine").setData(one)
                    //autocomplete(document.getElementById("search"), json);
                });

            fetch("/data/menlopark.json")
                .then(data => data.json())
                .then(json => {
                    const one = json

                    one.features.forEach((j, key) => j.properties.id = key);
                    console.log('one', one);
                    const FeatureCollection = { type: 'FeatureCollection', features: one }
                    map.getSource("menlopark").setData(one)
                });

            for (let i = 1; i <= 12; i++) {


                const zColors = zoneColors[i] ? zoneColors[i] : "red"

                map.addSource(`zones${i}`, {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [
                            ]
                        }
                    }
                });

                // Add a new layer to visualize the polygon.
                map.addLayer({
                    'id': `zones${i}`,
                    'type': 'fill',
                    'source': `zones${i}`, // reference the data source
                    'layout': {},
                    'paint': {
                        'fill-color': zColors,
                        'fill-opacity': 0.2
                    }
                });

                // Add a black outline around the polygon.
                map.addLayer({
                    'id': `outlinezones${i}`,
                    'type': 'line',
                    'source': `zones${i}`,
                    'layout': {},
                    'paint': {
                        'line-color': zColors,
                        'line-width': 1
                    }
                });

                fetch(`/data/zones${i}.json`)
                    .then(data => data.json())
                    .then(json => {
                        const one = json

                        one.features.forEach((j, key) => j.properties.id = key);
                        console.log('one', one);
                        const FeatureCollection = { type: 'FeatureCollection', features: one }
                        map.getSource(`zones${i}`).setData(one)
                    });
            }

            map.on('click', 'maine', (e) => {
                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates[0].slice();

                let text = "";
                let properties = e.features[0].properties;
                if (properties.address) {
                    const address = properties.address;
                    text += `<div><b>Address</b>: ${address}</div>`
                }
                if (properties.shape_area) {
                    const shape_area = numberWithCommas(Math.round(Number(properties.shape_area)));
                    text += `<div><b>SqFt</b>: ${shape_area}</div>`
                }
                if (properties.acres) {
                    const acres = Number(properties.acres).toFixed(1);
                    text += `<div><b>Acres</b>: ${acres}</div>`
                }
                if (properties.price) {
                    const price = numberWithCommas(Math.round(Number(properties.price)));
                    text += `<div><b>Price</b>: $${price}</div>`
                }

                //close all popups
                const popup = document.getElementsByClassName('mapboxgl-popup');
                if (popup.length) {
                    popup[0].remove();
                }

                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(text)
                    .addTo(map);


                map.setFilter('highlighted', ['in', 'id', '']); // Clear all
                map.setFilter('highlighted', ['in', 'id', e.features[0].properties.id]);
            });

            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', 'maine', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'maine', () => {
                map.getCanvas().style.cursor = '';
            });
        });

        setMap(map)

        // Clean up on unmount
        return () => map.remove();
    }, []);

    // const highlightPoly = (id, m) => {
    //     console.log('id', map);
    //     m.setFilter('highlighted', ['in', 'id', '']); // Clear all
    //     m.setFilter('highlighted', ['in', 'id', id]);
    // }

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const changeLayer = layerName => {
        if (layerName) {
            //hide all
            layers.forEach(layer => {
                map.setLayoutProperty(layer.name, 'visibility', 'none');
            });
            //show only selected
            if (layerName === "None") { return }
            map.setLayoutProperty(layerName, 'visibility', 'visible');
        }
    }

    const layersClick = (layer) => {

        const neighborhoodCheck = document.getElementById("menlopark");
        const pricingzonesCheck = document.getElementById("zones");

        console.log('layer', layer);

        if (neighborhoodCheck.checked) {
            map.setLayoutProperty("menlopark", 'visibility', 'visible');
            map.setLayoutProperty("outlinemenlopark", 'visibility', 'visible');
        } else {
            map.setLayoutProperty("menlopark", 'visibility', 'none');
            map.setLayoutProperty("outlinemenlopark", 'visibility', 'none');
        }

        if (pricingzonesCheck.checked) {
            for (let i = 1; i <= 12; i++) {
                map.setLayoutProperty(`zones${i}`, 'visibility', 'visible');
                map.setLayoutProperty(`outlinezones${i}`, 'visibility', 'visible');
            }
        } else {
            for (let i = 1; i <= 12; i++) {
                map.setLayoutProperty(`zones${i}`, 'visibility', 'none');
                map.setLayoutProperty(`outlinezones${i}`, 'visibility', 'none');
            }
        }
    }

    const moveToPoly = (poly) => {

        if (poly) {
            const box = bbox(poly);
            const boxPolygon = bboxPolygon(box);
            map.fitBounds(boxPolygon.bbox, { padding: 250, duration: 0 });

            map.setFilter('highlighted', ['in', 'id', '']); // Clear all
            map.setFilter('highlighted', ['in', 'id', poly.properties.id]);
        }

    }


    return (
        <div>
            <div className='layers'>
                <div>
                    {layers.map((layer, index) => {
                        return <label htmlFor={layer.name} key={index} onClick={() => changeLayer(layer.name)}>
                            <input type="radio" name="layers" id={layer.name} />{layer.name}
                        </label>
                    })}
                </div>
                <div>
                    {overlayers.map((layer, index) => {
                        return <CheckBox data={layer} key={index} click={layersClick} />
                    })}
                </div>
                <div>
                    {searchData && <SearchBar suggestions={searchData} moveToPoly={moveToPoly} />}
                </div>
            </div>
            <div className="map-wrap">
                <div ref={mapContainerRef} className="map" />
            </div>
        </div>
    );
}
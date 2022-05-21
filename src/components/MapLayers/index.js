import React, { useRef, useEffect } from 'react';

export default function MapLayers() {
    return (
        <div >
            {layers.map(layer => {
                return <div></div>
            })}
        </div>
    );
}
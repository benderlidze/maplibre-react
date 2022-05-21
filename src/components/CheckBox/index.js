import React, { useState } from "react";


const CheckBox = ({ data, click }) => {

    const [val, setVal] = useState(true);
    const { name, id } = data

    return (
        <label htmlFor={id}>
            <input type="checkbox" id={id} checked={val} onChange={event => {
                const id = event.target.id
                click(id)
                setVal(!val)
            }} />
            <span>
                {name}
            </span>
        </label>
    );
}

export default CheckBox
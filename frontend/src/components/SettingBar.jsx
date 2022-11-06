import React from 'react';
import "../styles/settingbar.scss";
import toolState from "../store/toolState";

const SettingBar = () => {
    return (
        <div className="setting-bar">
            <label htmlFor="line-width">Толщина линии</label>
            <input className="setting-bar__input" id="line-width" type="number" defaultValue={1} min={1} max={50}
                   onChange={(e) => toolState.setLineWidth(e.target.value)}/>
            <label htmlFor="stroke-color">Цвет обводки</label>
            <input className="setting-bar__input" id="stroke-color" type="color"
                   onChange={(e) => toolState.setStrokeColor(e.target.value)}/>
        </div>
    );
};

export default SettingBar;
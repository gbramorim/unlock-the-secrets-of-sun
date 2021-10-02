import React, { useEffect, useState } from 'react';
import getCurrentDateAndHour from '../utils/getCurrentDateAndHour';

import Home from '../Home/Home';
import './Init.scss';

function Init() {
    const [render, setRender] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setRender(true);
        }, 9000);
        return () => clearTimeout(timer);
    }, []);

    if (render === false) {
        return (
            <>
                <div id="ui">
                    <div className="sun"></div>
                    <div className="sea">
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                    </div>
                </div>
            </>
        )
    } else {
        return <Home />
    }
}

export default Init;
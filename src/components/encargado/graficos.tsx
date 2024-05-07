import React from 'react';
import Grafico1 from './grafico1';
import Grafico2 from './grafico2';



export default function Grafico() {
    return (
        <>
            <div className="flex flex-row justify-around">
                <div><Grafico1 /></div>
                <div><Grafico2 /></div>
            </div>

        </>
    );
}

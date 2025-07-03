// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import React from "react";
import VersionControl from "./VersionControl";
import "./App.css";

const App = ({ addOnUISdk }) => {
    return (
        <div className="app-container">
            <VersionControl addOnUISdk={addOnUISdk} />
        </div>
    );
};

export default App;

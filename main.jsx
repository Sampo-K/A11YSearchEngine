/*
This is an improved version of my previous WCAG search engine.
- React app instead of manual lines of HTML
- Not dependent on WebAIM data
- Can directly link to different WCAG versions and their translations
- Data fetched from a neat JSON file, separate very light Node.js crawler available for creating the file.
- Special thanks to the json-web-crawler and all great React tutorials available online!

TODO:
* EN criteria in a JSON format
* Standalone Node version with a built in crawler
/Sampo
*/

import React, {
  useEffect,
  useState
} from "https://cdn.skypack.dev/react@17.0.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";

function App() {
  //The original JSON data
  const [originalWCAGJSON21, setOriginalWCAGJSON21] = useState(null);
  const [originalWCAGJSON22, setOriginalWCAGJSON22] = useState(null);
  //Lvl filtered data of the original
  const [lvlWCAGJSON, setLvlWCAGJSON] = useState(null);
  // Query filtered data of the lvl filtered data
  const [filteredWCAGJSON, setFilteredWCAGJSON] = useState(null);
  // Amount of results
  const [resultAmount, setResultAmount] = useState(0);
  const [currentVer, setCurrentVer] = useState("21");
  const [currentLvl, setCurrentLvl] = useState("AA");
  const [currentKW, setCurrentKW] = useState("");

  // Fetch JSONS and store to props.
  useEffect(() => {
    loadJSONS();
  }, []);

  // Set the level to AA intially after default WCAG data is available.
  useEffect(() => {
    if (originalWCAGJSON21 != null) {
      selectLvl(currentLvl);
      console.log(">>> Default level initialized to AA");
    }
  }, [originalWCAGJSON21]);

  // Update the view after the lvl JSON changes
  useEffect(() => {
    if (lvlWCAGJSON != null) {
      filterJSON(currentKW);
    }
  }, [lvlWCAGJSON]);

  // Fetch JSON files one by one. Could also be done in parallel?
  const loadJSONS = () => {
    $.getJSON("https://codepen.io/SampoSampoSampo/pen/MWvgQYp.js", (data) => {
      setOriginalWCAGJSON21(data);
      setFilteredWCAGJSON(data);
      console.log(">>> JSON 2.1 loaded!");
    })
      .done(() => {
        $.getJSON(
          "https://codepen.io/SampoSampoSampo/pen/GRvVQov.js",
          (data) => {
            setOriginalWCAGJSON22(data);
            console.log(">>> JSON 2.2 loaded!");
          }
        ).fail((data, status) => {
          console.log("error: " + status);
        });
      })
      .fail((data, status) => {
        console.log("error: " + status);
      });
  };

  // User changes the WCAG version (2.1, 2.2)
  const switchJSON = (ver) => {
    console.log("Switching to " + ver);
    if (ver === "21") {
      selectLvl(currentLvl, "21");
    } else {
      selectLvl(currentLvl, "22");
    }
    setCurrentVer(ver);
  };

  // User changes the WCAG level (A-AAA)
  const selectLvl = (lvl, ver = currentVer) => {
    console.log("Setting level to " + lvl);
    let WCAGJSON;
    if (ver === "21") {
      WCAGJSON = originalWCAGJSON21;
    } else {
      WCAGJSON = originalWCAGJSON22;
    }

    if (WCAGJSON != null) {
      let lvls = [];
      let current = "A";
      lvl.split("").forEach(() => {
        lvls.push("(Taso " + current + ")");
        lvls.push("(Level " + current + ")");
        current += "A";
      });

      // Always filter from the original JSON data
      const filtered = WCAGJSON.filter((element) => {
        const { comfLevels } = element;
        return lvls.includes(comfLevels);
      });
      setLvlWCAGJSON(filtered);
      setFilteredWCAGJSON(filtered);
      setResultAmount(filtered.length);
      setCurrentLvl(lvl);
    } else {
      console.log("Attemting to set a level to an empty JSON");
    }
  };

  /* Filter the JSON corresponding the selected WCAG lvl. */
  const filterJSON = (keyword) => {
    if (keyword != currentKW) {
      setCurrentKW(keyword);
    }
    if (lvlWCAGJSON != null) {
      if (keyword != "") {
        console.log("Filtering with keyword " + keyword);
        // Always filter from the level filtered WCAG data
        const filtered = lvlWCAGJSON.filter((element) => {
          const { successCriterion } = element;
          const { briefDesc } = element;
          if (
            successCriterion.toLowerCase().indexOf(keyword.toLowerCase()) > -1
          ) {
            return true;
          } else if (
            briefDesc.toLowerCase().indexOf(keyword.toLowerCase()) > -1
          ) {
            return true;
          } else {
            return false;
          }
        });
        setFilteredWCAGJSON(filtered);
        setResultAmount(filtered.length);
      } else {
        console.log("Setting filtered == all level data");
        // If the filter keyword is empty, all level filtered data should be visible;
        setFilteredWCAGJSON(lvlWCAGJSON);
        setResultAmount(lvlWCAGJSON.length);
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="row">
          <h1>A11Y Search Engine 2</h1>
        </div>
        <div className="row">
          <Search
            filter={filterJSON}
            selectLvl={selectLvl}
            switchJSON={switchJSON}
          />
        </div>
        <div className="row">
          <p className="result-amount"> {resultAmount} results</p>
        </div>
      </div>
      <div className="row">
        <ResultsTable wcagjson={filteredWCAGJSON} />
      </div>
      <div className="footer">
        <p>Created by Sampo, 2021</p>
      </div>
    </div>
  );
}

/* Search & Filtering functionality */
const Search = (props) => {
  return (
    <div>
      <label>
        {" "}
        Search/filter results{" "}
        <input
          type="text"
          onKeyUp={(e) => {
            props.filter(e.target.value);
          }}
        />
      </label>
      <label class="dropdown">
        Max WCAG level
        <select
          id="wcaglevel"
          onChange={(e) => {
            props.selectLvl(e.target.value);
          }}
        >
          <option>A</option>
          <option selected="selected">AA</option>
          <option>AAA</option>
        </select>
      </label>
      <label class="dropdown">
        WCAG version
        <select
          id="wcagver"
          onChange={(e) => {
            props.switchJSON(e.target.value);
          }}
        >
          <option selected="selected" value="21">
            2.1
          </option>
          <option value="22">2.2</option>
        </select>
      </label>
    </div>
  );
};

const ResultsTable = (props) => {
  const clickRow = (e) => {
    const link = e.target.closest("tr").getElementsByTagName("a")[0];
    if (link != undefined) {
      link.click();
    }
  };

  const generateRows = () => {
    if (props.wcagjson != null) {
      const keys = Object.keys(props.wcagjson);
      return keys.map((key, index) => {
        // "<tr><td><a href="Understanding URL"> Name </a> (Level)</td><td>Description</td></tr>"
        return (
          <tr
            className="dataRow"
            key={key}
            onClick={(e) => {
              clickRow(e);
            }}
          >
            <td className="crit-col">
              <a href={props.wcagjson[key].url} target="_blank">
                {props.wcagjson[key].successCriterion}
              </a>
            </td>
            <td className="lvl-col">
              <span className="comfLevel">
                {props.wcagjson[key].comfLevels}
              </span>
            </td>
            <td className="desc-col">
              <p>{props.wcagjson[key].briefDesc}...</p>
            </td>
          </tr>
        );
      });
    } else {
      // Return this if the JSON data is not available.
      return (
        <tr>
          <td className="crit-col">Fetching Data - Please Wait</td>
          <td className="lvl-col">Fetching Data - Please Wait</td>
          <td className="desc-col">Fetching Data - Please Wait</td>
        </tr>
      );
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Success Criteria</th>
          <th>Level</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>{generateRows(props)}</tbody>
    </table>
  );
};

/* Render main */
ReactDOM.render(<App />, document.getElementById("root"));
/* Render main */

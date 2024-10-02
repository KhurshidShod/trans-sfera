import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Geocoder.module.css";

const Geocoder = ({ setGeocodeCoords, placeHolder, initialLocation }) => {
  const [inputValue, setInputValue] = useState(initialLocation || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGeocodeData = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: searchQuery,
            format: "json",
            countrycodes: "ru",
            addressdetails: 1,
            limit: 30,
          },
        }
      );

      const data = response.data;
      if (data && data.length > 0) {
        const filteredData = data.filter((result) =>
          result.display_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(filteredData);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching geocode data:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const query = event.target.value;
    setInputValue(query);

    if (query.length > 2) {
      fetchGeocodeData(query);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    setGeocodeCoords([parseFloat(lon), parseFloat(lat)]);
    setInputValue(display_name);
    setSuggestions([]);
  };

  useEffect(() => {
    setInputValue(initialLocation || "");
  }, [initialLocation]);

  return (
    <div className={styles.input_wrapper} style={{ position: "relative" }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeHolder}
        className={styles.geocode_input}
      />
      {loading && <div className={styles.loading}>Loading...</div>}

      {suggestions.length > 0 && (
        <ul
          style={{
            border: "1px solid #ccc",
            maxHeight: "150px",
            overflowY: "auto",
            position: "absolute",
            zIndex: 1,
          }}
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                cursor: "pointer",
                padding: "5px",
                backgroundColor: "#fff",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f0f0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff")
              }
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Geocoder;

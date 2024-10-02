import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Geocoder.module.css";

const Geocoder = ({
  setGeocodeCoords,
  setStartingPoint,
  setStartingPointName,
  setDestinationPoint,
  setDestinationPointName,
  placeHolder,
  initialLocation,
}) => {
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
      setLoading(false); // Stop loading
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

  const handleSuggestionClick = (suggestion, isStartingPoint) => {
    const { lat, lon, display_name } = suggestion;
    if (isStartingPoint) {
      setStartingPoint([parseFloat(lon), parseFloat(lat)]);
      setStartingPointName(display_name);
    } else {
      setDestinationPoint([parseFloat(lon), parseFloat(lat)]);
      setDestinationPointName(display_name); // Update destination point name directly
    }
    setSuggestions([]); // Clear suggestions
  };

  useEffect(() => {
    // Set the input value when initialLocation changes
    setInputValue(initialLocation || "");
  }, [initialLocation]);
  const handleBlur = () => {
    setSuggestions([]);
  };
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
      {suggestions.length > 0 ? (
        <ul className={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={styles.suggestion_item}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      ) : !loading && inputValue.length > 2 ? (
        <div className={styles.no_suggestions}>No suggestions found</div>
      ) : null}
    </div>
  );
};

export default Geocoder;

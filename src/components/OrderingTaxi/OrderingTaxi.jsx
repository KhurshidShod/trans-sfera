import { useEffect, useRef, useState } from "react";
import ReactMapGl, {
  GeolocateControl,
  Layer,
  Marker,
  Source,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import Geocoder from "../Geocoder";
import styles from "./OrderingTaxi.module.css";
import { plans } from "../../assets/data/data";

function Mapping() {
  const mapInstanceRef = useRef();
  const [startingPoint, setStartingPoint] = useState([67, 40]);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [coords, setCoords] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [viewState, setViewState] = useState({
    longitude: 67,
    latitude: 40,
    zoom: 10,
  });
  const [tripInfos, setTripInfos] = useState({
    duration: 0,
    distance: 0,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isGeolocated, setIsGeolocated] = useState(false);
  const [startingPointName, setStartingPointName] = useState("");
  const [destinationPointName, setDestinationPointName] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const GeolocateControlRef = useRef();

  const layerStyle = {
    id: "roadLayer",
    type: "line",
    source: "routeSource",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "blue",
      "line-width": 8,
      "line-opacity": 0.5,
    },
  };

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
      },
    ],
  };

  useEffect(() => {
    if (mapLoaded) {
      getRoute();
      if (!isGeolocated) {
        GeolocateControlRef.current?.trigger();
      }
    }
  }, [startingPoint, destinationPoint, mapLoaded]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStartingPoint([longitude, latitude]);
        await reverseGeocode(latitude, longitude, true); // Set starting point
        setIsGeolocated(true);
      },
      (error) => {
        console.error("Error fetching location:", error);
      }
    );
  }, []);

  const reverseGeocode = async (lat, lon, isStartingPoint) => {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat,
            lon,
            format: "json",
          },
        }
      );
      const data = response.data;
      if (data && data.display_name) {
        if (isStartingPoint) {
          setStartingPointName(data.display_name); // Update starting point name
        } else {
          setDestinationPointName(data.display_name); // Update destination point name
        }
      }
    } catch (error) {
      console.error("Error fetching reverse geocode data:", error);
    }
  };

  const getRoute = async () => {
    if (destinationPoint) {
      setLoading(true); // Start loading
      try {
        const res = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startingPoint[0]},${startingPoint[1]};${destinationPoint[0]},${destinationPoint[1]}?steps=true&geometries=geojson&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`
        );
        if (res.data.routes.length > 0) {
          setCoords(res.data.routes[0].geometry.coordinates);
          setTripInfos({
            duration: formatDuration(res.data.routes[0].duration),
            distance: (res.data.routes[0].distance / 1000).toFixed(1),
          });
        } else {
          throw new Error({ msg: "No route found" });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // End loading
      }
    }
  };

  const formatDuration = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    let result = [];
    if (days > 0) {
      result.push(`${days} д`);
    }
    if (hours > 0) {
      result.push(`${hours} ч`);
    }
    if (minutes > 0 || result.length === 0) {
      result.push(`${minutes} м`);
    }

    return result.join(" ");
  };

  const handleMapClick = async (e) => {
    const newEnd = e.lngLat;
    const endPoint = [newEnd.lng, newEnd.lat];
    setDestinationPoint(endPoint);
    await reverseGeocode(newEnd.lat, newEnd.lng, false); // Set destination point
  };

  const handleStartingPointChange = async (newCoords) => {
    setStartingPoint(newCoords);
    await reverseGeocode(newCoords[1], newCoords[0], true); // Set starting point
  };

  return (
    <section>
      <div className="container">
        <div className={styles.map}>
          <ReactMapGl
            className={styles.map_container}
            ref={mapInstanceRef}
            {...viewState}
            onClick={handleMapClick}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/xurshid02/cm1pk3skj00py01qv5be1gh5n"
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
            onLoad={() => setMapLoaded(true)}
            style={{ width: "45%", height: "500px" }}
          >
            {mapLoaded && (
              <Source id="routeSource" type="geojson" data={geojson}>
                <Layer {...layerStyle} />
              </Source>
            )}
            <GeolocateControl
              showAccuracyCircle={false}
              positionOptions={{ enableHighAccuracy: true }}
              ref={GeolocateControlRef}
            />
            <Marker
              onDragEnd={(e) =>
                handleStartingPointChange([e.lngLat.lng, e.lngLat.lat])
              }
              draggable
              longitude={startingPoint[0]}
              latitude={startingPoint[1]}
            />
            <Marker
              onDragEnd={(e) => handleMapClick(e)}
              draggable
              longitude={destinationPoint ? destinationPoint[0] : 0}
              latitude={destinationPoint ? destinationPoint[1] : 0}
              color="red"
            />
          </ReactMapGl>
          {loading && (
            <div className={styles.map_loading}>Загрузка маршрута...</div>
          )}
          <div className={styles.text}>
            <Geocoder
              placeHolder="Откуда"
              setGeocodeCoords={(e) => handleStartingPointChange(e)}
              initialLocation={startingPointName}
            />
            <Geocoder
              placeHolder="Куда"
              setGeocodeCoords={(e) => setDestinationPoint(e)}
              initialLocation={destinationPointName}
            />
            <select onChange={(e) => setSelectedPlan(e.target.value)}>
              <option value="" selected disabled>
                Виберайте тарифу
              </option>
              {plans.map((plan) => (
                <option value={plan.price} key={`${plan.id}-${plan.price}`}>
                  {plan.name} {tripInfos?.distance && `(${plan.price} ₽/km)`}
                </option>
              ))}
            </select>
            <h3>Дата / время</h3>
            <input className={styles.date} type="datetime-local" />
            <h3>Имя</h3>
            <input
              className={styles.name}
              type="text"
              placeholder="Введите ваше имя"
            />
            <div className={styles.trip_infos}>
              <p>
                Расстояние: <span>{tripInfos.duration}</span>
              </p>
              <p>
                Время в пути: <span>{tripInfos.distance} km</span>
              </p>
              {selectedPlan !== 0 && (
                <p>
                  Цена: <span>₽{tripInfos.distance * selectedPlan}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Mapping;

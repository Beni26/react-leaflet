import { Marker, Popup, useMapEvents } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import "leaflet/dist/leaflet.css"; // ضروری برای نمایش درست نقشه
import { useEffect, useState } from "react";
import L from "leaflet";
import { HiLocationMarker } from "react-icons/hi";
import ReactDOMServer from "react-dom/server";
import axios from "axios";

interface Postion {
  lng: number;
  lat: number;
}
interface LocationData {
  lat: number;
  lng: number;
}
const svgString = ReactDOMServer.renderToString(
  <HiLocationMarker className="text-pink-500" size={30} />
);

const markerPositionIcon = L.divIcon({
  className: "custom-icon",
  html: `<div id="custom-marker">${svgString}</div>`, // یک `div` برای رندر آیکون ری‌اکت
  iconSize: [30, 30], // تنظیم اندازه
});

const Home = () => {
  const [userPosition, setUserPosition] = useState<Postion>({
    lng: 48.6706,
    lat: 31.3183,
  });
  const [markerPosition, setMarkerPosition] = useState<Postion | null>();
  const [address, setAddress] = useState("");

  const LocationMarkerPosition = () => {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        const newPosition = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };
        setMarkerPosition(newPosition);
      },
    });
    return null;
  };
  const handleNewUserPosition = () => {
    if (markerPosition) {
      setUserPosition(markerPosition);
      setMarkerPosition(null);
    }
  };
  const getAddress = async ({ lat, lng }: LocationData) => {
    try {
      const { data } =
        await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=fa&extratags=1&namedetails=1&polygon_geojson=1

      );`);
      if (data.address) {
        const address = [
          data.address.country,
          data.address.city,
          data.address.neighbourhood,
          data.address.road,
          data.address.suburb,
        ]
          .filter(Boolean)
          .join(", ");
        return address;
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };
  useEffect(() => {
    getAddress(userPosition).then((response)=>{
      setAddress(response ||  "آدرس نامشخص است")
    });
  }, [userPosition]);
  return (
    <div className=" flex flex-col p-4  space-y-1 justify-center items-center">
      <section className="w-[90%] h-[500px] ">
        <MapContainer
          center={userPosition}
          zoom={13}
          scrollWheelZoom={true}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarkerPosition />
          <Marker position={userPosition}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
          {markerPosition && (
            <Marker position={markerPosition} icon={markerPositionIcon}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          )}
        </MapContainer>
        <button
          className="bg-green-500 text-white w-full hover:bg-green-600 p-2 mt-2"
          onClick={handleNewUserPosition}
        >
          تایید موقعیت کاربری
        </button>
        <p className=" w-full text-right">{address}</p>
      </section>
    </div>
  );
};
export default Home;

import React, { useState, useEffect } from "react";
const API_KEY = "ce04e7c7a028444281ce2a76322f3813";
import { Line } from "react-chartjs-2";
import Chart from 'chart.js/auto';

const Input = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [Data, setData] = useState();
  const [Data2, setData2] = useState();
  const [Data3, setData3] = useState();
  const [precipitation, setPrecipitation] = useState([]);
  const [soilMoisture, setSoilMoisture] = useState([]);
  const [evapoTranspiration, setevapoTranspiration] = useState([]);
  useEffect(() => {
    // Fetching user's location using the window object
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleFetch = async () => {
    const response = await fetch(
      `https://api.weatherbit.io/v2.0/forecast/agweather?lat=${latitude}&lon=${longitude}&key=${API_KEY}`
    );
    const { data } = await response.json();

    const soilMoisture = [];
    const evapoTranspiration = [];
    const precipitation2 = [];

    for (let index = 0; index < data.length; index++) {
      const obj = data[index];
      soilMoisture.push(obj["v_soilm_100_200cm"]);
      evapoTranspiration.push(obj["evapotranspiration"]);
      precipitation2.push(obj["precip"]);
    }
    setPrecipitation(...precipitation2)
    const fieldCapacity = 366.67
    const wiltingPoint = 216.67
    const maxStorage = 50;
    const minStorage = 0.25*50;
    const storage = [];
    storage[0] = maxStorage;
    const irrigationdemand=[];
    irrigationdemand[0] = maxStorage;
    const cropFactor=1.2;
    const avgEvapotranspiration=0;
    for(var i=0;i<=7;i++){
      avgEvapotranspiration+=evapoTranspiration[i];
    }
    avgEvapotranspiration=avgEvapotranspiration/8;
    // const avgEvapotranspiration=
    for(var i=1;i<=7;i++){
      storage[i]=Math.min(maxStorage,storage[i-1]+0.8*precipitation2[i-1]-cropFactor*evapoTranspiration[i-1]);
      if((storage[i]-minStorage)<avgEvapotranspiration){
        irrigationdemand[i]=maxStorage-storage[i];
        storage[i]=maxStorage;
      }
      else{
        irrigationdemand[i]=0;
      }
    }
    console.log(precipitation2);
    console.log(evapoTranspiration);
    console.log(storage);
    console.log(irrigationdemand);
    setData({
      labels: ["Day0", "Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7", "Day8"],
      datasets: [
        {
          label: "storage (mm)",
          data: storage.map((data) => data),
        },
      ],
    })
    setData2({
      labels: ["Day0", "Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7", "Day8"],
      datasets: [
        {
          label: "soil Moisture (mm)",
          data: soilMoisture.map((data) => data),
        },
      ],
    })
    setData3({
      labels: ["Day0", "Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7", "Day8"],
      datasets: [
        {
          label: "evapoTranspiration (mm)",
          data: evapoTranspiration.map((data) => data),
        },
      ],
    })
  };

  return (
    <div className="h-auto mt-12 w-full flex items-center justify-center flex-col">
      <div className="text-green-500 w-full text-2xl">
        <marquee>
          Please allow location access for the application to work
        </marquee>
      </div>

      <div className="h-[60%] text-white w-full items-center justify-center flex flex-col">
        <p className="w-4/5 uppercase text-4xl font-bold text-center mb-12">
          Irrigation Planning
        </p>
        <div className="flex w-4/5 justify-center gap-4  h-[20%]">
          <div className="h-full w-1/3 flex flex-col">
            <label htmlFor="latitudeInput" className="text-lg font-semibold">
              Latitude:
            </label>
            <input
              id="latitudeInput"
              className="border-2 text-black font-bold border-black"
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div className="h-full w-1/3 flex flex-col">
            <label htmlFor="longitudeInput" className="text-lg font-semibold">
              Longitude:
            </label>
            <input
              id="longitudeInput"
              className="border-2 text-black font-bold border-black"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="w-full h-[10vh] text-center">
        <button
          className="text-black font-bold mt-4 trackinwider text-2xl  bg-green-400 p-2 px-8 mb-8 rounded-lg"
          onClick={handleFetch}
        >
          Fetch
        </button>
      </div>
      <table className="table w-4/5 pt-12 pb-12  h-[100vh] text-white text-lg">
        <thead>
          <tr>
            <th>Day</th>
            <th>precipitation (mm)</th>
            <th>soilMoisture (mm)</th>
            <th>evapoTranspiration (mm)</th>
            <th>netIrrigationDemand (mm)</th>
          </tr>
        </thead>
        <tbody>
          {precipitation.length > 0 &&
            precipitation.map((data, i) => {
              return (
                <tr className="text-center" key={i}>
                  <td>Day{i}</td>
                  <td>{precipitation[i]}</td>
                  <td>{soilMoisture[i]}</td>
                  <td>{evapoTranspiration[i]}</td>
                  <td>{netIrrigationDemand[i]}</td>
                </tr>
              );
            })}
          {precipitation.length == 0 && (
            <p className="text-center text-3xl w-[300%] text-green-400 mt-12">
              Click on "Fetch" to Get Data
            </p>
          )}
        </tbody>
      </table>
      {precipitation.length > 0 && (
        <div style={{ width: 700 }} className="bg-white flex flex-col gap-4">
          <Line className="w-1/3" data={Data} />
          <Line className="w-1/3" data={Data2} />
          <Line className="w-1/3" data={Data3} />
        </div>
      )}
    </div>
  );
};

export default Input;

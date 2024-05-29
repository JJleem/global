import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Modal from "react-modal";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useQuery } from "react-query";
import axios from "axios";

interface CountryInfo {
  name: string;
  isoA3: string;
  isoA2: string;
  capitalcity: string;
  regionvalue: string;
  latitude: number;
  longitude: number;
}

const API_KEY = "ZhXNZlDSh6QOjCF62wWeFrqxntclWwaEm5t20TzleKdoHSDJE3zqmhxc";

const fetchCountryPhotos = async (countryName: string) => {
  const response = await axios.get("https://api.pexels.com/v1/search", {
    headers: {
      Authorization: API_KEY,
    },
    params: {
      query: countryName,
      per_page: 16,
    },
  });
  return response.data.photos;
};

const CountryPhotos = ({ countryName }: { countryName: string }) => {
  const { data, error, isLoading } = useQuery(
    ["countryPhotos", countryName],
    () => fetchCountryPhotos(countryName)
  );
  console.log(data);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <PexelContainer>
      {data.map((photo: any) => (
        <Pexel key={photo.id} src={photo.src.small} alt={photo.photographer} />
      ))}
    </PexelContainer>
  );
};

const fetchCountryInfo = async (isoA3: string): Promise<CountryInfo> => {
  const { data } = await axios.get(
    `https://api.worldbank.org/v2/country/${isoA3}?format=json`
  );

  const countryData = data[1][0];

  return {
    name: countryData.name,
    isoA3: countryData.id,
    isoA2: countryData.iso2Code.toLowerCase(),
    capitalcity: countryData.capitalCity,
    regionvalue: countryData.region.value,
    latitude: countryData.latitude,
    longitude: countryData.longitude,
  };
};
const Map = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const { data: countryInfo, isLoading } = useQuery<CountryInfo, Error>(
    ["countryInfo", selectedFeature?.properties?.ISO_A3],
    () => fetchCountryInfo(selectedFeature.properties.ISO_A3),
    {
      enabled: !!selectedFeature,
    }
  );

  useEffect(() => {
    fetch("/countries.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setGeoData(data))
      .catch((error) => console.error("Error fetching geojson:", error));
  }, []);

  const onEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      click: () => {
        setSelectedFeature(feature);
        setModalIsOpen(true);
      },
    });
  };

  return (
    <Container>
      <MapContainerStyle center={[38, 130]} zoom={6}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoData && (
          <GeoJsonStyle data={geoData} onEachFeature={onEachFeature} />
        )}
      </MapContainerStyle>

      {selectedFeature && (
        <Modalstyle
          isOpen={Boolean(selectedFeature)}
          onRequestClose={() => setSelectedFeature(null)}
          contentLabel="Country Info"
        >
          <h2>Country Information</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <ModalContainer>
              <TextInfo>
                <Flag src={`https://flagcdn.com/${countryInfo?.isoA2}.svg`} />
                <TextInner>
                  <p>
                    <strong>Country Name:</strong> {countryInfo?.name}
                  </p>
                  <p>
                    <strong>ISO Code:</strong> {countryInfo?.isoA3}
                  </p>
                  <p>
                    <strong>RegionValue :</strong> {countryInfo?.regionvalue}
                  </p>
                  <p>
                    <strong>Capitalcity:</strong> {countryInfo?.capitalcity}
                  </p>
                  <p>
                    <strong>latitude:</strong> {countryInfo?.latitude}
                    <strong> longitude:</strong> {countryInfo?.longitude}
                  </p>
                </TextInner>
              </TextInfo>
              <CountryPhotos countryName={countryInfo?.name || ""} />
            </ModalContainer>
          )}
          <Btn onClick={() => setSelectedFeature(null)}>Close</Btn>
        </Modalstyle>
      )}
    </Container>
  );
};

export default Map;

const GeoJsonStyle = styled(GeoJSON)`
  z-index: -1;
`;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Modalstyle = styled(Modal)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  font-size: 20px;
`;

const MapContainerStyle = styled(MapContainer)`
  z-index: 0;
  width: 90%;
  height: 90%;
`;
const ModalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px;

  @media ${({ theme }) => theme.lg} {
    flex-direction: column;
  }
`;
const Flag = styled.img`
  width: 70%;
  height: auto;
  object-fit: cover;
  box-shadow: 0px 0px 10px #000;
  @media ${({ theme }) => theme.lg} {
    width: 50%;
  }
  @media ${({ theme }) => theme.xs} {
    width: 100%;
  }
`;

const TextInfo = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 100px;
  @media ${({ theme }) => theme.lg} {
    flex-direction: row;
    gap: 15px;
  }
  @media ${({ theme }) => theme.md} {
    font-size: 16px;
  }
  @media ${({ theme }) => theme.sm} {
    flex-direction: column;
    font-size: 16px;
    gap: 30px;
    padding-top: 10px;
    padding-bottom: 30px;
  }
  @media ${({ theme }) => theme.xs} {
    font-size: 14px;
    padding-bottom: 10px;
    padding-top: 0px;
    gap: 10px;
  }
`;
const TextInner = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
  @media ${({ theme }) => theme.xs} {
    gap: 8px;
  }
`;
const Pexel = styled.img`
  width: 23%;
  height: 23%;
  object-fit: cover;
  border-radius: 10%;
  margin-right: 10px;
  cursor: pointer;
  transition: all 0.5s;

  &:hover {
    transform: scale(1.5);
  }
  @media ${({ theme }) => theme.lg} {
    width: 30%;
    height: 50%;
    &:hover {
      transform: scale(1);
    }
  }
  @media ${({ theme }) => theme.sm} {
    width: 45%;
    height: 50%;
  }
  @media ${({ theme }) => theme.xs} {
    width: 100%;
    height: 170px;
  }
`;
const PexelContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  display: inline-block;
  text-align: center;
  padding-top: 2%;
  @media ${({ theme }) => theme.lg} {
    padding-top: 0%;
    height: 100%;
    overflow: scroll;
    overflow-x: hidden;
  }
  @media ${({ theme }) => theme.xs} {
    width: 100%;
    height: 500px;
  }
`;

const Btn = styled.button`
  width: 100px;
  height: 30px;
  border: none;
  background: #000;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 0px;
  margin-top: 20px;
  @media ${({ theme }) => theme.xs} {
    margin-top: 10px;
  }
`;

import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import { useState } from "react";
import { MapContainer, ImageOverlay, CircleMarker } from "react-leaflet";
import DottedMap from "dotted-map";
import "./App.css";
import { Stack } from "@mui/material";
import { 
  useMemberDashboardWorldReachQuery
} from 'src/redux/splitEndpoints/memberSplit';
import { intToString } from "src/utils/customFunctions";
import { CircularSpinner } from "src/components/CircularSpinner";
import { Box } from "@mui/material";

const map = new DottedMap({ height: 60, grid: "vertical" });

const svgMap = map.getSVG({
  radius: 0.22,
  color: "#B0B6AF",
  shape: "circle",
  backgroundColor: "#fff",
});

const { region } = map.image;

const bounds: [number, number][] = [
  [region.lat.min, region.lng.min],
  [region.lat.max, region.lng.max],
];

const Map = styled(MapContainer)`
  height: 100vh;
  width: 100vw;
`;
const Tooltip = styled.div`
  position: fixed;
  top: 100px;
  left: 100px;
  z-index: 100000;
  color: #161716;  
  font-weight: 350;
  font-size: 14px;
  line-height: 20px;
  border: 1px solid #E2E7E1;
  background: #FFFFFF;
  pointer-events: none;
  padding: 6px 7px 7px 11px;
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
`;

type StallionDashboardProps = {
  fromDate: string;
  toDate: string;
  totalMembers: number;
};

const DottedWorldMemberMap = (props: StallionDashboardProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [displayedColiving, setDisplayedColiving] = useState<any>(null);
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });
  const { fromDate, toDate, totalMembers } = props;
  const isDashboardAPI:boolean = (Number(fromDate) > 0 && Number(toDate) >0) ? true : false;
  // Get MemberDashboardWorldReach api call
  const { data: worldmapAPIData, isFetching: isWRFetching, isLoading: isWRLoading, isSuccess: isWRSuccess  } = useMemberDashboardWorldReachQuery({'fromDate': fromDate, 'toDate': toDate}, { skip: (!isDashboardAPI) });
  
  return (
    <>
    {isWRFetching ? 
      <Box className="dottedmap"><CircularSpinner /></Box>
      :
    (isWRSuccess && <div className="dottedMapmain">
      <Map
      className="dottedMap"
        center={[15, 6.143158]}
        zoom={2}
        maxZoom={6}
        minZoom={2}
        attributionControl={false}
        zoomControl={false}
      >
        <ImageOverlay
            url={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`} 
            bounds={bounds}
        />
        {worldmapAPIData.map((coliving: any) => {
          const isColivingDisplayed =
            coliving === displayedColiving && isTooltipVisible;
          const isAnotherColivingDisplayed =
            !isColivingDisplayed && isTooltipVisible;
          const lat = coliving.latitude;
          const lng = coliving.longitude;
          const pin = map.getPin({ lat, lng });
          let pinRadius = ((coliving?.totalRegistered + coliving?.totalAnonymous) / totalMembers) * 100;
          let radiusSize: number = 0;
          switch(true) {
            case (pinRadius < 25):
              radiusSize = 4;
              break;
            case (pinRadius >= 25 && pinRadius < 50 ):
              radiusSize = 6;
              break; 
            case (pinRadius >= 50 && pinRadius < 75 ):
              radiusSize = 8;
              break; 
            case (pinRadius >= 75):
              radiusSize = 10;
              break;    
          }
          return (
            <CircleMarker
              center={[pin.lat, pin.lng]}
              radius={radiusSize}
              pathOptions={{
                fillColor: isColivingDisplayed ? "#2EFFB4" : "#2EFFB4",
                color: "transparent",
                fillOpacity: isAnotherColivingDisplayed ? 0.6 : 1,
              }}
              key={coliving.VenueName}
              eventHandlers={{
                mouseover: (e: any) => {
                  setTooltipCoords({
                    top: e.originalEvent.clientY,
                    left: e.originalEvent.clientX,
                  });
                  setDisplayedColiving(coliving);
                  setIsTooltipVisible(true);
                },
                mouseout: () => {
                  setIsTooltipVisible(false);
                },
              }}
            />
          );
        })}
      </Map>
      {/* World map tooltip section */}
      <Tooltip   
      className="mapTooltip"     
        style={{
          position: "fixed",
          top: tooltipCoords.top+"px",
          left: (tooltipCoords.left+20)+"px",
          zIndex: 100000,
          color: "#161716",  
          fontWeight: 350,
          fontSize: "14px",
          lineHeight: "20px",
          border: "1px solid #E2E7E1",
          background: "#FFFFFF",
          pointerEvents: "none",
          padding:'0px',
          boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          opacity: (isTooltipVisible) ? 1 : 0,
        }
      }
      >
         {/* World map tooltip data section */}
        <Stack className='Tooltipmapbox'>
          {displayedColiving?.totalSessions > 0 && <span>{displayedColiving?.totalSessions} Sessions</span>}
          {displayedColiving?.totalRegistered > 0 && <span>{displayedColiving?.totalRegistered} Registered Users</span>}
          {displayedColiving?.totalAnonymous > 0 && <span>{displayedColiving?.totalAnonymous} Anonymous Users</span>}
        </Stack>
         {/*End  World map tooltip data section */}
      </Tooltip>
      {/* End of World map tooltip section */}
    </div>
    )}
    </>
  );
};

export default DottedWorldMemberMap;
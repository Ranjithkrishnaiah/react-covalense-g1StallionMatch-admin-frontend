import DottedMap from "dotted-map";

const StallionMap = () => {
  // It’s safe to re-create the map at each render, because of the
  // pre-computation it’s super fast ⚡️
  const map = new DottedMap({ height: 60, grid: "vertical" });

  map.addPin({
    lat: 40.73061,
    lng: -73.935242,
    svgOptions: { color: "#2EFFB4", radius: 0.5 },
  });


  map.addPin({
    lat: 60.73061,
    lng: 50.935242,
    svgOptions: { color: "#2EFFB4", radius: 0.5 },
    data:['Hi']
  });
  // console.log(map.getPoints(),'MM')

  const svgMap = map.getSVG({
    radius: 0.35,
    color: "#D1D5DA",
    shape: "circle",
    backgroundColor: "#FFF"
  });

  return (
    <div className="DottedMapBox">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt=""
      />
    </div>
  );
};

export default StallionMap;
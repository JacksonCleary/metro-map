import { SVGUtil, SVGElementTypes } from "./util/SvgUtil";
import initializePointCollection from "./PointCollection";

const initialize = () => {
  // Get the map div element
  const mapDiv = document.getElementById("map");

  if (mapDiv && mapDiv.offsetWidth) {
    const svgUtil = new SVGUtil({ parentEl: mapDiv });
    const svg = svgUtil.createSvg();
    svgUtil.insertEl(svg, mapDiv);
    initializePointCollection({ svgUtil });
  }
};

export default initialize;

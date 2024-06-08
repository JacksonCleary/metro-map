import { SVGUtil } from "./util/SvgUtil";
import { PointCollection } from "./classes/PointCollection";

interface initializePointCollectionModel {
  svgUtil: SVGUtil;
}

const initializePointCollection = ({
  svgUtil,
}: initializePointCollectionModel) => {
  // initialize point collection
  const pointCollection = new PointCollection({
    svgUtil,
  });

  // set up svg stuff
  const intersectionPointColor = "red";
  const stationPointColor = "cyan";
  const intersectionPointRadius = 7;
  const stationPointRadius = 7;

  // generate starting points
  pointCollection.generatePoints();

  // generate paths
  const paths = pointCollection.generatePaths();
  // trim paths last segment to create intersection points
  pointCollection.trimPaths();
  // round corners of path
  pointCollection.roundCorners();

  // generate stations
  pointCollection.createStations(stationPointRadius);

  // create starting points and paths
  for (const path of paths) {
    if (path.pathData && svgUtil.svgEl) {
      const startingPoints = svgUtil.createCircle(path.startX, path.startY);
      const backgroundPathElements = svgUtil.createPath(
        path.pathData,
        "white",
        10
      );
      const pathElements = svgUtil.createPath(path.pathData);
      // insert background paths
      svgUtil.insertEl(backgroundPathElements, svgUtil.svgEl);
      // insert paths to calculate on
      svgUtil.insertEl(pathElements, svgUtil.svgEl);
      svgUtil.insertEl(startingPoints, svgUtil.svgEl);
    }
  }

  // create intersection poitns from trimmed paths
  for (const intersectionPoint of pointCollection.intersectionPoints) {
    if (svgUtil.svgEl) {
      const intersectionPoints = svgUtil.createCircle(
        intersectionPoint.x,
        intersectionPoint.y,
        intersectionPointColor,
        intersectionPointRadius
      );
      svgUtil.insertEl(intersectionPoints, svgUtil.svgEl);
    }
  }

  // create station points
  for (const station of pointCollection.stationPoints) {
    if (svgUtil.svgEl) {
      const stationPoints = svgUtil.createCircle(
        station.x,
        station.y,
        stationPointColor,
        stationPointRadius
      );
      svgUtil.insertEl(stationPoints, svgUtil.svgEl);
    }
  }
};

export default initializePointCollection;

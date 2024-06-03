import { SVGUtil } from "./util/SvgUtil";
import { PointCollection } from "./classes/PointCollection";

interface initializePointCollectionModel {
  svgUtil: SVGUtil;
}

const initializePointCollection = ({
  svgUtil,
}: initializePointCollectionModel) => {
  const pointCollection = new PointCollection({
    svgUtil,
  });

  pointCollection.generatePoints();

  const paths = pointCollection.generatePaths();

  pointCollection.trimPaths();

  for (const path of paths) {
    const circleElements = svgUtil.createCircle(path.startX, path.startY);

    if (path.pathData && svgUtil.svgEl) {
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
      svgUtil.insertEl(circleElements, svgUtil.svgEl);
    }
  }
};

export default initializePointCollection;

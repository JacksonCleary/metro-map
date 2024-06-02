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

  for (const path of paths) {
    const circleElement = svgUtil.createCircle(path.startX, path.startY);

    if (path.pathData && svgUtil.svgEl) {
      const pathElement = svgUtil.createPath(path.pathData);
      svgUtil.insertEl(pathElement, svgUtil.svgEl);
      svgUtil.insertEl(circleElement, svgUtil.svgEl);
    }
  }
};

export default initializePointCollection;

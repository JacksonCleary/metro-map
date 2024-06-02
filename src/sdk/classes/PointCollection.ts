import { SVGUtil } from "../util/SvgUtil";
import { Point } from "../models/Point";
import { Path } from "../models/Path";
import { PathSegmentModel } from "../models/PathSegment";

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface PointCollectionModel {
  svgUtil: SVGUtil;
}

export class PointCollection {
  numberOfPoints: number;
  radiusFactor: number;
  radius: number;
  angleIncrement: number;
  svgUtil: SVGUtil;
  angleVariation: number;
  points: Point[];
  paths: Path[];

  constructor({ svgUtil }: PointCollectionModel) {
    // Initialize properties from parameters
    this.svgUtil = svgUtil;

    // Set internal properties
    this.numberOfPoints = 6;
    this.radiusFactor = 0.9;
    this.angleIncrement = (2 * Math.PI) / this.numberOfPoints;
    this.angleVariation = 1;
    this.radius = (this.svgUtil.width * this.radiusFactor) / 2;

    this.points = [];
    this.paths = [];
  }

  generatePoints() {
    const centerX = this.svgUtil.centerX;
    const centerY = this.svgUtil.centerY;
    // reset points
    this.points = [];

    for (let i = 0; i < this.numberOfPoints; i++) {
      const angle =
        i * this.angleIncrement +
        Math.random() * this.angleVariation -
        this.angleVariation / 2;
      const distance = this.radius * this.radiusFactor;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      const point = new Point({ x, y });

      this.points.push(point);
    }

    return this.points;
  }

  generatePaths() {
    const centerX = this.svgUtil.centerX;
    const centerY = this.svgUtil.centerY;
    this.paths = [];

    for (const { x, y } of this.points) {
      const distanceToCenter = Math.sqrt(
        (centerX - x) ** 2 + (centerY - y) ** 2
      );
      const pathLength = distanceToCenter * 0.95; // Proportional to the distance from the point to the center
      // console.log("distanceToCenter", distanceToCenter);
      const sideAngle = Math.atan2(centerY - y, centerX - x);
      const pathEndX = centerX + Math.cos(sideAngle) * pathLength;
      const pathEndY = centerY + Math.sin(sideAngle) * pathLength;

      // // testing generation
      // const minStartingSegment = -0.55;
      // const maxStartingSegment = -0.85;
      // const randomStartingSegmentLength =
      //   Math.random() * (maxStartingSegment - minStartingSegment) +
      //   minStartingSegment;
      // const pathStartX =
      //   centerX +
      //   Math.cos(sideAngle) * pathLength * randomStartingSegmentLength;
      // const pathStartY =
      //   centerY +
      //   Math.sin(sideAngle) * pathLength * randomStartingSegmentLength;

      // //
      // const angle = Math.atan2(centerY - y, centerX - x);
      // const degrees = 45;
      // const minNextOneSegment = -0.5;
      // const maxNextOneSegment = -0.5;
      // const randomNextOneSegmentLength =
      //   Math.random() * (maxNextOneSegment - minNextOneSegment) +
      //   minNextOneSegment;
      // const angleInRadians =
      //   (angle + (Math.PI / 180) * degrees) % (2 * Math.PI);
      // const rotatedX =
      //   centerX +
      //   Math.cos(angleInRadians) * pathLength * randomNextOneSegmentLength;
      // const rotatedY =
      //   centerY +
      //   Math.sin(angleInRadians) * pathLength * randomNextOneSegmentLength;

      let pathData = `M${x},${y}`;
      let currentPathSegment: PathSegmentModel;
      const firstPathSegment = this.svgUtil.generatePathSegment({
        x,
        y,
      });
      pathData += firstPathSegment.path;

      currentPathSegment = firstPathSegment;

      for (let i = 0; i < 4; i++) {
        const pathSegment = this.svgUtil.generatePathSegment({
          x: currentPathSegment.x,
          y: currentPathSegment.y,
          lengthModifier: 1,
          degrees: currentPathSegment.degrees
            ? currentPathSegment.degrees + getRandomNumber(35, 45)
            : 0,
        });
        pathData += pathSegment.path;
        currentPathSegment = pathSegment;
      }

      const path = new Path({ startX: x, startY: y });
      path.setEndXEndY({ endX: pathEndX, endY: pathEndY });
      path.setPathData(pathData);

      this.paths.push(path);
    }

    return this.paths;
  }
}

import { SVGUtil } from "../util/SvgUtil";
import { Point } from "../models/Point";
import { Path } from "../models/Path";

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

      const sideAngle = Math.atan2(centerY - y, centerX - x);
      const pathEndX = centerX + Math.cos(sideAngle) * pathLength;
      const pathEndY = centerY + Math.sin(sideAngle) * pathLength;

      const pathData = `M${x},${y} L${pathEndX},${pathEndY}`;

      const path = new Path({ startX: x, startY: y });
      path.setEndXEndY({ endX: pathEndX, endY: pathEndY });
      path.setPathData(pathData);

      this.paths.push(path);
    }

    return this.paths;
  }
}

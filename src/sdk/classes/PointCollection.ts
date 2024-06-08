import { SVGUtil } from "../util/SvgUtil";
import { MathUtil } from "../util/MathUtil";
import { Point } from "../models/Point";
import { Path } from "../models/Path";
import { PathSegmentModel } from "../models/PathSegment";
const { roundCorners } = require("svg-round-corners");
import intersect from "path-intersection";

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
  intersectionPoints: Point[];
  stationPoints: Point[];

  constructor({ svgUtil }: PointCollectionModel) {
    // Initialize properties from parameters
    this.svgUtil = svgUtil;

    // Set internal properties
    this.numberOfPoints = MathUtil.getRandomNumber(6, 8, true);

    this.angleIncrement = (2 * Math.PI) / this.numberOfPoints;
    this.angleVariation = 1;

    // determine radius based on svg dimensions
    const size = this.svgUtil.height;
    this.radiusFactor = 0.9;
    // this.radiusFactor = MathUtil.getRandomDecimal(0.9, 1.05);
    this.radius = (size * this.radiusFactor) / 2;

    this.points = [];
    this.paths = [];
    this.intersectionPoints = [];
    this.stationPoints = [];
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
      const pathLength = distanceToCenter * 0.95;
      const sideAngle = Math.atan2(centerY - y, centerX - x);
      const angles = this.svgUtil.possibleAngles.filter(
        (num) => num !== 90 && num !== -90
      );

      const firstDegree = MathUtil.pickBetween(...angles);
      const angle = Math.atan2(y - centerY, x - centerX);
      const randomSegmentLength = 10;
      const angleInRadians = MathUtil.getAngleInRadians(angle, firstDegree);
      const rotatedX =
        x + Math.cos(angleInRadians) * pathLength * randomSegmentLength;
      const rotatedY =
        y + Math.sin(angleInRadians) * pathLength * randomSegmentLength;

      let pathData = `M${x},${y}`;
      let currentPathSegment: PathSegmentModel;
      const firstPathSegment = this.svgUtil.generatePathSegment({
        startingX: x,
        startingY: y,
        endingX: rotatedX,
        endingY: rotatedY,
        degrees: firstDegree,
        start: true,
      });
      pathData += firstPathSegment.path;

      currentPathSegment = firstPathSegment;

      let previousDegrees = firstDegree;
      for (let i = 0; i < 8; i++) {
        const startingX = currentPathSegment.endingX;
        const startingY = currentPathSegment.endingY;
        const endingX = startingX + Math.cos(sideAngle) * pathLength;
        const endingY = startingY + Math.sin(sideAngle) * pathLength;

        const degrees = MathUtil.pickBetween(
          ...this.svgUtil.possibleAngles.filter(
            (num) => num !== -previousDegrees || num !== previousDegrees
          )
        );

        const pathSegment = this.svgUtil.generatePathSegment({
          startingX,
          startingY,
          endingX,
          endingY,
          degrees: MathUtil.pickBetween(...this.svgUtil.possibleAngles),
        });
        pathData += pathSegment.path;
        currentPathSegment = pathSegment;
        previousDegrees = degrees;
      }

      const path = new Path({ startX: x, startY: y });
      path.setEndXEndY({
        endX: currentPathSegment.endingX,
        endY: currentPathSegment.endingY,
      });
      path.setPathData(pathData);

      this.paths.push(path);
    }

    return this.paths;
  }

  // connecting the last segment of a path with an intersecting path (for stations)
  trimPaths() {
    for (const path of this.paths) {
      const pathData = path.getPathData();
      if (pathData && this.svgUtil.svgEl) {
        const segments = pathData.split("L");
        const secondToLastSegment = segments[segments.length - 2];
        const lastSegment = segments[segments.length - 1];
        const coordinates = secondToLastSegment.split(",");
        const x = coordinates[0].trim().replace("M", "");
        const y = coordinates[1].trim();
        const modifiedSegmentForElementCalc = `M${x},${y} L${secondToLastSegment} L${lastSegment}`;

        let foundIntersection = [];

        const otherPaths = this.paths.filter(
          (p) => p.pathData !== path.pathData
        );

        for (const otherPath of otherPaths) {
          // loop through other paths to check for intersectin of last segment
          const otherPathData = otherPath.getPathData();
          if (otherPathData) {
            /////////
            foundIntersection.push(
              intersect(
                modifiedSegmentForElementCalc,
                // pathData,
                otherPathData
              )
            );
          }
        }

        if (foundIntersection && foundIntersection.length) {
          const pathsWithoutLastSegment = segments.slice(0, -1).join("L");

          for (const intersection of foundIntersection) {
            if (intersection[0]) {
              const point = intersection[0];
              // attach and store new trimmed path
              const newSegment = `L${point.x},${point.y}`;
              path.setPathData(`${pathsWithoutLastSegment} ${newSegment}`);
              path.setEndXEndY({
                endX: point.x,
                endY: point.y,
              });

              // create new intersection point
              const intersectionPoint = new Point({
                x: point.x,
                y: point.y,
              });
              this.intersectionPoints.push(intersectionPoint);
            }
          }
        }
      }
    }

    return this.paths;
  }

  roundCorners() {
    for (const path of this.paths) {
      const roundedCorners = roundCorners(path.pathData, 10, 2);
      path.setPathData(roundedCorners.path);
    }
  }

  createStations(collisionRadius: number) {
    this.stationPoints = [];
    for (const path of this.paths) {
      if (path.pathData && path.endX && path.endY) {
        const pathElement = this.svgUtil.createPath(path.pathData);

        const stations = this.svgUtil.createPointsAlongPath(
          pathElement,
          this.intersectionPoints,
          { x: path.endX, y: path.endY },
          collisionRadius
        );
        this.stationPoints.push(...stations);
        this.stationPoints.push({ x: path.endX, y: path.endY });
      }
    }
  }
}

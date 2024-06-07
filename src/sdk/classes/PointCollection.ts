import { SVGUtil } from "../util/SvgUtil";
import { MathUtil } from "../util/MathUtil";
import { Point } from "../models/Point";
import { Path } from "../models/Path";
import { PathSegmentModel } from "../models/PathSegment";
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
      const pathLength = distanceToCenter * 0.95;
      const sideAngle = Math.atan2(centerY - y, centerX - x);
      const pathEndX = centerX + Math.cos(sideAngle) * pathLength;
      const pathEndY = centerY + Math.sin(sideAngle) * pathLength;
      const degrees = 180;
      const angle = Math.atan2(y - centerY, x - centerX);
      const randomSegmentLength = 10;
      const angleInRadians = MathUtil.getAngleInRadians(angle, degrees);
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
        // degrees: degrees,
        start: true,
        degrees: MathUtil.pickBetween(...this.svgUtil.possibleAngles),
      });
      pathData += firstPathSegment.path;

      currentPathSegment = firstPathSegment;

      const testArr = [
        {
          // angle: MathUtil.pickBetween(-45, 45),
          angle: MathUtil.pickBetween(...this.svgUtil.possibleAngles),
        },
        // {
        //   angle: MathUtil.pickBetween(...this.svgUtil.possibleAngles),
        // },
        // {
        //   angle: MathUtil.pickBetween(...this.svgUtil.possibleAngles),
        // },
        // {
        //   angle: MathUtil.pickBetween(...this.svgUtil.possibleAngles),
        // },
        // {
        //   angle: MathUtil.pickBetween(...this.svgUtil.possibleAngles),
        // },
      ];
      for (let i = 0; i < 6; i++) {
        const currentTest = testArr[i];

        const startingX = currentPathSegment.endingX;
        const startingY = currentPathSegment.endingY;
        const endingX = startingX + Math.cos(sideAngle) * pathLength;
        const endingY = startingY + Math.sin(sideAngle) * pathLength;
        const pathSegment = this.svgUtil.generatePathSegment({
          startingX,
          startingY,
          endingX,
          endingY,
          // degrees: currentTest.angle,
          degrees: MathUtil.pickBetween(...this.svgUtil.possibleAngles),
        });
        pathData += pathSegment.path;
        currentPathSegment = pathSegment;
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
        console.log("foundIntersection", foundIntersection);
        if (foundIntersection && foundIntersection.length) {
          const pathsWithoutLastSegment = segments.slice(0, -1).join("L");

          for (const intersection of foundIntersection) {
            if (intersection[0]) {
              const point = intersection[0];
              const circle = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
              );
              circle.setAttribute("cx", point.x.toString());
              circle.setAttribute("cy", point.y.toString());
              circle.setAttribute("r", "10");
              circle.setAttribute("fill", "red");
              this.svgUtil.insertEl(circle, this.svgUtil.svgEl);

              //////

              const newSegment = `L${point.x},${point.y}`;
              path.setPathData(`${pathsWithoutLastSegment} ${newSegment}`);
              path.setEndXEndY({
                endX: point.x,
                endY: point.y,
              });
            }
          }
        }
      }
    }

    return this.paths;
  }
}

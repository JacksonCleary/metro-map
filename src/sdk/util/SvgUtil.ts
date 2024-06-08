import { PathSegmentModel } from "../models/PathSegment";
import { PointModel } from "../models/Point";
import { MathUtil } from "./MathUtil";
import { Path } from "../models/Path";

export type SVGElementTypes =
  | HTMLElement
  | SVGElement
  | SVGPathElement
  | SVGCircleElement;

export interface SVGUtilModel {
  parentEl: HTMLElement;
}

export class SVGUtil {
  parentEl;
  width: number;
  height: number;
  svgEl: SVGElement | undefined;
  centerX: number;
  centerY: number;
  numberOfPoints: number;
  radius: number;
  possibleAngles: number[];

  constructor({ parentEl }: SVGUtilModel) {
    this.parentEl = parentEl;
    this.numberOfPoints = 10;
    this.width = parentEl.offsetWidth;
    this.height = parentEl.offsetHeight;
    this.centerX = Math.floor(this.width / 2);
    this.centerY = Math.floor(this.height / 2);
    this.radius = 5;
    this.possibleAngles = [180, 135, 90, -90, -135, -180];
  }

  createSvg(): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", this.width.toString());
    svg.setAttribute("height", this.height.toString());
    this.svgEl = svg;
    return svg;
  }

  createCircle(
    x: number,
    y: number,
    fill: string = "black",
    radius = this.radius
  ) {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute("fill", fill);
    circle.setAttribute("r", radius.toString());
    return circle;
  }

  createPath(
    pathData: string,
    color: string = "black",
    strokeWidth: number = 7
  ) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", strokeWidth.toString());
    path.setAttribute("fill", "transparent");
    path.setAttribute("d", pathData);
    return path;
  }

  insertEl<E extends SVGElementTypes, P extends SVGElementTypes>(
    element: E,
    parent: P
  ) {
    if (parent) {
      parent.appendChild(element);
    }
  }

  generatePathSegment({
    startingX,
    startingY,
    endingX,
    endingY,
    degrees = 45,
    start = false,
  }: PathSegmentModel & { start?: boolean }): PathSegmentModel {
    const pathLength = 50; // Proportional to the distance from the point to the center
    const angle = Math.atan2(startingY - endingY, startingX - endingX);

    const minSegment = start ? 1 : 0.25;
    const maxSegment = start ? 2 : 1.5;
    const randomSegmentLength = MathUtil.getRandomNumber(
      minSegment,
      maxSegment
    );
    const angleInRadians = MathUtil.getAngleInRadians(angle, degrees);
    const rotatedX =
      startingX + Math.cos(angleInRadians) * pathLength * randomSegmentLength;
    const rotatedY =
      startingY + Math.sin(angleInRadians) * pathLength * randomSegmentLength;

    const pathData = ` L${rotatedX},${rotatedY}`;

    const pathSegment: PathSegmentModel = {
      startingX: endingX,
      startingY: endingY,
      endingX: rotatedX,
      endingY: rotatedY,
      degrees,
      path: pathData,
    };

    return pathSegment;
  }

  createPointsAlongPath(
    path: SVGPathElement,
    existingPoints: PointModel[],
    pathEnd: PointModel,
    radius: number
  ): PointModel[] {
    const totalLength = path.getTotalLength();
    const points: PointModel[] = [];
    const existingPointsAndEndPoints = [...existingPoints, pathEnd];

    const min = 1;
    const max = 3;

    // create station points
    for (
      let i = 0;
      i < totalLength;
      i += totalLength / Math.floor(Math.random() * (max - min + 1) + min)
    ) {
      const { x, y } = path.getPointAtLength(i);

      // Check if the point overlaps with any of the existing points
      const overlaps = existingPointsAndEndPoints.some(
        (point) =>
          Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2) < radius * 2
      );

      if (!overlaps) {
        points.push({ x, y });
      }
    }

    // remove duplicates
    const uniquePoints = points.filter((point, index) => {
      const isDuplicate =
        points.findIndex((p) => p.x === point.x && p.y === point.y) === index;
      return isDuplicate;
    });

    return uniquePoints;
  }
}

import { PathSegmentModel } from "../models/PathSegment";
import { MathUtil } from "./MathUtil";

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

  createCircle(x: number, y: number) {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute("r", this.radius.toString());
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
}

import { PathSegmentModel } from "../models/PathSegment";

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

  constructor({ parentEl }: SVGUtilModel) {
    this.parentEl = parentEl;
    this.numberOfPoints = 10;
    this.width = parentEl.offsetWidth;
    this.height = parentEl.offsetHeight;
    this.centerX = Math.floor(this.width / 2);
    this.centerY = Math.floor(this.height / 2);
    this.radius = 5;
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

  createPath(pathData: string) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "black");
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
    x,
    y,
    lengthModifier = -0.95,
    degrees = 180,
  }: PathSegmentModel): PathSegmentModel {
    const distanceToCenter = Math.sqrt(
      (this.centerX - x) ** 2 + (this.centerY - y) ** 2
    );
    const pathLength = distanceToCenter * lengthModifier; // Proportional to the distance from the point to the center

    // const sideAngle = Math.atan2(this.centerY - y, this.centerX - x);
    // const pathEndX = this.centerX + Math.cos(sideAngle) * pathLength;
    // const pathEndY = this.centerY + Math.sin(sideAngle) * pathLength;

    // // testing generation
    // const minSegment = -0.55;
    // const maxSegment = -0.85;
    // const randomSegmentLength =
    //   Math.random() * (maxSegment - minSegment) + minSegment;

    const angle = Math.atan2(this.centerY - y, this.centerX - x);
    const minSegment = -0.55;
    const maxSegment = -0.85;
    const randomSegmentLength =
      Math.random() * (maxSegment - minSegment) + minSegment;
    const angleInRadians = (angle + (Math.PI / 180) * degrees) % (2 * Math.PI);
    const rotatedX =
      this.centerX +
      Math.cos(angleInRadians) * pathLength * randomSegmentLength;
    const rotatedY =
      this.centerY +
      Math.sin(angleInRadians) * pathLength * randomSegmentLength;

    //M${x},${y}
    const pathData = ` L${rotatedX},${rotatedY}`;

    const pathSegment: PathSegmentModel = {
      x,
      y,
      lengthModifier,
      degrees,
      path: pathData,
    };

    return pathSegment;
  }
}

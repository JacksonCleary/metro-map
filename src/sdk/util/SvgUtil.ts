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
}

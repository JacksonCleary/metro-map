export interface PointModel {
  x: number;
  y: number;
}

export class Point {
  x: number;
  y: number;

  constructor({ x, y }: PointModel) {
    this.x = x;
    this.y = y;
  }
}

export interface PathModel {
  startX: number;
  startY: number;
}

export class Path {
  startX: number;
  startY: number;
  endX: number | undefined;
  endY: number | undefined;
  pathData: string | undefined;

  constructor({ startX, startY }: PathModel) {
    this.startX = startX;
    this.startY = startY;
  }

  setEndXEndY({ endX, endY }: { endX: number; endY: number }) {
    this.endX = endX;
    this.endY = endY;
  }

  setPathData(pathData: string) {
    this.pathData = pathData;
  }
}

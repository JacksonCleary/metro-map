export class MathUtil {
  static getRandomNumber(min: number, max: number, floor: boolean = false) {
    min = Math.ceil(min);
    max = Math.floor(max);
    const rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return floor ? Math.floor(rand) : rand;
  }

  static getRandomDecimal(min: number, max: number) {
    min = Math.min(min, max);
    max = Math.max(min, max);
    const rand = min + Math.random() * (max - min);
    return rand;
  }

  static pickBetween(...args: number[]): number {
    const randomIndex = Math.floor(Math.random() * args.length);
    return args[randomIndex];
  }

  static getDistanceBetweenCoordinates(
    startingX: number,
    startingY: number,
    endingX: number,
    endingY: number
  ) {
    return Math.sqrt((startingX - endingX) ** 2 + (startingY - endingY) ** 2);
  }

  static calculateAngle(x: number, y: number) {
    return Math.atan2(y, x);
  }

  static getAngleInRadians(angle: number, degrees: number) {
    return (angle + (Math.PI / 180) * degrees) % (2 * Math.PI);
  }

  static calculateCircleLength(
    radius: number,
    centerX: number,
    centerY: number
  ) {
    // Calculate the distance from the center to the point on the circumference
    const distance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));

    // Calculate the length of the arc
    const arcLength = radius * Math.acos((distance - radius) / distance);

    // Return the length of the circle when flattened
    return 2 * arcLength;
  }
}

/**
 * 旋转矩阵转换
 */

/**
 * 将旋转角度转换为矩阵
 * @param {number} rotation - 旋转角度（度数）
 * @returns {number[]} 矩阵数组
 */
export function convertRotationToMatrix(rotation) {
  const rad = (rotation * Math.PI) / 180;
  return [Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)];
}

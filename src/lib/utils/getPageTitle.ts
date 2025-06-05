export function getPageTitle(bodyPartName: string, bodyPartId: number): string {
  return bodyPartName ? `Muscle Tests for ${bodyPartName}` : `Muscle Tests for Body Part ${bodyPartId}`;
}

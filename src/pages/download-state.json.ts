import { downloadState } from '../data/downloads';

export function GET() {
  return Response.json({ state: downloadState });
}

import { signedPluginDirectory } from '@/lib/signed-plugin-directory';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(signedPluginDirectory());
}

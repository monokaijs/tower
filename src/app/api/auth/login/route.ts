import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { authService } from '@/lib/services/auth';
import { loginSchema } from '@/lib/validations/auth';
import { ApiError } from '@/lib/types/errors/api.error';

export const POST = withApi(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate the request body against the schema
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  // Authenticate the user
  const user = await authService.authenticate(result.data);
  
  // Generate token and set cookie
  return authService.login(user, result.data.issuer);
}, {
  preventDb: false,
  protected: false,
});

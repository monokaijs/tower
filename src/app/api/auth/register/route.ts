import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { authService } from '@/lib/services/auth';
import { registrationFormSchema } from '@/lib/validations/auth';
import { ApiError } from '@/lib/types/errors/api.error';

export const POST = withApi(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate the request body against the schema
  const result = registrationFormSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  // Register the user
  const user = await authService.register(result.data);
  
  return {
    data: user,
    message: 'Registration successful',
  };
}, {
  preventDb: false,
  protected: false,
});

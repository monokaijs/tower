import {NextRequest, NextResponse} from 'next/server';
import {dbService} from '@/lib/db/service';
import {UserRole} from '@/lib/types/models/user';
import {decode, JWT} from 'next-auth/jwt';
import {cookies} from 'next/headers';

interface WithApiOptions {
  preventDb?: boolean;
  roles?: UserRole[];
  protected?: boolean;
}

export function withApi<T>(
  handler: (request: NextRequest, context: any, decoded?: JWT) => Promise<T> | T,
  options: WithApiOptions = {},
) {
  return async function wrappedHandler(request: NextRequest, context: any): Promise<Response> {
    const {roles = [], preventDb = false, protected: isProtected = false} = options;
    let decoded: JWT | undefined, token: string | undefined;
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.headers.get('Cookie')?.match(/next-auth\.session-token=([^;]+)/)?.[1];

    if (!preventDb) await dbService.connect();

    if (authHeader || cookieToken) {
      token = authHeader?.split('Bearer ')[1] || cookieToken;
      try {
        decoded = await decode({
          token,
          secret: process.env.NEXTAUTH_SECRET!,
        }) ?? undefined;
      } catch (error: any) {
        // Handle JWE decryption failure by clearing the token
        if (error.code === 'ERR_JWE_DECRYPTION_FAILED') {
          // Create a response that will clear the auth cookie
          const response = NextResponse.json(
            {data: null, code: 401, message: 'Session expired. Please log in again.'},
            {status: 401}
          );

          // Clear the auth cookie
          response.cookies.set('next-auth.session-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 0, // Expire immediately
          });

          return response;
        }

        // For other token errors, continue with decoded as undefined
        decoded = undefined;
      }
    }

    try {
      if (isProtected) {
        if (!decoded) {
          return NextResponse.json(
            {data: null, code: 401, message: 'Please sign in'},
            {status: 401},
          );
        }

        if (roles.length > 0 && !roles.includes(decoded.role as UserRole)) {
          return NextResponse.json(
            {data: null, code: 403, message: 'You are not permitted to access this resource.'},
            {status: 403},
          );
        }
      }

      const result: any = await handler(request, context, decoded);

      if (result instanceof NextResponse) {
        return result;
      } else {
        if (result?.pagination) {
          result.pagination = {
            ...result.pagination,
            docs: undefined,
          };
        }
        let message = "OK";
        let data = result?.data ?? result;
        let pagination = result?.pagination ?? undefined;
        if (data?.message) {
          message = data?.message;
          delete data?.message;
        }
        return NextResponse.json({
          data,
          pagination,
          code: 200,
          message,
        }, {status: 200});
      }
    } catch (error: any) {
      console.log('error', error);
      const statusCode = error.code ?? error.statusCode ?? 500;
      return NextResponse.json(
        {data: null, code: statusCode, message: error.message || 'Internal Server Error'},
        {status: statusCode},
      );
    }
  };
}

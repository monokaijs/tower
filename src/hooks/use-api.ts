import { useState, useCallback } from 'react';
import {AxiosError} from 'axios';
import {ApiResponse} from "@/lib/types/common/api";


function useApi<TArgs extends unknown[], TData>(
  apiMethod: (...args: TArgs) => Promise<ApiResponse<TData>>,
  defaultData?: TData,
): [
  (...args: TArgs) => Promise<ApiResponse<TData>>,
  {
    loading: boolean;
    data: TData | undefined;
    message: string | undefined;
    statusCode: number | undefined;
    error: Error | undefined;
  }
] {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TData | undefined>(defaultData);
  const [message, setMessage] = useState<string | undefined>();
  const [statusCode, setStatusCode] = useState<number | undefined>();
  const [error, setError] = useState<Error | undefined>();

  const doRequest = useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError(undefined);
    try {
      const response = await apiMethod(...args);
      setData(response.data);
      setMessage(response.message);
      setStatusCode(response.code);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        if (err instanceof AxiosError) {
          const {message} = err.response?.data ?? {
            message: 'Unknown error'
          };
          const newError: any = new Error(message);
          newError.status = err.response?.status;
          throw newError;
        }
      } else {
        setError(err as any);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiMethod]);

  return [doRequest, { loading, data, message, statusCode, error }];
}

export default useApi;

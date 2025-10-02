export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

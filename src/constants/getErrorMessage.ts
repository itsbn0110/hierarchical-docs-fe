import { ErrorMessages } from "./messages";

type ErrorResponse = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};

export function getErrorMessage(error: unknown): string {
  // Nếu BE trả về error dạng { message: 'USERNAME_AREADY_EXISTS' }
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as ErrorResponse).response?.data?.message === "string" &&
    ErrorMessages[
      (error as ErrorResponse).response!.data!
        .message as keyof typeof ErrorMessages
    ]
  ) {
    return ErrorMessages[
      (error as ErrorResponse).response!.data!
        .message as keyof typeof ErrorMessages
    ];
  }
  // Nếu BE trả về error dạng { error: 'USERNAME_AREADY_EXISTS' }
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as ErrorResponse).response?.data?.error === "string" &&
    ErrorMessages[
      (error as ErrorResponse).response!.data!
        .error as keyof typeof ErrorMessages
    ]
  ) {
    return ErrorMessages[
      (error as ErrorResponse).response!.data!
        .error as keyof typeof ErrorMessages
    ];
  }
  // Nếu BE trả về error dạng string
  if (
    typeof error === "string" &&
    ErrorMessages[error as keyof typeof ErrorMessages]
  ) {
    return ErrorMessages[error as keyof typeof ErrorMessages];
  }
  // Nếu không map được thì trả về lỗi mặc định
  return ErrorMessages.INTERNAL_SERVER_ERROR;
}

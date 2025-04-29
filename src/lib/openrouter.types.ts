/**
 * Custom error classes for specific error scenarios
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends Error {
  errors: { message: string; [key: string]: unknown }[];

  constructor(errors: { message: string; [key: string]: unknown }[]) {
    super(`Validation failed: ${JSON.stringify(errors)}`);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(`API Error ${statusCode}: ${message}`);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export class UnexpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnexpectedError";
  }
}

/**
 * Chat message interface for OpenRouter API
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Response format schema interface for structured JSON responses
 */
export interface ResponseFormatSchema {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

/**
 * OpenRouter service configuration options
 */
export interface OpenRouterServiceOptions {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

/**
 * Chat method override options
 */
export interface ChatOptions {
  modelName?: string;
  modelParams?: Record<string, unknown>;
  responseFormat?: ResponseFormatSchema;
}

/**
 * OpenRouter API response structure
 */
export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

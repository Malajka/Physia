import {
  ApiError,
  AuthenticationError,
  ConfigurationError,
  NetworkError,
  RateLimitError,
  UnexpectedError,
  ValidationError,
} from "./openrouter.types";

import type { ChatMessage, ChatOptions, OpenRouterResponse, OpenRouterServiceOptions, ResponseFormatSchema } from "./openrouter.types";

/**
 * A simple logger interface that avoids logging sensitive data
 */
interface Logger {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
}

/**
 * A basic logger implementation that can be replaced with a more robust solution
 */
class SafeLogger implements Logger {
  private readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log("DEBUG", message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log("INFO", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log("WARN", message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log("ERROR", message, metadata);
  }

  private log(level: string, message: string, metadata?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const safeMetadata = metadata ? this.sanitizeMetadata(metadata) : undefined;

    // For production, replace this with your preferred logging system
    if (process.env.NODE_ENV !== "production") {
      console.log(`[${timestamp}] [${level}] [${this.serviceName}] ${message}`, safeMetadata ? JSON.stringify(safeMetadata) : "");
    }
  }

  /**
   * Sanitizes metadata to remove or mask sensitive information before logging
   * @param metadata The metadata to sanitize
   * @returns Sanitized version of the metadata safe for logging
   */
  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Check if the key matches any sensitive patterns
      if (this.isSensitiveKey(key)) {
        // Mask the value with asterisks showing only type and length hint
        result[key] = this.maskValue(value);
      } else if (value !== null && typeof value === "object") {
        // Recursively sanitize nested objects
        if (Array.isArray(value)) {
          // For arrays, sanitize each item
          result[key] = value.map((item) =>
            typeof item === "object" && item !== null
              ? this.sanitizeMetadata(item as Record<string, unknown>)
              : this.isSensitiveValue(item)
                ? this.maskValue(item)
                : item
          );
        } else {
          // For objects, recursively sanitize
          result[key] = this.sanitizeMetadata(value as Record<string, unknown>);
        }
      } else {
        // Regular non-sensitive value
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Checks if a key name suggests it contains sensitive information
   */
  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();

    // List of patterns indicating sensitive data
    const sensitivePatterns = [
      "api_key",
      "apikey",
      "api-key",
      "token",
      "bearer",
      "access_token",
      "refresh_token",
      "password",
      "pwd",
      "pass",
      "secret",
      "credential",
      "authorization",
      "auth",
      "key",
    ];

    return sensitivePatterns.some((pattern) => lowerKey.includes(pattern));
  }

  /**
   * Checks if a value might be sensitive by inspecting its format
   */
  private isSensitiveValue(value: unknown): boolean {
    // Additional patterns that might indicate sensitive data
    // For example, strings that look like tokens or keys
    if (typeof value === "string") {
      // Check for JWT token pattern
      if (/^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(value)) {
        return true;
      }

      // Check for API key/token like patterns (long random strings)
      if (/^[a-zA-Z0-9_.-]{20,}$/.test(value)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Masks a sensitive value for logging
   */
  private maskValue(value: unknown): string {
    if (value === undefined) return "[undefined]";
    if (value === null) return "[null]";

    const type = typeof value;

    if (type === "string") {
      const str = value as string;
      const length = str.length;

      if (length <= 4) {
        return "****";
      }

      // Show masked version of length
      return `${str.substring(0, 2)}${"*".repeat(Math.min(8, length - 4))}${str.substring(length - 2)} [masked, length: ${length}]`;
    }

    if (type === "number" || type === "boolean") {
      return `[masked ${type}]`;
    }

    return `[masked ${type}]`;
  }
}

/**
 * Service for interacting with OpenRouter LLM API
 *
 * This service handles:
 * 1. Communication with OpenRouter API
 * 2. Structured requests with system and user messages
 * 3. JSON schema validation of responses
 * 4. Error handling for network and API issues
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly logger: Logger;

  /**
   * Creates an instance of OpenRouterService.
   * @param options Configuration options
   */
  constructor(options: OpenRouterServiceOptions) {
    if (!options.apiKey) {
      throw new ConfigurationError("OpenRouter API key is required");
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
    this.defaultModel = options.defaultModel ?? "gpt-3.5-turbo";
    this.logger = new SafeLogger("OpenRouterService");
  }

  /**
   * Sends a chat request to OpenRouter and returns the parsed JSON response.
   * @param messages Array of chat messages
   * @param overrides Optional overrides for model, parameters, and response format
   * @returns Parsed response from the LLM
   */
  public async chat<T = unknown>(messages: ChatMessage[], overrides?: ChatOptions): Promise<T> {
    if (!messages || messages.length === 0) {
      throw new ValidationError([{ message: "At least one message is required" }]);
    }

    const model = overrides?.modelName ?? this.defaultModel;
    const params = overrides?.modelParams ?? {};
    const format = overrides?.responseFormat;

    // Validate model parameters if provided
    if (params.temperature !== undefined) {
      const temp = Number(params.temperature);
      if (isNaN(temp) || temp < 0 || temp > 1) {
        throw new ValidationError([{ message: "Temperature must be between 0 and 1" }]);
      }
    }

    if (params.max_tokens !== undefined) {
      const maxTokens = Number(params.max_tokens);
      if (isNaN(maxTokens) || maxTokens <= 0) {
        throw new ValidationError([{ message: "max_tokens must be a positive number" }]);
      }
    }

    try {
      // Log the chat request (sanitized)
      this.logger.info(`Sending chat request to model: ${model}`, {
        modelName: model,
        messagesCount: messages.length,
        hasSystemMessage: messages.some((m) => m.role === "system"),
        modelParams: params,
        responseFormat: format ? { type: format.type, schemaName: format.json_schema.name } : undefined,
      });

      const payload = this.buildPayload(messages, model, params, format);
      const rawResponse = await this.sendRequest(payload);

      // Log successful response (sanitized)
      this.logger.debug(`Received response from OpenRouter`, {
        model: rawResponse.model,
        tokenUsage: rawResponse.usage,
        completionLength: rawResponse.choices?.[0]?.message?.content?.length || 0,
      });

      return this.parseResponse<T>(rawResponse, format?.json_schema?.schema);
    } catch (error) {
      // Log error (sanitized)
      this.logger.error(`Error in chat request: ${error instanceof Error ? error.message : String(error)}`, {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        modelName: model,
      });

      if (
        error instanceof NetworkError ||
        error instanceof RateLimitError ||
        error instanceof AuthenticationError ||
        error instanceof ValidationError ||
        error instanceof ApiError
      ) {
        throw error;
      }

      throw new UnexpectedError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Builds the request payload for OpenRouter API
   */
  private buildPayload(
    messages: ChatMessage[],
    modelName: string,
    modelParams: Record<string, unknown>,
    responseFormat?: ResponseFormatSchema
  ): Record<string, unknown> {
    return {
      model: modelName,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      parameters: modelParams,
      ...(responseFormat && { response_format: responseFormat }),
    };
  }

  /**
   * Sends HTTP request to OpenRouter API using native fetch
   */
  private async sendRequest(payload: Record<string, unknown>): Promise<OpenRouterResponse> {
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      // Clear timeout
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const statusCode = response.status;
        const statusText = response.statusText;

        // Log error response (sanitized)
        this.logger.error(`API error response: ${statusCode} ${statusText}`, {
          status: statusCode,
          statusText,
        });

        if (statusCode === 401 || statusCode === 403) {
          throw new AuthenticationError(`Authentication failed: ${statusText}`);
        } else if (statusCode === 429) {
          throw new RateLimitError("Rate limit exceeded");
        } else {
          throw new ApiError(statusCode, statusText);
        }
      }

      // Parse JSON response
      const data = (await response.json()) as OpenRouterResponse;
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle AbortController timeout
      if (error instanceof DOMException && error.name === "AbortError") {
        this.logger.error("Request timed out after 60 seconds");
        throw new NetworkError("Request timed out after 60 seconds");
      }

      // Handle fetch errors
      if (error instanceof TypeError) {
        this.logger.error(`Network error: ${error.message}`);
        throw new NetworkError(`Network error: ${error.message}`);
      }

      // Re-throw our custom errors
      if (error instanceof AuthenticationError || error instanceof RateLimitError || error instanceof ApiError) {
        throw error;
      }

      // Unknown errors
      this.logger.error(`Unexpected request error`);
      throw new UnexpectedError(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parses and validates the response against the schema if provided
   *
   * Note: Previously this used Ajv (Another JSON Schema Validator) library
   * for schema validation, but we've simplified it here with basic validation
   * since we don't need the full capabilities of JSON Schema validation.
   *
   * If strict schema validation is needed in the future, Ajv could be added back.
   */
  private parseResponse<T>(response: OpenRouterResponse, schema?: Record<string, unknown>): T {
    // Extract content from the response
    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      this.logger.error("Empty response content from API");
      throw new ValidationError([{ message: "Empty response content from API" }]);
    }

    try {
      // Parse content if it's a string (could be JSON string from LLM)
      const parsedData = typeof content === "string" ? JSON.parse(content) : content;

      // If schema is provided, perform basic validation
      if (schema && typeof schema === "object") {
        this.validateAgainstSchema(parsedData, schema);
      }

      return parsedData as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Log parse error
        this.logger.error("Invalid JSON response", {
          errorType: "SyntaxError",
          contentLength: typeof content === "string" ? content.length : 0,
        });

        // If not valid JSON and schema expected, throw error
        if (schema) {
          throw new ValidationError([{ message: "Invalid JSON response" }]);
        }
        // Otherwise return raw string
        return content as unknown as T;
      }

      // Re-throw validation errors
      if (error instanceof ValidationError) {
        throw error;
      }

      this.logger.error(`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`);
      throw new UnexpectedError(`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Basic schema validation helper
   * This is a simplified validation - not as robust as Ajv but sufficient for basic checks
   */
  private validateAgainstSchema(data: unknown, schema: Record<string, unknown>): void {
    const errors: { message: string; path?: string }[] = [];

    // Very basic type checking for required properties
    if (schema.type === "object" && schema.properties && typeof schema.properties === "object") {
      const properties = schema.properties as Record<string, Record<string, unknown>>;
      const required = Array.isArray(schema.required) ? schema.required : [];

      // Check if data is an object
      if (!data || typeof data !== "object") {
        this.logger.error(`Schema validation error: Expected an object`, {
          receivedType: typeof data,
        });
        throw new ValidationError([{ message: `Expected an object but got ${typeof data}` }]);
      }

      // Check required properties
      for (const key of required) {
        if (!(key in (data as Record<string, unknown>))) {
          errors.push({ message: `Missing required property: ${key}`, path: key });
        }
      }

      // Check if properties match expected types (very basic check)
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const propSchema = properties[key];
        if (propSchema && propSchema.type) {
          // Basic type checking
          if ((propSchema.type === "array" && !Array.isArray(value)) || (propSchema.type !== "array" && typeof value !== propSchema.type)) {
            errors.push({
              message: `Property ${key} has incorrect type. Expected ${propSchema.type}`,
              path: key,
            });
          }
        }
      }
    }

    if (errors.length > 0) {
      this.logger.error("Schema validation errors", { errors });
      throw new ValidationError(errors);
    }
  }
}

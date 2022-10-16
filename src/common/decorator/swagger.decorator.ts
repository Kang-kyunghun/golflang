import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function SwaggerDefault(
  summary: string,
  outputType?: Type<unknown> | Function | [Function] | string,
  description?: string,
  error?: string,
  isArray?: boolean,
) {
  return applyDecorators(
    ApiOkResponse({ description: 'ok', type: outputType, isArray }),
    ApiOperation({ summary, description: description || summary }),
    ApiBadRequestResponse({ description: error }),
  );
}

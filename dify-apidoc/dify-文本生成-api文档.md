# 发送消息

> 发送请求给文本生成型应用。

## OpenAPI

````yaml zh-hans/openapi_completion.json post /completion-messages
paths:
  path: /completion-messages
  method: post
  servers:
    - url: '{api_base_url}'
      description: API 的基础 URL。请将 {api_base_url} 替换为您的应用提供的实际 API 基础 URL。
      variables:
        api_base_url:
          type: string
          description: 实际的 API 基础 URL
          default: https://api.dify.ai/v1
  request:
    security:
      - title: ApiKeyAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                API-Key 鉴权。所有 API 请求都应在 `Authorization` HTTP Header 中包含您的
                API-Key，格式为 `Bearer {API_KEY}`。**强烈建议开发者把 API-Key
                放在后端存储，而非分享或者放在客户端存储，以免 API-Key 泄露，导致财产损失。**
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              inputs:
                allOf:
                  - type: object
                    description: >-
                      （选填）允许传入 App 定义的各变量值。inputs
                      参数包含了多组键值对，每组的键对应一个特定变量，值则是该变量的具体值。文本生成型应用要求至少传入一组键值对。
                    required:
                      - query
                    properties:
                      query:
                        type: string
                        description: 用户输入的文本内容。
                    additionalProperties: true
              response_mode:
                allOf:
                  - type: string
                    enum:
                      - streaming
                      - blocking
                    description: >-
                      响应返回模式。`streaming`：流式模式（推荐），基于 SSE
                      实现打字机输出。`blocking`：阻塞模式，等待执行完毕后返回（长流程可能中断）。Cloudflare 限制为
                      100 秒超时。
              user:
                allOf:
                  - type: string
                    description: 用户标识，用于定义终端用户的身份，方便检索、统计。由开发者定义规则，需保证用户标识在应用内唯一。
              files:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/InputFileObject'
                    description: 上传的文件列表（目前仅支持图片）。
            required: true
            refIdentifier: '#/components/schemas/CompletionRequest'
            requiredProperties:
              - inputs
              - response_mode
              - user
        examples:
          streaming_example:
            summary: 流式模式示例
            value:
              inputs:
                query: 你好，世界！
              response_mode: streaming
              user: abc-123
        description: 创建完成消息的请求体。
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              message_id:
                allOf:
                  - type: string
                    format: uuid
                    description: 消息唯一 ID。
              mode:
                allOf:
                  - type: string
                    description: App 模式，固定为 `chat`。
                    example: chat
              answer:
                allOf:
                  - type: string
                    description: 完整回复内容。
              metadata:
                allOf:
                  - $ref: '#/components/schemas/ResponseMetadata'
              created_at:
                allOf:
                  - type: integer
                    format: int64
                    description: 消息创建时间戳，如：1705395332。
            description: 阻塞模式下的完整 App 结果。
            refIdentifier: '#/components/schemas/ChatCompletionResponse'
        examples:
          blockingResponse:
            summary: 阻塞模式响应示例
            value:
              id: 0b089b9a-24d9-48cc-94f8-762677276261
              message_id: 0b089b9a-24d9-48cc-94f8-762677276261
              mode: chat
              answer: how are you?
              metadata: {}
              created_at: 1679586667
        description: >-
          成功响应。内容类型和结构取决于请求中的 `response_mode` 参数。

          - 若 `response_mode` 为 `blocking`，返回 `application/json` 及
          `ChatCompletionResponse` 对象。

          - 若 `response_mode` 为 `streaming`，返回 `text/event-stream` 及
          `ChunkChatCompletionResponse` 流式序列。
      text/event-stream:
        schemaArray:
          - type: string
            description: >-
              服务器发送事件 (SSE) 流。每个事件都是以 'data: ' 开头，以 '\n\n' 结尾的 JSON 对象。详见
              `ChunkEvent` 的可能结构。
        examples:
          streamingResponse:
            summary: 流式模式响应示例
            value: >+
              data: {"event": "message", "task_id":
              "900bbd43-dc0b-4383-a372-aa6e6c414227", "id":
              "663c5084-a254-4040-8ad3-51f2a3c1a77c", "message_id":
              "663c5084-a254-4040-8ad3-51f2a3c1a77c", "answer": "Hi",
              "created_at": 1705398420}


              data: {"event": "tts_message", "task_id":
              "3bf8a0bb-e73b-4690-9e66-4e429bad8ee7", "message_id":
              "a8bdc41c-13b2-4c18-bfd9-054b9803038c", "audio":
              "base64encodedaudio...", "created_at": 1721205487}

        description: >-
          成功响应。内容类型和结构取决于请求中的 `response_mode` 参数。

          - 若 `response_mode` 为 `blocking`，返回 `application/json` 及
          `ChatCompletionResponse` 对象。

          - 若 `response_mode` 为 `streaming`，返回 `text/event-stream` 及
          `ChunkChatCompletionResponse` 流式序列。
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - &ref_0
                    type: integer
                    description: HTTP 状态码。
                    nullable: true
              code:
                allOf:
                  - &ref_1
                    type: string
                    description: 错误码。
                    nullable: true
              message:
                allOf:
                  - &ref_2
                    type: string
                    description: 错误消息。
            description: 错误响应结构。
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: >-
          错误的请求。可能原因：`invalid_param`（参数异常），`app_unavailable`（App
          配置不可用），`provider_not_initialize`（无可用模型凭据），`provider_quota_exceeded`（额度不足），`model_currently_not_support`（模型不可用），`completion_request_error`（文本生成失败）。
    '404':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - *ref_0
              code:
                allOf:
                  - *ref_1
              message:
                allOf:
                  - *ref_2
            description: 错误响应结构。
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: 对话不存在。
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - *ref_0
              code:
                allOf:
                  - *ref_1
              message:
                allOf:
                  - *ref_2
            description: 错误响应结构。
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: 服务内部异常。
  deprecated: false
  type: path
components:
  schemas:
    InputFileObject:
      type: object
      required:
        - type
        - transfer_method
      properties:
        type:
          type: string
          enum:
            - image
          description: 支持类型：图片 `image`。
        transfer_method:
          type: string
          enum:
            - remote_url
            - local_file
          description: 传递方式：`remote_url` (图片地址) 或 `local_file` (上传文件)。
        url:
          type: string
          format: url
          description: 图片地址（当传递方式为 `remote_url` 时）。
        upload_file_id:
          type: string
          description: 上传文件 ID（当传递方式为 `local_file` 时，需通过文件上传 API 预先获取）。
      oneOf:
        - required:
            - url
        - required:
            - upload_file_id
    ResponseMetadata:
      type: object
      description: 元数据。
      properties:
        usage:
          $ref: '#/components/schemas/Usage'
        retriever_resources:
          type: array
          items:
            $ref: '#/components/schemas/RetrieverResource'
          description: 引用和归属分段列表。
    Usage:
      type: object
      description: 模型用量信息。
      properties:
        prompt_tokens:
          type: integer
        prompt_unit_price:
          type: string
        prompt_price_unit:
          type: string
        prompt_price:
          type: string
        completion_tokens:
          type: integer
        completion_unit_price:
          type: string
        completion_price_unit:
          type: string
        completion_price:
          type: string
        total_tokens:
          type: integer
        total_price:
          type: string
        currency:
          type: string
        latency:
          type: number
          format: double
    RetrieverResource:
      type: object
      description: 引用和归属分段信息。
      properties:
        position:
          type: integer
        dataset_id:
          type: string
          format: uuid
        dataset_name:
          type: string
        document_id:
          type: string
          format: uuid
        document_name:
          type: string
        segment_id:
          type: string
          format: uuid
        score:
          type: number
          format: float
        content:
          type: string

# 停止响应

> 停止生成任务，仅支持流式模式。

## OpenAPI

````yaml zh-hans/openapi_completion.json post /completion-messages/{task_id}/stop
paths:
  path: /completion-messages/{task_id}/stop
  method: post
  servers:
    - url: '{api_base_url}'
      description: API 的基础 URL。请将 {api_base_url} 替换为您的应用提供的实际 API 基础 URL。
      variables:
        api_base_url:
          type: string
          description: 实际的 API 基础 URL
          default: https://api.dify.ai/v1
  request:
    security:
      - title: ApiKeyAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                API-Key 鉴权。所有 API 请求都应在 `Authorization` HTTP Header 中包含您的
                API-Key，格式为 `Bearer {API_KEY}`。**强烈建议开发者把 API-Key
                放在后端存储，而非分享或者放在客户端存储，以免 API-Key 泄露，导致财产损失。**
          cookie: {}
    parameters:
      path:
        task_id:
          schema:
            - type: string
              required: true
              description: 任务 ID，可在流式返回 Chunk 中获取。
              format: uuid
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              user:
                allOf:
                  - type: string
                    description: 用户标识，必须和发送消息接口传入 user 保持一致。
            required: true
            requiredProperties:
              - user
        examples:
          example:
            value:
              user: <string>
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              result:
                allOf:
                  - type: string
                    example: success
        examples:
          example:
            value:
              result: success
        description: 操作成功。
  deprecated: false
  type: path
components:
  schemas: {}

# 上传文件

> 上传文件（目前仅支持图片）并在发送消息时使用，可实现图文多模态理解。支持 png, jpg, jpeg, webp, gif 格式。上传的文件仅供当前终端用户使用。

## OpenAPI

````yaml zh-hans/openapi_completion.json post /files/upload
paths:
  path: /files/upload
  method: post
  servers:
    - url: '{api_base_url}'
      description: API 的基础 URL。请将 {api_base_url} 替换为您的应用提供的实际 API 基础 URL。
      variables:
        api_base_url:
          type: string
          description: 实际的 API 基础 URL
          default: https://api.dify.ai/v1
  request:
    security:
      - title: ApiKeyAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                API-Key 鉴权。所有 API 请求都应在 `Authorization` HTTP Header 中包含您的
                API-Key，格式为 `Bearer {API_KEY}`。**强烈建议开发者把 API-Key
                放在后端存储，而非分享或者放在客户端存储，以免 API-Key 泄露，导致财产损失。**
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      multipart/form-data:
        schemaArray:
          - type: object
            properties:
              file:
                allOf:
                  - type: string
                    format: binary
                    description: 要上传的文件。支持的图片类型：png, jpg, jpeg, webp, gif。
              user:
                allOf:
                  - type: string
                    description: 用户标识，由开发者定义规则，需保证用户标识在应用内唯一，必须和发送消息接口传入 user 保持一致。
            required: true
            requiredProperties:
              - file
              - user
        examples:
          example:
            value:
              user: <string>
        description: 文件上传请求，需使用 `multipart/form-data`。
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              id:
                allOf:
                  - &ref_0
                    type: string
                    format: uuid
                    description: ID。
              name:
                allOf:
                  - &ref_1
                    type: string
                    description: 文件名。
              size:
                allOf:
                  - &ref_2
                    type: integer
                    description: 文件大小（byte）。
              extension:
                allOf:
                  - &ref_3
                    type: string
                    description: 文件后缀。
              mime_type:
                allOf:
                  - &ref_4
                    type: string
                    description: 文件 mime-type。
              created_by:
                allOf:
                  - &ref_5
                    type: string
                    format: uuid
                    description: 上传人 ID (示例中为integer，规范为uuid)。
              created_at:
                allOf:
                  - &ref_6
                    type: integer
                    format: int64
                    description: 上传时间。
            description: 文件上传成功后的响应。
            refIdentifier: '#/components/schemas/FileUploadResponse'
        examples:
          example:
            value:
              id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              name: <string>
              size: 123
              extension: <string>
              mime_type: <string>
              created_by: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              created_at: 123
        description: 文件上传成功。
    '201':
      application/json:
        schemaArray:
          - type: object
            properties:
              id:
                allOf:
                  - *ref_0
              name:
                allOf:
                  - *ref_1
              size:
                allOf:
                  - *ref_2
              extension:
                allOf:
                  - *ref_3
              mime_type:
                allOf:
                  - *ref_4
              created_by:
                allOf:
                  - *ref_5
              created_at:
                allOf:
                  - *ref_6
            description: 文件上传成功后的响应。
            refIdentifier: '#/components/schemas/FileUploadResponse'
        examples:
          example:
            value:
              id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              name: <string>
              size: 123
              extension: <string>
              mime_type: <string>
              created_by: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              created_at: 123
        description: 文件创建成功 (备选成功状态码)。
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - &ref_7
                    type: integer
                    description: HTTP 状态码。
                    nullable: true
              code:
                allOf:
                  - &ref_8
                    type: string
                    description: 错误码。
                    nullable: true
              message:
                allOf:
                  - &ref_9
                    type: string
                    description: 错误消息。
            description: 错误响应结构。
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: >-
          文件操作相关的错误请求。可能原因：`no_file_uploaded`，`too_many_files`，`unsupported_preview`，`unsupported_estimate`。
    '413':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - *ref_7
              code:
                allOf:
                  - *ref_8
              message:
                allOf:
                  - *ref_9
            description: 错误响应结构。
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: 文件太大 (`file_too_large`)。
    '415':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - *ref_7
              code:
                allOf:
                  - *ref_8
              message:
                allOf:
                  - *ref_9
            description: 错误响应结构。
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: 不支持的文件类型 (`unsupported_file_type`)。
    '503':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - *ref_7
              code:
                allOf:
                  - *ref_8
              message:
                allOf:
                  - *ref_9
            description: 错误响应结构。
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: >-
          S3
          存储服务错误。可能原因：`s3_connection_failed`，`s3_permission_denied`，`s3_file_too_large`。
  deprecated: false
  type: path
components:
  schemas: {}

# 文字转语音

> 将文本内容转换为语音。

## OpenAPI

````yaml zh-hans/openapi_completion.json post /text-to-audio
paths:
  path: /text-to-audio
  method: post
  servers:
    - url: '{api_base_url}'
      description: API 的基础 URL。请将 {api_base_url} 替换为您的应用提供的实际 API 基础 URL。
      variables:
        api_base_url:
          type: string
          description: 实际的 API 基础 URL
          default: https://api.dify.ai/v1
  request:
    security:
      - title: ApiKeyAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                API-Key 鉴权。所有 API 请求都应在 `Authorization` HTTP Header 中包含您的
                API-Key，格式为 `Bearer {API_KEY}`。**强烈建议开发者把 API-Key
                放在后端存储，而非分享或者放在客户端存储，以免 API-Key 泄露，导致财产损失。**
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              message_id:
                allOf:
                  - type: string
                    format: uuid
                    description: Dify 生成的消息 ID（优先使用）。
              text:
                allOf:
                  - type: string
                    description: 语音生成内容（若无 message_id）。
              user:
                allOf:
                  - type: string
                    description: 用户标识，应用内唯一。
              streaming:
                allOf:
                  - type: boolean
                    default: false
                    description: 是否流式返回音频。
            required: true
            description: 文字转语音请求体。
            refIdentifier: '#/components/schemas/TextToAudioRequest'
            requiredProperties:
              - user
            example:
              message_id: 5ad4cb98-f0c7-4085-b384-88c403be6290
              text: 你好Dify
              user: abc-123
              streaming: false
        examples:
          example:
            value:
              message_id: 5ad4cb98-f0c7-4085-b384-88c403be6290
              text: 你好Dify
              user: abc-123
              streaming: false
  response:
    '200':
      audio/wav:
        schemaArray:
          - type: file
            contentEncoding: binary
            description: 生成的 WAV 格式音频文件。
        examples:
          example: {}
        description: 语音文件生成成功。
      audio/mp3:
        schemaArray:
          - type: file
            contentEncoding: binary
            description: 生成的 MP3 格式音频文件。
        examples:
          example: {}
        description: 语音文件生成成功。
  deprecated: false
  type: path
components:
  schemas: {}

# 文字转语音

> 将文本内容转换为语音。

## OpenAPI

````yaml zh-hans/openapi_completion.json post /text-to-audio
paths:
  path: /text-to-audio
  method: post
  servers:
    - url: '{api_base_url}'
      description: API 的基础 URL。请将 {api_base_url} 替换为您的应用提供的实际 API 基础 URL。
      variables:
        api_base_url:
          type: string
          description: 实际的 API 基础 URL
          default: https://api.dify.ai/v1
  request:
    security:
      - title: ApiKeyAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                API-Key 鉴权。所有 API 请求都应在 `Authorization` HTTP Header 中包含您的
                API-Key，格式为 `Bearer {API_KEY}`。**强烈建议开发者把 API-Key
                放在后端存储，而非分享或者放在客户端存储，以免 API-Key 泄露，导致财产损失。**
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              message_id:
                allOf:
                  - type: string
                    format: uuid
                    description: Dify 生成的消息 ID（优先使用）。
              text:
                allOf:
                  - type: string
                    description: 语音生成内容（若无 message_id）。
              user:
                allOf:
                  - type: string
                    description: 用户标识，应用内唯一。
              streaming:
                allOf:
                  - type: boolean
                    default: false
                    description: 是否流式返回音频。
            required: true
            description: 文字转语音请求体。
            refIdentifier: '#/components/schemas/TextToAudioRequest'
            requiredProperties:
              - user
            example:
              message_id: 5ad4cb98-f0c7-4085-b384-88c403be6290
              text: 你好Dify
              user: abc-123
              streaming: false
        examples:
          example:
            value:
              message_id: 5ad4cb98-f0c7-4085-b384-88c403be6290
              text: 你好Dify
              user: abc-123
              streaming: false
  response:
    '200':
      audio/wav:
        schemaArray:
          - type: file
            contentEncoding: binary
            description: 生成的 WAV 格式音频文件。
        examples:
          example: {}
        description: 语音文件生成成功。
      audio/mp3:
        schemaArray:
          - type: file
            contentEncoding: binary
            description: 生成的 MP3 格式音频文件。
        examples:
          example: {}
        description: 语音文件生成成功。
  deprecated: false
  type: path
components:
  schemas: {}

# 获取应用参数

> 用于进入页面一开始，获取功能开关、输入参数名称、类型及默认值等使用。

## OpenAPI

````yaml zh-hans/openapi_completion.json get /parameters
paths:
  path: /parameters
  method: get
  servers:
    - url: '{api_base_url}'
      description: API 的基础 URL。请将 {api_base_url} 替换为您的应用提供的实际 API 基础 URL。
      variables:
        api_base_url:
          type: string
          description: 实际的 API 基础 URL
          default: https://api.dify.ai/v1
  request:
    security:
      - title: ApiKeyAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                API-Key 鉴权。所有 API 请求都应在 `Authorization` HTTP Header 中包含您的
                API-Key，格式为 `Bearer {API_KEY}`。**强烈建议开发者把 API-Key
                放在后端存储，而非分享或者放在客户端存储，以免 API-Key 泄露，导致财产损失。**
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              opening_statement:
                allOf:
                  - type: string
                    description: 开场白。
                    example: nice to meet you
              suggested_questions:
                allOf:
                  - type: array
                    items:
                      type: string
                    description: 开场推荐问题列表。
              suggested_questions_after_answer:
                allOf:
                  - type: object
                    properties:
                      enabled:
                        type: boolean
                        description: 是否开启回答后推荐问题。
              speech_to_text:
                allOf:
                  - type: object
                    properties:
                      enabled:
                        type: boolean
                        description: 是否开启语音转文本。
              retriever_resource:
                allOf:
                  - type: object
                    properties:
                      enabled:
                        type: boolean
                        description: 是否开启引用和归属。
              annotation_reply:
                allOf:
                  - type: object
                    properties:
                      enabled:
                        type: boolean
                        description: 是否开启标记回复。
              user_input_form:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/UserInputFormItem'
                    description: 用户输入表单配置。
              file_upload:
                allOf:
                  - $ref: '#/components/schemas/FileUploadSetting'
              system_parameters:
                allOf:
                  - $ref: '#/components/schemas/SystemParameters'
            description: 应用参数信息。
            refIdentifier: '#/components/schemas/AppParametersResponseCompletion'
        examples:
          example:
            value:
              opening_statement: nice to meet you
              suggested_questions:
                - <string>
              suggested_questions_after_answer:
                enabled: true
              speech_to_text:
                enabled: true
              retriever_resource:
                enabled: true
              annotation_reply:
                enabled: true
              user_input_form:
                - text-input:
                    label: <string>
                    variable: <string>
                    required: true
                    default: <string>
                    max_length: 123
              file_upload:
                image:
                  enabled: true
                  number_limits: 123
                  detail: <string>
                  transfer_methods:
                    - remote_url
              system_parameters:
                file_size_limit: 123
                image_file_size_limit: 123
                audio_file_size_limit: 123
                video_file_size_limit: 123
        description: 应用的参数信息。
  deprecated: false
  type: path
components:
  schemas:
    UserInputFormItem:
      type: object
      description: 用户输入表单中的一个控件。
      oneOf:
        - $ref: '#/components/schemas/TextInputControlWrapper'
        - $ref: '#/components/schemas/ParagraphControlWrapper'
        - $ref: '#/components/schemas/SelectControlWrapper'
    TextInputControlWrapper:
      type: object
      properties:
        text-input:
          $ref: '#/components/schemas/TextInputControl'
      required:
        - text-input
    ParagraphControlWrapper:
      type: object
      properties:
        paragraph:
          $ref: '#/components/schemas/ParagraphControl'
      required:
        - paragraph
    SelectControlWrapper:
      type: object
      properties:
        select:
          $ref: '#/components/schemas/SelectControl'
      required:
        - select
    TextInputControl:
      type: object
      description: 文本输入控件。
      required:
        - label
        - variable
        - required
      properties:
        label:
          type: string
          description: 控件展示标签名。
        variable:
          type: string
          description: 控件 ID。
        required:
          type: boolean
          description: 是否必填。
        default:
          type: string
          description: 默认值。
        max_length:
          type: integer
          description: 最大长度 (来自示例)。
          nullable: true
    ParagraphControl:
      type: object
      description: 段落文本输入控件。
      required:
        - label
        - variable
        - required
      properties:
        label:
          type: string
          description: 控件展示标签名。
        variable:
          type: string
          description: 控件 ID。
        required:
          type: boolean
          description: 是否必填。
        default:
          type: string
          description: 默认值。
    SelectControl:
      type: object
      description: 下拉控件。
      required:
        - label
        - variable
        - required
        - options
      properties:
        label:
          type: string
          description: 控件展示标签名。
        variable:
          type: string
          description: 控件 ID。
        required:
          type: boolean
          description: 是否必填。
        default:
          type: string
          description: 默认值。
        options:
          type: array
          items:
            type: string
          description: 选项值。
    FileUploadSetting:
      type: object
      description: 文件上传配置。
      properties:
        image:
          type: object
          description: 图片设置。当前仅支持图片类型：`png`, `jpg`, `jpeg`, `webp`, `gif`。
          properties:
            enabled:
              type: boolean
              description: 是否开启。
            number_limits:
              type: integer
              description: 图片数量限制，默认 3。
            detail:
              type: string
              description: 图片细节 (来自示例)。
              nullable: true
            transfer_methods:
              type: array
              items:
                type: string
                enum:
                  - remote_url
                  - local_file
              description: 传递方式列表，remote_url , local_file，必选一个。
    SystemParameters:
      type: object
      description: 系统参数。
      properties:
        file_size_limit:
          type: integer
          description: 文档上传大小限制 (MB)。
        image_file_size_limit:
          type: integer
          description: 图片文件上传大小限制（MB）。
        audio_file_size_limit:
          type: integer
          description: 音频文件上传大小限制 (MB)。
        video_file_size_limit:
          type: integer
          description: 视频文件上传大小限制 (MB)。


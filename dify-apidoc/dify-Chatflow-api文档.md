# 发送对话消息

> 创建会话消息。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json post /chat-messages
paths:
  path: /chat-messages
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
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
              query:
                allOf:
                  - type: string
                    description: 用户输入/提问内容。
              inputs:
                allOf:
                  - type: object
                    description: 允许传入 App 定义的各变量值。如果变量是文件类型，请指定一个 InputFileObjectCn 对象。
                    additionalProperties:
                      oneOf:
                        - type: string
                        - type: number
                        - type: boolean
                        - $ref: '#/components/schemas/InputFileObjectCn'
                    default: {}
              response_mode:
                allOf:
                  - type: string
                    enum:
                      - streaming
                      - blocking
                    default: streaming
                    description: >-
                      响应模式。streaming (推荐) 基于 SSE；blocking 等待执行完毕后返回 (Cloudflare
                      100秒超时限制)。
              user:
                allOf:
                  - type: string
                    description: 用户标识，应用内唯一。
              conversation_id:
                allOf:
                  - type: string
                    format: uuid
                    description: （选填）会话 ID，用于继续之前的对话。
              files:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/InputFileObjectCn'
                    description: （选填）文件列表，仅当模型支持 Vision 能力时可用。
              auto_generate_name:
                allOf:
                  - type: boolean
                    default: true
                    description: （选填）自动生成会话标题，默认 true。
            required: true
            refIdentifier: '#/components/schemas/ChatRequestCn'
            requiredProperties:
              - query
              - user
        examples:
          streaming_with_file:
            summary: 包含文件和自定义输入的流式请求示例
            value:
              inputs:
                name: dify
              query: iPhone 13 Pro Max 的规格是什么？
              response_mode: streaming
              conversation_id: 101b4c97-fc2e-463c-90b1-5261a4cdcafb
              user: abc-123
              files:
                - type: image
                  transfer_method: remote_url
                  url: https://cloud.dify.ai/logo/logo-site.png
        description: 发送对话消息的请求体。
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              event:
                allOf:
                  - type: string
                    example: message
                    description: 事件类型，固定为 `message`。
              task_id:
                allOf:
                  - type: string
                    format: uuid
                    description: 任务 ID。
              id:
                allOf:
                  - type: string
                    format: uuid
                    description: 唯一ID。
              message_id:
                allOf:
                  - type: string
                    format: uuid
                    description: 消息唯一 ID。
              conversation_id:
                allOf:
                  - type: string
                    format: uuid
                    description: 会话 ID。
              mode:
                allOf:
                  - type: string
                    example: chat
                    description: App 模式，固定为 `chat`。
              answer:
                allOf:
                  - type: string
                    description: 完整回复内容。
              metadata:
                allOf:
                  - $ref: '#/components/schemas/ResponseMetadataCn'
              created_at:
                allOf:
                  - type: integer
                    format: int64
                    description: 消息创建时间戳。
            description: 阻塞模式下的完整 App 结果。
            refIdentifier: '#/components/schemas/ChatCompletionResponseCn'
        examples:
          example:
            value:
              event: message
              task_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              message_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              conversation_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              mode: chat
              answer: <string>
              metadata:
                usage:
                  prompt_tokens: 123
                  prompt_unit_price: <string>
                  prompt_price_unit: <string>
                  prompt_price: <string>
                  completion_tokens: 123
                  completion_unit_price: <string>
                  completion_price_unit: <string>
                  completion_price: <string>
                  total_tokens: 123
                  total_price: <string>
                  currency: <string>
                  latency: 123
                retriever_resources:
                  - position: 123
                    dataset_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                    dataset_name: <string>
                    document_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                    document_name: <string>
                    segment_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                    score: 123
                    content: <string>
              created_at: 123
        description: >-
          请求成功。响应的内容类型和结构取决于请求中的 `response_mode` 参数。

          - 当 `response_mode` 为 `blocking` 时，返回 `application/json` 格式的
          `ChatCompletionResponseCn` 对象。

          - 当 `response_mode` 为 `streaming` 时，返回 `text/event-stream` 格式的
          `ChunkChatEventCn` 对象流式序列。
      text/event-stream:
        schemaArray:
          - type: string
            description: 'SSE 事件流。每个事件以 ''data: '' 开头，以 ''\n\n'' 结尾。具体结构请参见 `ChunkChatEventCn`。'
        examples:
          example:
            value: <string>
        description: >-
          请求成功。响应的内容类型和结构取决于请求中的 `response_mode` 参数。

          - 当 `response_mode` 为 `blocking` 时，返回 `application/json` 格式的
          `ChatCompletionResponseCn` 对象。

          - 当 `response_mode` 为 `streaming` 时，返回 `text/event-stream` 格式的
          `ChunkChatEventCn` 对象流式序列。
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - &ref_0
                    type: integer
                    nullable: true
                    description: HTTP 状态码。
              code:
                allOf:
                  - &ref_1
                    type: string
                    nullable: true
                    description: 错误码。
              message:
                allOf:
                  - &ref_2
                    type: string
                    description: 错误消息。
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: >-
          请求参数错误。可能原因：invalid_param, app_unavailable, provider_not_initialize,
          provider_quota_exceeded, model_currently_not_support,
          completion_request_error。
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
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
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
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
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
    InputFileObjectCn:
      type: object
      required:
        - type
        - transfer_method
      properties:
        type:
          type: string
          enum:
            - document
            - image
            - audio
            - video
            - custom
          description: >-
            文件类型。document: TXT,MD,PDF等; image: JPG,PNG等; audio: MP3,WAV等; video:
            MP4,MOV等; custom: 其他。
        transfer_method:
          type: string
          enum:
            - remote_url
            - local_file
          description: 传递方式。
        url:
          type: string
          format: url
          description: 图片地址 (当 transfer_method 为 remote_url 时)。
        upload_file_id:
          type: string
          format: uuid
          description: 上传文件 ID (当 transfer_method 为 local_file 时)。
      oneOf:
        - required:
            - url
        - required:
            - upload_file_id
    ResponseMetadataCn:
      type: object
      description: 元数据。
      properties:
        usage:
          $ref: '#/components/schemas/UsageCn'
        retriever_resources:
          type: array
          items:
            $ref: '#/components/schemas/RetrieverResourceCn'
          description: 引用和归属分段列表。
    UsageCn:
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
    RetrieverResourceCn:
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

> 停止生成对话消息。仅支持流式模式。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json post /chat-messages/{task_id}/stop
paths:
  path: /chat-messages/{task_id}/stop
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
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

# 获取下一轮建议问题列表

> 获取当前消息的下一轮建议问题列表。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json get /messages/{message_id}/suggested
paths:
  path: /messages/{message_id}/suggested
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
          cookie: {}
    parameters:
      path:
        message_id:
          schema:
            - type: string
              required: true
              description: 消息 ID。
              format: uuid
      query:
        user:
          schema:
            - type: string
              required: true
              description: 用户标识，由开发者定义规则，需保证用户标识在应用内唯一。
      header: {}
      cookie: {}
    body: {}
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
              data:
                allOf:
                  - type: array
                    items:
                      type: string
                    description: 建议问题列表。
            refIdentifier: '#/components/schemas/SuggestedQuestionsResponseCn'
        examples:
          example:
            value:
              result: success
              data:
                - <string>
        description: 成功获取建议问题列表。
  deprecated: false
  type: path
components:
  schemas: {}

# 上传文件

> 上传文件并在发送消息时使用，可实现图文多模态理解。支持您的应用程序所支持的所有格式。上传的文件仅供当前终端用户使用。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json post /files/upload
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
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
                    description: 要上传的文件。
              user:
                allOf:
                  - type: string
                    description: 用户标识，必须和发送消息接口传入 user 保持一致。
            required: true
            requiredProperties:
              - file
              - user
        examples:
          example:
            value:
              user: <string>
        description: 文件上传请求。需使用 `multipart/form-data` 进行请求。
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
                    description: 文件大小 (byte)。
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
                    description: 上传人 ID (应为 uuid，示例中为 int，已修正)。
              created_at:
                allOf:
                  - &ref_6
                    type: integer
                    format: int64
                    description: 上传时间。
            description: 文件上传成功后的响应。
            refIdentifier: '#/components/schemas/FileUploadResponseCn'
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
            refIdentifier: '#/components/schemas/FileUploadResponseCn'
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
                    nullable: true
                    description: HTTP 状态码。
              code:
                allOf:
                  - &ref_8
                    type: string
                    nullable: true
                    description: 错误码。
              message:
                allOf:
                  - &ref_9
                    type: string
                    description: 错误消息。
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: >-
          文件操作请求错误。可能原因：no_file_uploaded, too_many_files, unsupported_preview,
          unsupported_estimate。
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
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: 文件太大 (file_too_large)。
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
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: 不支持的文件类型 (unsupported_file_type)。
    '500':
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
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: 服务内部异常。
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
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: >-
          S3 存储服务错误。可能原因：s3_connection_failed, s3_permission_denied,
          s3_file_too_large。
  deprecated: false
  type: path
components:
  schemas: {}

# 获取会话历史消息

> 滚动加载形式返回历史聊天记录，第一页返回最新 `limit` 条，即倒序返回。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json get /messages
paths:
  path: /messages
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
          cookie: {}
    parameters:
      path: {}
      query:
        conversation_id:
          schema:
            - type: string
              required: true
              description: 会话 ID。
              format: uuid
        user:
          schema:
            - type: string
              required: true
              description: 用户标识，由开发者定义规则，需保证用户标识在应用内唯一。
        first_id:
          schema:
            - type: string
              description: 当前页第一条聊天记录的 ID，默认 null。
              format: uuid
            - type: 'null'
              description: 当前页第一条聊天记录的 ID，默认 null。
        limit:
          schema:
            - type: integer
              description: 一次请求返回多少条记录，默认 20 条。
              default: 20
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              limit:
                allOf:
                  - type: integer
                    description: 返回条数。
              has_more:
                allOf:
                  - type: boolean
                    description: 是否存在下一页。
              data:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/ConversationMessageItemCn'
                    description: 消息列表。
            refIdentifier: '#/components/schemas/ConversationHistoryResponseCn'
        examples:
          example:
            value:
              limit: 123
              has_more: true
              data:
                - id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                  conversation_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                  inputs: {}
                  query: <string>
                  answer: <string>
                  message_files:
                    - id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                      type: <string>
                      url: <string>
                      belongs_to: user
                  feedback:
                    rating: like
                  retriever_resources:
                    - position: 123
                      dataset_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                      dataset_name: <string>
                      document_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                      document_name: <string>
                      segment_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                      score: 123
                      content: <string>
                  created_at: 123
        description: 成功获取会话历史消息。
  deprecated: false
  type: path
components:
  schemas:
    RetrieverResourceCn:
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
    ConversationMessageItemCn:
      type: object
      description: 会话中的单条消息。
      properties:
        id:
          type: string
          format: uuid
          description: 消息 ID。
        conversation_id:
          type: string
          format: uuid
          description: 会话 ID。
        inputs:
          type: object
          additionalProperties: true
          description: 用户输入参数。
        query:
          type: string
          description: 用户输入/提问内容。
        answer:
          type: string
          description: 回答消息内容。
        message_files:
          type: array
          items:
            $ref: '#/components/schemas/MessageFileItemCn'
          description: 消息文件列表。
        feedback:
          type: object
          nullable: true
          properties:
            rating:
              type: string
              enum:
                - like
                - dislike
              description: 点赞 'like' / 点踩 'dislike'。
          description: 反馈信息。
        retriever_resources:
          type: array
          items:
            $ref: '#/components/schemas/RetrieverResourceCn'
          description: 引用和归属分段列表。
        created_at:
          type: integer
          format: int64
          description: 创建时间。
    MessageFileItemCn:
      type: object
      description: 消息中的文件项。
      properties:
        id:
          type: string
          format: uuid
          description: ID。
        type:
          type: string
          description: 文件类型，例如 'image'。
        url:
          type: string
          format: url
          description: 预览图片地址。
        belongs_to:
          type: string
          enum:
            - user
            - assistant
          description: 文件归属方。

# 获取会话列表

> 获取当前用户的会话列表，默认返回最近的 20 条。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json get /conversations
paths:
  path: /conversations
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
          cookie: {}
    parameters:
      path: {}
      query:
        user:
          schema:
            - type: string
              required: true
              description: 用户标识，由开发者定义规则，需保证用户标识在应用内唯一。
        last_id:
          schema:
            - type: string
              description: （选填）当前页最后面一条记录的 ID，默认 null。
              format: uuid
            - type: 'null'
              description: （选填）当前页最后面一条记录的 ID，默认 null。
        limit:
          schema:
            - type: integer
              description: 一次请求返回多少条记录，默认 20 条，最大 100 条，最小 1 条。
              maximum: 100
              minimum: 1
              default: 20
        sort_by:
          schema:
            - type: enum<string>
              enum:
                - created_at
                - '-created_at'
                - updated_at
                - '-updated_at'
              description: >-
                （选填）排序字段，默认 -updated_at (按更新时间倒序排列)。可选值：created_at, -created_at,
                updated_at, -updated_at。'-' 代表倒序。
              default: '-updated_at'
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              limit:
                allOf:
                  - type: integer
                    description: 返回条数。
              has_more:
                allOf:
                  - type: boolean
              data:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/ConversationListItemCn'
                    description: 会话列表。
            refIdentifier: '#/components/schemas/ConversationsListResponseCn'
        examples:
          example:
            value:
              limit: 123
              has_more: true
              data:
                - id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                  name: <string>
                  inputs: {}
                  status: <string>
                  introduction: <string>
                  created_at: 123
                  updated_at: 123
        description: 成功获取会话列表。
  deprecated: false
  type: path
components:
  schemas:
    ConversationListItemCn:
      type: object
      description: 会话列表中的单项。
      properties:
        id:
          type: string
          format: uuid
          description: 会话 ID。
        name:
          type: string
          description: 会话名称。
        inputs:
          type: object
          additionalProperties: true
          description: 用户输入参数。
        status:
          type: string
          description: 会话状态。
        introduction:
          type: string
          nullable: true
          description: 开场白。
        created_at:
          type: integer
          format: int64
          description: 创建时间。
        updated_at:
          type: integer
          format: int64
          description: 更新时间。

# 删除会话

> 删除一个指定的会话。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json delete /conversations/{conversation_id}
paths:
  path: /conversations/{conversation_id}
  method: delete
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
          cookie: {}
    parameters:
      path:
        conversation_id:
          schema:
            - type: string
              required: true
              description: 会话 ID。
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
                    description: 用户标识。
            required: true
            requiredProperties:
              - user
        examples:
          example:
            value:
              user: <string>
  response:
    '204':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: 会话删除成功，无内容返回。
        examples: {}
        description: 会话删除成功，无内容返回。
  deprecated: false
  type: path
components:
  schemas: {}

# 会话重命名

> 对会话进行重命名。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json post /conversations/{conversation_id}/name
paths:
  path: /conversations/{conversation_id}/name
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
          cookie: {}
    parameters:
      path:
        conversation_id:
          schema:
            - type: string
              required: true
              description: 会话 ID。
              format: uuid
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              name:
                allOf:
                  - type: string
                    nullable: true
                    description: （选填）名称，若 auto_generate 为 true 时可不传。
              auto_generate:
                allOf:
                  - type: boolean
                    default: false
                    description: （选填）自动生成标题，默认 false。
              user:
                allOf:
                  - type: string
                    description: 用户标识。
            required: true
            refIdentifier: '#/components/schemas/ConversationRenameRequestCn'
            requiredProperties:
              - user
        examples:
          example:
            value:
              name: <string>
              auto_generate: false
              user: <string>
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              id:
                allOf:
                  - type: string
                    format: uuid
                    description: 会话 ID。
              name:
                allOf:
                  - type: string
                    description: 会话名称。
              inputs:
                allOf:
                  - type: object
                    additionalProperties: true
                    description: 用户输入参数。
              status:
                allOf:
                  - type: string
                    description: 会话状态。
              introduction:
                allOf:
                  - type: string
                    nullable: true
                    description: 开场白。
              created_at:
                allOf:
                  - type: integer
                    format: int64
                    description: 创建时间。
              updated_at:
                allOf:
                  - type: integer
                    format: int64
                    description: 更新时间。
            description: 会话列表中的单项。
            refIdentifier: '#/components/schemas/ConversationRenameResponseCn'
        examples:
          example:
            value:
              id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              name: <string>
              inputs: {}
              status: <string>
              introduction: <string>
              created_at: 123
              updated_at: 123
        description: 会话重命名成功。
  deprecated: false
  type: path
components:
  schemas: {}

# 获取对话变量

> 从特定对话中检索变量。此端点对于提取对话过程中捕获的结构化数据非常有用。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json get /conversations/{conversation_id}/variables
paths:
  path: /conversations/{conversation_id}/variables
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
          cookie: {}
    parameters:
      path:
        conversation_id:
          schema:
            - type: string
              required: true
              description: 会话 ID。
              format: uuid
      query:
        user:
          schema:
            - type: string
              required: true
              description: 用户标识，由开发者定义规则，需保证用户标识在应用内唯一。
        last_id:
          schema:
            - type: string
              description: （选填）当前页最后面一条记录的 ID，默认 null。
              format: uuid
            - type: 'null'
              description: （选填）当前页最后面一条记录的 ID，默认 null。
        limit:
          schema:
            - type: integer
              description: 一次请求返回多少条记录，默认 20 条，最大 100 条，最小 1 条。
              maximum: 100
              minimum: 1
              default: 20
        variable_name:
          schema:
            - type: string
              description: （选填）按变量名称筛选。
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              limit:
                allOf:
                  - type: integer
                    description: 每页项目数。
              has_more:
                allOf:
                  - type: boolean
                    description: 是否有更多项目。
              data:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/ConversationVariableItemCn'
                    description: 变量列表。
            refIdentifier: '#/components/schemas/ConversationVariablesResponseCn'
        examples:
          example:
            value:
              limit: 123
              has_more: true
              data:
                - id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                  name: <string>
                  value_type: <string>
                  value: <string>
                  description: <string>
                  created_at: 123
                  updated_at: 123
        description: 成功获取对话变量。
    '404':
      application/json:
        schemaArray:
          - type: object
            properties:
              status:
                allOf:
                  - type: integer
                    nullable: true
                    description: HTTP 状态码。
              code:
                allOf:
                  - type: string
                    nullable: true
                    description: 错误码。
              message:
                allOf:
                  - type: string
                    description: 错误消息。
            description: 错误响应。
            refIdentifier: '#/components/schemas/ErrorResponseCn'
        examples:
          example:
            value:
              status: 123
              code: <string>
              message: <string>
        description: 对话不存在。
  deprecated: false
  type: path
components:
  schemas:
    ConversationVariableItemCn:
      type: object
      description: 对话中的变量项。
      properties:
        id:
          type: string
          format: uuid
          description: 变量ID。
        name:
          type: string
          description: 变量名称。
        value_type:
          type: string
          description: 变量类型 (string, number, boolean 等)。
        value:
          type: string
          description: 变量值。
        description:
          type: string
          nullable: true
          description: 变量描述。
        created_at:
          type: integer
          format: int64
          description: 创建时间戳。
        updated_at:
          type: integer
          format: int64
          description: 最后更新时间戳。

# 语音转文字

> 将语音文件转换为文字。支持格式：mp3, mp4, mpeg, mpga, m4a, wav, webm。文件大小限制：15MB。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json post /audio-to-text
paths:
  path: /audio-to-text
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
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
                    description: >-
                      语音文件。支持格式：['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav',
                      'webm']。大小限制：15MB。
              user:
                allOf:
                  - type: string
                    description: 用户标识。
            required: true
            refIdentifier: '#/components/schemas/AudioToTextRequestCn'
            requiredProperties:
              - file
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
              text:
                allOf:
                  - type: string
                    description: 输出文字。
            refIdentifier: '#/components/schemas/AudioToTextResponseCn'
        examples:
          example:
            value:
              text: <string>
        description: 成功将语音转换为文字。
  deprecated: false
  type: path
components:
  schemas: {}

# 文字转语音

> 将文字内容转换为语音。

## OpenAPI

````yaml zh-hans/openapi_chatflow.json post /text-to-audio
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
                API-Key 鉴权。所有 API 请求都应在 Authorization HTTP Header 中包含您的
                API-Key，格式为：Bearer {API_KEY}。强烈建议开发者把 API-Key 放在后端存储，而非客户端，以免泄露。
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
                    description: 消息ID (优先)。
              text:
                allOf:
                  - type: string
                    description: 语音生成内容。
              user:
                allOf:
                  - type: string
                    description: 用户标识。
            required: true
            description: 需要 `user`。提供 `message_id` 或 `text`。
            refIdentifier: '#/components/schemas/TextToAudioJsonRequestCn'
            requiredProperties:
              - user
        examples:
          example:
            value:
              message_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              text: <string>
              user: <string>
  response:
    '200':
      audio/wav:
        schemaArray:
          - type: file
            contentEncoding: binary
        examples:
          example: {}
        description: 成功生成语音文件。
      audio/mp3:
        schemaArray:
          - type: file
            contentEncoding: binary
        examples:
          example: {}
        description: 成功生成语音文件。
  deprecated: false
  type: path
components:
  schemas: {}


# 执行 workflow

> 执行 workflow，没有已发布的 workflow，不可执行。

## OpenAPI

````yaml zh-hans/openapi_workflow.json post /workflows/run
paths:
  path: /workflows/run
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
              inputs:
                allOf:
                  - type: object
                    description: >-
                      允许传入 App 定义的各变量值。如果变量是文件列表类型，该变量对应的值应是
                      InputFileObjectWorkflowCn 对象的列表。
                    additionalProperties:
                      oneOf:
                        - type: string
                        - type: number
                        - type: boolean
                        - type: object
                        - type: array
                          items:
                            $ref: '#/components/schemas/InputFileObjectWorkflowCn'
                    example:
                      user_query: 请帮我翻译这句话。
                      target_language: 法语
              response_mode:
                allOf:
                  - type: string
                    enum:
                      - streaming
                      - blocking
                    description: >-
                      返回响应模式。streaming (推荐) 基于 SSE；blocking 等待执行完毕后返回
                      (Cloudflare 100秒超时限制)。
              user:
                allOf:
                  - type: string
                    description: 用户标识，应用内唯一。
            required: true
            refIdentifier: '#/components/schemas/WorkflowExecutionRequestCn'
            requiredProperties:
              - inputs
              - response_mode
              - user
        examples:
          basic_execution_cn:
            summary: 基础工作流执行示例
            value:
              inputs:
                query: 请总结这段文字：...
              response_mode: streaming
              user: workflow_user_001
          with_file_array_variable_cn:
            summary: 包含文件列表变量的输入示例
            value:
              inputs:
                my_documents:
                  - type: document
                    transfer_method: local_file
                    upload_file_id: 已上传的文件ID_abc
                  - type: image
                    transfer_method: remote_url
                    url: https://example.com/image.jpg
              response_mode: blocking
              user: workflow_user_002
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              workflow_run_id:
                allOf:
                  - type: string
                    format: uuid
                    description: workflow 执行 ID。
              task_id:
                allOf:
                  - type: string
                    format: uuid
                    description: 任务 ID。
              data:
                allOf:
                  - $ref: '#/components/schemas/WorkflowFinishedDataCn'
            description: 阻塞模式下的 workflow 执行结果。
            refIdentifier: '#/components/schemas/WorkflowCompletionResponseCn'
        examples:
          example:
            value:
              workflow_run_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              task_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              data:
                id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                workflow_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                status: running
                outputs: {}
                error: <string>
                elapsed_time: 123
                total_tokens: 123
                total_steps: 0
                created_at: 123
                finished_at: 123
        description: >-
          工作流执行成功。响应结构取决于 `response_mode`。

          - `blocking`: `application/json` 格式，包含 `WorkflowCompletionResponseCn`
          对象。

          - `streaming`: `text/event-stream` 格式，包含 `ChunkWorkflowEventCn` 事件流。
      text/event-stream:
        schemaArray:
          - type: string
            description: >-
              SSE 事件流。每个事件以 'data: ' 开头，以 '\n\n' 结尾。具体结构请参见
              `ChunkWorkflowEventCn`。
        examples:
          example:
            value: <string>
        description: >-
          工作流执行成功。响应结构取决于 `response_mode`。

          - `blocking`: `application/json` 格式，包含 `WorkflowCompletionResponseCn`
          对象。

          - `streaming`: `text/event-stream` 格式，包含 `ChunkWorkflowEventCn` 事件流。
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
          请求参数错误或工作流执行失败。可能错误码：invalid_param, app_unavailable,
          provider_not_initialize, provider_quota_exceeded,
          model_currently_not_support, workflow_request_error。
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
    InputFileObjectWorkflowCn:
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
    WorkflowFinishedDataCn:
      type: object
      description: Workflow 执行结束事件的详细内容。
      required:
        - id
        - workflow_id
        - status
        - created_at
        - finished_at
      properties:
        id:
          type: string
          format: uuid
          description: workflow 执行 ID。
        workflow_id:
          type: string
          format: uuid
          description: 关联 Workflow ID。
        status:
          type: string
          enum:
            - running
            - succeeded
            - failed
            - stopped
          description: 执行状态。
        outputs:
          type: object
          additionalProperties: true
          nullable: true
          description: （可选）输出内容 (JSON)。
        error:
          type: string
          nullable: true
          description: （可选）错误原因。
        elapsed_time:
          type: number
          format: float
          nullable: true
          description: （可选）耗时(秒)。
        total_tokens:
          type: integer
          nullable: true
          description: （可选）总使用 tokens。
        total_steps:
          type: integer
          default: 0
          description: 总步数，默认 0。
        created_at:
          type: integer
          format: int64
          description: 开始时间。
        finished_at:
          type: integer
          format: int64
          description: 结束时间。

# 获取workflow执行情况

> 根据 workflow 执行 ID 获取 workflow 任务当前执行结果。

## OpenAPI

````yaml zh-hans/openapi_workflow.json get /workflows/run/{workflow_run_id}
paths:
  path: /workflows/run/{workflow_run_id}
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
        workflow_run_id:
          schema:
            - type: string
              required: true
              description: workflow 执行 ID，可在流式返回 Chunk 或阻塞模式响应中获取。
              format: uuid
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
              id:
                allOf:
                  - type: string
                    format: uuid
                    description: workflow 执行 ID。
              workflow_id:
                allOf:
                  - type: string
                    format: uuid
                    description: 关联的 Workflow ID。
              status:
                allOf:
                  - type: string
                    enum:
                      - running
                      - succeeded
                      - failed
                      - stopped
                    description: 执行状态。
              inputs:
                allOf:
                  - type: string
                    description: 任务输入内容的 JSON 字符串。
              outputs:
                allOf:
                  - type: object
                    additionalProperties: true
                    nullable: true
                    description: 任务输出内容的 JSON 对象。
              error:
                allOf:
                  - type: string
                    nullable: true
                    description: 错误原因。
              total_steps:
                allOf:
                  - type: integer
                    description: 任务执行总步数。
              total_tokens:
                allOf:
                  - type: integer
                    description: 任务执行总 tokens。
              created_at:
                allOf:
                  - type: integer
                    format: int64
                    description: 任务开始时间。
              finished_at:
                allOf:
                  - type: integer
                    format: int64
                    nullable: true
                    description: 任务结束时间。
              elapsed_time:
                allOf:
                  - type: number
                    format: float
                    nullable: true
                    description: 耗时(秒)。
            description: Workflow 执行详情。
            refIdentifier: '#/components/schemas/WorkflowRunDetailResponseCn'
        examples:
          example:
            value:
              id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              workflow_id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
              status: running
              inputs: <string>
              outputs: {}
              error: <string>
              total_steps: 123
              total_tokens: 123
              created_at: 123
              finished_at: 123
              elapsed_time: 123
        description: 成功获取 workflow 执行详情。
    '404':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: Workflow 执行记录未找到。
        examples: {}
        description: Workflow 执行记录未找到。
  deprecated: false
  type: path
components:
  schemas: {}

# 停止响应 (Workflow Task)

> 停止 workflow 任务的生成。仅支持流式模式。

## OpenAPI

````yaml zh-hans/openapi_workflow.json post /workflows/tasks/{task_id}/stop
paths:
  path: /workflows/tasks/{task_id}/stop
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
                    description: 用户标识，必须和执行 workflow 接口传入的 user 保持一致。
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

# 获取 workflow 日志

> 倒序返回 workflow 日志。

## OpenAPI

````yaml zh-hans/openapi_workflow.json get /workflows/logs
paths:
  path: /workflows/logs
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
        keyword:
          schema:
            - type: string
              description: （可选）关键字。
        status:
          schema:
            - type: enum<string>
              enum:
                - succeeded
                - failed
                - stopped
                - running
              description: （可选）执行状态：succeeded, failed, stopped, running。
        page:
          schema:
            - type: integer
              description: （可选）当前页码, 默认1。
              default: 1
        limit:
          schema:
            - type: integer
              description: （可选）每页条数, 默认20。
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
              page:
                allOf:
                  - type: integer
                    description: 当前页码。
              limit:
                allOf:
                  - type: integer
                    description: 每页条数。
              total:
                allOf:
                  - type: integer
                    description: 总条数。
              has_more:
                allOf:
                  - type: boolean
                    description: 是否还有更多数据。
              data:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/WorkflowLogItemCn'
                    description: 当前页码的数据。
            description: Workflow 日志列表响应。
            refIdentifier: '#/components/schemas/WorkflowLogsResponseCn'
        examples:
          example:
            value:
              page: 123
              limit: 123
              total: 123
              has_more: true
              data:
                - id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                  workflow_run:
                    id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                    version: <string>
                    status: running
                    error: <string>
                    elapsed_time: 123
                    total_tokens: 123
                    total_steps: 123
                    created_at: 123
                    finished_at: 123
                  created_from: <string>
                  created_by_role: <string>
                  created_by_account: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                  created_by_end_user:
                    id: 3c90c3cc-0d44-4b50-8888-8dd25736052a
                    type: <string>
                    is_anonymous: true
                    session_id: <string>
                  created_at: 123
        description: 成功获取 workflow 日志。
  deprecated: false
  type: path
components:
  schemas:
    WorkflowLogItemCn:
      type: object
      description: 单条 Workflow 日志。
      properties:
        id:
          type: string
          format: uuid
          description: 标识。
        workflow_run:
          $ref: '#/components/schemas/WorkflowRunSummaryCn'
          description: Workflow 执行日志。
        created_from:
          type: string
          description: 来源。
        created_by_role:
          type: string
          description: 角色。
        created_by_account:
          type: string
          format: uuid
          nullable: true
          description: （可选）帐号。
        created_by_end_user:
          $ref: '#/components/schemas/EndUserSummaryCn'
          description: 用户。
        created_at:
          type: integer
          format: int64
          description: 创建时间。
    WorkflowRunSummaryCn:
      type: object
      description: Workflow 执行摘要信息。
      properties:
        id:
          type: string
          format: uuid
          description: 标识。
        version:
          type: string
          description: 版本。
        status:
          type: string
          enum:
            - running
            - succeeded
            - failed
            - stopped
          description: 执行状态。
        error:
          type: string
          nullable: true
          description: （可选）错误。
        elapsed_time:
          type: number
          format: float
          description: 耗时，单位秒。
        total_tokens:
          type: integer
          description: 消耗的token数量。
        total_steps:
          type: integer
          description: 执行步骤长度。
        created_at:
          type: integer
          format: int64
          description: 开始时间。
        finished_at:
          type: integer
          format: int64
          nullable: true
          description: 结束时间。
    EndUserSummaryCn:
      type: object
      description: 终端用户信息摘要。
      properties:
        id:
          type: string
          format: uuid
          description: 标识。
        type:
          type: string
          description: 类型。
        is_anonymous:
          type: boolean
          description: 是否匿名。
        session_id:
          type: string
          description: 会话标识。

# 上传文件 (Workflow)

> 上传文件并在执行 workflow 时使用。支持您的工作流程所支持的任何格式。上传的文件仅供当前终端用户使用。

## OpenAPI

````yaml zh-hans/openapi_workflow.json post /files/upload
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
                    description: 用户标识。
            required: true
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
            description: 文件上传成功响应。
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
            description: 文件上传成功响应。
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
        description: 文件创建成功。
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
          文件操作请求错误。可能错误码：no_file_uploaded, too_many_files, unsupported_preview,
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
          S3 存储服务错误。可能错误码：s3_connection_failed, s3_permission_denied,
          s3_file_too_large。
  deprecated: false
  type: path
components:
  schemas: {}

# 获取应用基本信息 (Workflow)

## OpenAPI

````yaml zh-hans/openapi_workflow.json get /info
paths:
  path: /info
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
              name:
                allOf:
                  - type: string
                    description: 应用名称。
              description:
                allOf:
                  - type: string
                    description: 应用描述。
              tags:
                allOf:
                  - type: array
                    items:
                      type: string
                    description: 应用标签。
            description: 应用基本信息。
            refIdentifier: '#/components/schemas/AppInfoResponseCn'
        examples:
          example:
            value:
              name: <string>
              description: <string>
              tags:
                - <string>
        description: 应用基本信息。
  deprecated: false
  type: path
components:
  schemas: {}


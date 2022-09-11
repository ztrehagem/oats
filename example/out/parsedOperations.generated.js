export default [
  {
    operationId: "get-users-userId",
    path: "/users/{userId}",
    method: "get",
    parameters: {
      path: {
        type: "object",
        properties: [
          {
            name: "userId",
            required: true,
            schema: { type: "atom", name: "number" },
          },
        ],
      },
      query: null,
    },
    requestTypes: [],
    responseTypes: [
      {
        status: 200,
        mediaType: "application/json",
        schema: {
          type: "ref",
          url: "file:///home/ztrehagem/repos/oats/example/openapi/api.yaml#/components/schemas/User",
        },
      },
      { status: 404, schema: { type: "atom", name: "void" } },
    ],
  },
  {
    operationId: "patch-users-userId",
    path: "/users/{userId}",
    method: "patch",
    parameters: {
      path: {
        type: "object",
        properties: [
          {
            name: "userId",
            required: true,
            schema: { type: "atom", name: "number" },
          },
        ],
      },
      query: null,
    },
    requestTypes: [
      {
        mediaType: "application/json",
        schema: {
          type: "object",
          properties: [
            {
              name: "firstName",
              schema: { type: "atom", name: "string" },
              required: false,
            },
            {
              name: "lastName",
              schema: { type: "atom", name: "string" },
              required: false,
            },
            {
              name: "email",
              schema: { type: "atom", name: "string" },
              required: false,
            },
            {
              name: "dateOfBirth",
              schema: { type: "atom", name: "string" },
              required: false,
            },
          ],
        },
      },
    ],
    responseTypes: [
      {
        status: 200,
        mediaType: "application/json",
        schema: {
          type: "ref",
          url: "file:///home/ztrehagem/repos/oats/example/openapi/api.yaml#/components/schemas/User",
        },
      },
      { status: 404, schema: { type: "atom", name: "void" } },
      { status: 409, schema: { type: "atom", name: "void" } },
    ],
  },
  {
    operationId: "post-user",
    path: "/user",
    method: "post",
    parameters: { path: null, query: null },
    requestTypes: [
      {
        mediaType: "application/json",
        schema: {
          type: "object",
          properties: [
            {
              name: "firstName",
              schema: { type: "atom", name: "string" },
              required: true,
            },
            {
              name: "lastName",
              schema: { type: "atom", name: "string" },
              required: true,
            },
            {
              name: "email",
              schema: { type: "atom", name: "string" },
              required: true,
            },
            {
              name: "dateOfBirth",
              schema: { type: "atom", name: "string" },
              required: true,
            },
          ],
        },
      },
    ],
    responseTypes: [
      {
        status: 200,
        mediaType: "application/json",
        schema: {
          type: "ref",
          url: "file:///home/ztrehagem/repos/oats/example/openapi/api.yaml#/components/schemas/User",
        },
      },
      { status: 400, schema: { type: "atom", name: "void" } },
      { status: 409, schema: { type: "atom", name: "void" } },
    ],
  },
  {
    operationId: "getFoo",
    path: "/foo",
    method: "get",
    parameters: { path: null, query: null },
    requestTypes: [],
    responseTypes: [
      {
        status: 200,
        mediaType: "application/json",
        schema: {
          type: "ref",
          url: "file:///home/ztrehagem/repos/oats/example/openapi/schemas/Foo.yaml",
        },
      },
    ],
  },
];

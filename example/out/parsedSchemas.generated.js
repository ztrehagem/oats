export default {
  "file:///home/ztrehagem/repos/oats/example/openapi/schemas/Foo.yaml": {
    name: "Foo",
    schema: {
      type: "object",
      properties: [
        {
          name: "foo",
          schema: { type: "atom", name: "string" },
          required: true,
        },
      ],
    },
  },
  "file:///home/ztrehagem/repos/oats/example/openapi/api.yaml#/components/schemas/User":
    {
      name: "User",
      schema: {
        type: "object",
        properties: [
          {
            name: "id",
            schema: { type: "atom", name: "number" },
            required: true,
          },
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
            required: false,
          },
          {
            name: "emailVerified",
            schema: { type: "atom", name: "boolean" },
            required: true,
          },
          {
            name: "createDate",
            schema: { type: "atom", name: "string" },
            required: false,
          },
          {
            name: "foo",
            schema: {
              type: "ref",
              url: "file:///home/ztrehagem/repos/oats/example/openapi/schemas/Foo.yaml",
            },
            required: false,
          },
        ],
      },
    },
};

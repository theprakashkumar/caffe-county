import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "Auth API",
    description: "API for authentication.",
  },
  host: "localhost:6001/api",
  schemes: ["http"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/auth.router.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);

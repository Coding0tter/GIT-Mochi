export type RequestParams = {
  endpoint: string;
  method: "GET" | "POST" | "PUT";
  data?: any;
};

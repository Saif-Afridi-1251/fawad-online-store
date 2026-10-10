import Safepay from "@sfpy/node-core";

export type SafepayEnvironment = "sandbox" | "production";

export function getSafepayConfig() {
  const secretKey = process.env.SAFEPAY_SECRET_KEY?.trim();
  const apiKey = process.env.SAFEPAY_API_KEY?.trim();
  const environment: SafepayEnvironment =
    process.env.SAFEPAY_ENVIRONMENT === "production" ? "production" : "sandbox";
  const intent = process.env.SAFEPAY_INTENT === "MPGS" ? "MPGS" : "CYBERSOURCE";

  if (!secretKey || !apiKey) return null;

  return {
    apiKey,
    environment,
    intent,
    client: new Safepay(secretKey, {
      authType: "secret",
      host:
        environment === "production"
          ? "https://api.getsafepay.com"
          : "https://sandbox.api.getsafepay.com",
      timeout: 15_000,
    }),
  };
}

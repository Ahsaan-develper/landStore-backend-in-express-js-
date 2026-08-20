import { Resend } from "resend";
import { _config } from "./envConfig.js";

const resend = new Resend(_config.RESEND_API_KEY);

export default resend;
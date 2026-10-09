/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import fs from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";

// Arquivos temporários do render ficam em projeto/.tmp (TEMP/TMP no Windows, TMPDIR no Mac/Linux).
const tmp = path.join(process.cwd(), ".tmp");
fs.mkdirSync(tmp, { recursive: true });
process.env.TEMP = tmp;
process.env.TMP = tmp;
process.env.TMPDIR = tmp;

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

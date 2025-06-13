import {Express} from "express";

interface Config {
    prefix?: string;
    directory?: string;
    models: Record<string, Record<string, "text"|"number"|"file"|"boolean"|"date"|boolean>>;
}

export default function(app: Express, config: Config): void;

export function readData(model: string, id: string | undefined): unknown;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { oracleApi } from "./oracleApi";

export interface OracleGameLaunchPayload {
	username: string;
	money: number;
	provider_code: string;
	game_code: string | number;
	game_type: string | number;
}

export interface OracleGameLaunchResult {
	success: boolean;
	url?: string;
	message?: string;
	raw?: unknown;
}

const normalizeLaunchResponse = (raw: unknown): OracleGameLaunchResult => {
	const payload = (raw && typeof raw === "object" ? raw : {}) as any;
	const nestedData = payload?.data && typeof payload.data === "object" ? payload.data : null;
	const source = nestedData || payload;

	const sourceUrl = source?.url;
	const url = typeof sourceUrl === "string" ? sourceUrl : undefined;

	const nestedUrlMessage =
		typeof sourceUrl === "object" && sourceUrl !== null && typeof sourceUrl.message === "string"
			? sourceUrl.message
			: undefined;

	const messageCandidates = [
		source?.message,
		source?.error,
		nestedData?.message,
		nestedData?.error,
		nestedUrlMessage,
		payload?.message,
		payload?.error,
	];

	const message = messageCandidates.find((item) => typeof item === "string");

	const hasSuccessFlag = typeof source?.success === "boolean";
	const success = hasSuccessFlag ? Boolean(source.success && url) : Boolean(url);

	return {
		success,
		url,
		message: success ? undefined : message || "Unable to launch game",
		raw,
	};
};

export const oracleGameApi = {
	async launchGame(payload: OracleGameLaunchPayload) {
		const response = await oracleApi.post("/admin/games/launch", payload);
		return normalizeLaunchResponse(response.data);
	},
};

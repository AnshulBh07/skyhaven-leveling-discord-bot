interface ICognitionJob {
	id: string;
	userId: string;
	interaction: string;
	createdAt: number;
}

export const CognitionQueue: ICognitionJob[] = [];

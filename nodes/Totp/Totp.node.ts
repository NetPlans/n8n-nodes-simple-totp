import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import * as OTPAuth from 'otpauth';

export class Totp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'TOTP',
		name: 'totp',
		icon: 'fa:fingerprint',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Generate a time-based one-time password',
		defaults: {
			name: 'TOTP',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'TOTP Key',
				name: 'totpKey',
				type: 'string',
				default: '',
				placeholder: '',
				description: 'The TOTP key to use for token generation',
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const token = this.getNodeParameter("totpKey",0,"") as string;


		const options = {
			algorithm: "SHA1",
			digits: 6,
			period: 30
		};

		const totp = new OTPAuth.TOTP({
			secret: token,
			algorithm: options.algorithm,
			digits: options.digits,
			period: options.period,
		});

		const code = totp.generate();

		const secondsRemaining =
			(options.period * (1 - ((Date.now() / 1000 / options.period) % 1))) | 0;

		for (let i = 0; i < items.length; i++) {
			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray({ code, secondsRemaining }),
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);
		}

		return [returnData];
	}
}

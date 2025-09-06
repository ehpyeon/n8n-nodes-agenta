import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AgentaApi implements ICredentialType {
	name = 'agentaApi';

	displayName = 'Agenta API';

	documentationUrl = 'https://docs.agenta.ai';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'The API Key from Agenta Console',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=ApiKey {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://cloud.agenta.ai',
			url: '/api/api/variants/configs/fetch',
			method: 'POST',
			body: {
				environment_ref: {
					slug: 'development',
					version: null,
					id: null,
				},
				application_ref: {
					slug: 'test',
					version: null,
					id: null,
				},
			},
		},
	};
}
